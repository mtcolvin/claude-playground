/**
 * Phase 15: Medical File Upload & DICOM Viewer UI
 */

'use client'

import { useState, useRef } from 'react'

interface MedicalFile {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadDate: string
  category?: string
  description?: string
  tags?: string[]
  metadata?: Record<string, any>
  fileUrl?: string
  encrypted?: boolean
}

interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'encrypting' | 'complete' | 'error'
  error?: string
}

export function MedicalFileUpload() {
  const [files, setFiles] = useState<MedicalFile[]>([])
  const [selectedFile, setSelectedFile] = useState<MedicalFile | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const CATEGORIES = [
    { value: 'all', label: 'All Files', icon: '📁' },
    { value: 'lab_results', label: 'Lab Results', icon: '🔬' },
    { value: 'imaging', label: 'Imaging (DICOM)', icon: '🏥' },
    { value: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { value: 'reports', label: 'Medical Reports', icon: '📄' },
    { value: 'insurance', label: 'Insurance', icon: '🏛️' },
    { value: 'other', label: 'Other', icon: '📎' },
  ]

  const SUPPORTED_FORMATS = {
    'DICOM Images': ['.dcm', '.dicom'],
    'Medical Images': ['.jpg', '.jpeg', '.png', '.tiff', '.bmp'],
    'Documents': ['.pdf', '.doc', '.docx'],
    'Data Files': ['.csv', '.xlsx', '.json', '.xml', '.hl7'],
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    await uploadFiles(droppedFiles)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      await uploadFiles(selectedFiles)
    }
  }

  const uploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true)

    // Initialize progress tracking
    const progressEntries = filesToUpload.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const,
    }))
    setUploadProgress(progressEntries)

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]

      try {
        // Update status to uploading
        setUploadProgress(prev => prev.map((p, idx) =>
          idx === i ? { ...p, progress: 10, status: 'uploading' } : p
        ))

        // Create FormData
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', 'other') // Would come from user selection in full implementation

        // Simulate upload progress
        setUploadProgress(prev => prev.map((p, idx) =>
          idx === i ? { ...p, progress: 50 } : p
        ))

        // Upload file
        const response = await fetch('/api/v1/medical-files', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()

        // Update to encrypting
        setUploadProgress(prev => prev.map((p, idx) =>
          idx === i ? { ...p, progress: 75, status: 'encrypting' } : p
        ))

        // Simulate encryption time
        await new Promise(resolve => setTimeout(resolve, 500))

        // Complete
        setUploadProgress(prev => prev.map((p, idx) =>
          idx === i ? { ...p, progress: 100, status: 'complete' } : p
        ))

        if (data.success) {
          setFiles(prev => [data.data, ...prev])
        }
      } catch (error) {
        setUploadProgress(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'error', error: 'Upload failed' } : p
        ))
      }
    }

    setIsUploading(false)
    setTimeout(() => setUploadProgress([]), 3000)
  }

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/v1/medical-files?sortBy=uploadDate&sortOrder=desc')
      const data = await response.json()
      if (data.success) {
        setFiles(data.data)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/v1/medical-files/${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        if (selectedFile?.id === fileId) {
          setSelectedFile(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileType: string): string => {
    if (fileType.includes('dicom') || fileType === 'application/dicom') return '🏥'
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType === 'application/pdf') return '📄'
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    return '📎'
  }

  const filteredFiles = filterCategory === 'all'
    ? files
    : files.filter(f => f.category === filterCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Medical Files</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".dcm,.dicom,.jpg,.jpeg,.png,.pdf,.doc,.docx,.csv,.xlsx,.json,.xml"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Uploading Files</h3>
          {uploadProgress.map((progress, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-900">{progress.fileName}</span>
                <span className={`text-xs font-medium ${
                  progress.status === 'complete' ? 'text-green-600' :
                  progress.status === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {progress.status === 'uploading' && `${progress.progress}% Uploading...`}
                  {progress.status === 'encrypting' && 'Encrypting...'}
                  {progress.status === 'complete' && '✓ Complete'}
                  {progress.status === 'error' && progress.error}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    progress.status === 'complete' ? 'bg-green-500' :
                    progress.status === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-800">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-xs text-gray-800">
          DICOM, PDF, Images, Documents (up to 50MB each)
        </p>

        {/* Supported Formats */}
        <div className="mt-4 grid grid-cols-2 gap-2 max-w-2xl mx-auto text-left">
          {Object.entries(SUPPORTED_FORMATS).map(([category, extensions]) => (
            <div key={category} className="text-xs text-gray-800">
              <span className="font-medium">{category}:</span> {extensions.join(', ')}
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
              filterCategory === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => setSelectedFile(file)}
            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedFile?.id === file.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {file.fileName}
                    </div>
                    <div className="text-sm text-gray-800">
                      {formatFileSize(file.fileSize)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-800">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </div>
                </div>

                {file.category && (
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-900 text-xs rounded">
                    {CATEGORIES.find(c => c.value === file.category)?.label || file.category}
                  </span>
                )}

                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {file.tags.map((tag: string, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteFile(file.id)
                }}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12 text-gray-800">
          No files found. Upload your first medical file to get started.
        </div>
      )}

      {/* File Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedFile.fileName}</h2>
                <p className="text-sm text-gray-800">{formatFileSize(selectedFile.fileSize)}</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 text-gray-800 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* File Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <span className="text-gray-800">File Type:</span>{' '}
                  <span className="font-medium">{selectedFile.fileType}</span>
                </div>
                <div>
                  <span className="text-gray-800">Uploaded:</span>{' '}
                  <span className="font-medium">
                    {new Date(selectedFile.uploadDate).toLocaleString()}
                  </span>
                </div>
                {selectedFile.category && (
                  <div>
                    <span className="text-gray-800">Category:</span>{' '}
                    <span className="font-medium">
                      {CATEGORIES.find(c => c.value === selectedFile.category)?.label}
                    </span>
                  </div>
                )}
              </div>

              {/* DICOM Metadata (if applicable) */}
              {selectedFile.fileType.includes('dicom') && selectedFile.metadata && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">DICOM Metadata</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedFile.metadata).slice(0, 10).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-800">{key}:</span>{' '}
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Preview Placeholder */}
              <div className="bg-gray-100 rounded-lg p-12 text-center">
                <span className="text-6xl">{getFileIcon(selectedFile.fileType)}</span>
                <p className="mt-4 text-gray-800">
                  {selectedFile.fileType.includes('dicom') && 'DICOM Viewer integration would render here'}
                  {selectedFile.fileType === 'application/pdf' && 'PDF Viewer would render here'}
                  {selectedFile.fileType.startsWith('image/') && 'Image preview would render here'}
                  {!selectedFile.fileType.includes('dicom') &&
                   selectedFile.fileType !== 'application/pdf' &&
                   !selectedFile.fileType.startsWith('image/') &&
                   'File preview not available for this type'}
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Download File
                </button>
              </div>

              {selectedFile.description && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
                  <p className="text-gray-900 text-sm">{selectedFile.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
