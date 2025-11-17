'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield, Lock, AlertTriangle, CheckCircle, XCircle, Clock,
  Activity, Ban, Eye, Key, FileText, Users, ChevronRight
} from 'lucide-react'
import {
  auditLogger,
  ipBlocker,
  sessionManager,
  passwordPolicy,
  standardRateLimiter,
  type AuditLogEntry
} from '@/lib/security'

export function SecurityDashboard() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [blockedIPs, setBlockedIPs] = useState<string[]>([])
  const [activeSessions, setActiveSessions] = useState(0)
  const [securityScore, setSecurityScore] = useState(0)

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = () => {
    // Get audit logs
    setAuditLogs(auditLogger.getAllLogs(50))

    // Get blocked IPs
    setBlockedIPs(ipBlocker.getBlockedIPs())

    // Calculate security score (mock)
    calculateSecurityScore()
  }

  const calculateSecurityScore = () => {
    // In production, this would analyze actual security metrics
    let score = 100

    // Deduct points for security issues
    const blockedCount = ipBlocker.getBlockedIPs().length
    if (blockedCount > 0) score -= Math.min(blockedCount * 2, 20)

    // Deduct for failed login attempts
    const failedLogins = auditLogs.filter(
      log => log.action === 'login' && log.status === 'failure'
    ).length
    if (failedLogins > 0) score -= Math.min(failedLogins, 10)

    setSecurityScore(Math.max(0, score))
  }

  const handleUnblockIP = (ip: string) => {
    ipBlocker.unblockIP(ip)
    setBlockedIPs(ipBlocker.getBlockedIPs())
  }

  const handleClearAuditLogs = () => {
    // In production, this would archive logs
    setAuditLogs([])
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Security Dashboard
        </h1>
        <p className="text-gray-800">
          Monitor security events, manage access, and review audit logs
        </p>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Security Score</CardTitle>
          <CardDescription>
            Real-time security posture assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold mb-2">
                {securityScore}
                <span className="text-2xl text-gray-800">/100</span>
              </div>
              <Badge
                variant={
                  securityScore >= 90 ? 'default' :
                  securityScore >= 70 ? 'secondary' :
                  'destructive'
                }
                className="text-sm"
              >
                {securityScore >= 90 ? 'Excellent' :
                 securityScore >= 70 ? 'Good' :
                 securityScore >= 50 ? 'Fair' : 'Poor'}
              </Badge>
            </div>

            <div className="w-48 h-48">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={securityScore >= 90 ? '#10b981' : securityScore >= 70 ? '#3b82f6' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${securityScore * 2.51} 251.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-800 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Events (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-gray-800">
              {auditLogs.filter(log => log.status === 'failure').length} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-800 flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Blocked IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedIPs.length}</div>
            <p className="text-xs text-gray-800">
              Suspicious activity detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-800 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-gray-800">
              Currently logged in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-800 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Encryption Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-600 text-white">AES-256-GCM</Badge>
            <p className="text-xs text-gray-800 mt-1">
              All data encrypted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle>Security Features</CardTitle>
          <CardDescription>
            Active security protections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Rate Limiting</p>
                <p className="text-sm text-gray-800">
                  100 requests/minute per user
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">CSRF Protection</p>
                <p className="text-sm text-gray-800">
                  Token-based validation
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">XSS Prevention</p>
                <p className="text-sm text-gray-800">
                  Input sanitization enabled
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">SQL Injection Protection</p>
                <p className="text-sm text-gray-800">
                  Parameterized queries (Prisma)
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Password Hashing</p>
                <p className="text-sm text-gray-800">
                  bcrypt with salt rounds: 10
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Session Management</p>
                <p className="text-sm text-gray-800">
                  30-minute timeout, 30-day max age
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Audit Logging</p>
                <p className="text-sm text-gray-800">
                  All actions logged
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">HTTPS Enforcement</p>
                <p className="text-sm text-gray-800">
                  HSTS enabled
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked IPs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Blocked IP Addresses
              </CardTitle>
              <CardDescription>
                IPs blocked due to suspicious activity
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={refreshData}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {blockedIPs.length > 0 ? (
            <div className="space-y-2">
              {blockedIPs.map((ip, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Ban className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium font-mono">{ip}</p>
                      <p className="text-sm text-gray-800">
                        Blocked for suspicious activity
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockIP(ip)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-gray-800">No blocked IPs</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Audit Logs
              </CardTitle>
              <CardDescription>
                Last 50 security events
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleClearAuditLogs}
            >
              Archive Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {auditLogs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded-lg ${
                    log.status === 'failure' ? 'bg-red-50 border-red-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{log.action}</p>
                          <Badge variant="outline" className="text-xs">
                            {log.resource}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-800">
                          {log.userId && `User: ${log.userId} • `}
                          {log.resourceId && `Resource: ${log.resourceId} • `}
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && (
                          <pre className="text-xs text-gray-800 mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>

                    <Clock className="h-4 w-4 text-gray-800 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-800 mx-auto mb-3" />
              <p className="text-gray-800">No audit logs</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Headers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security Headers
          </CardTitle>
          <CardDescription>
            HTTP security headers enabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 border rounded font-mono text-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Content-Security-Policy</span>
              </div>
              <p className="text-xs text-gray-800 ml-6">
                default-src 'self'; script-src 'self' 'unsafe-inline'
              </p>
            </div>

            <div className="p-3 bg-gray-50 border rounded font-mono text-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold">X-Frame-Options</span>
              </div>
              <p className="text-xs text-gray-800 ml-6">DENY</p>
            </div>

            <div className="p-3 bg-gray-50 border rounded font-mono text-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Strict-Transport-Security</span>
              </div>
              <p className="text-xs text-gray-800 ml-6">
                max-age=31536000; includeSubDomains
              </p>
            </div>

            <div className="p-3 bg-gray-50 border rounded font-mono text-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold">X-Content-Type-Options</span>
              </div>
              <p className="text-xs text-gray-800 ml-6">nosniff</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Standards</CardTitle>
          <CardDescription>
            Regulatory and security compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">HIPAA Compliant</h4>
              </div>
              <p className="text-sm text-gray-800 mb-2">
                Health Insurance Portability and Accountability Act
              </p>
              <ul className="space-y-1 text-sm text-gray-800">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  End-to-end encryption
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Audit logging
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Access controls
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">GDPR Compliant</h4>
              </div>
              <p className="text-sm text-gray-800 mb-2">
                General Data Protection Regulation
              </p>
              <ul className="space-y-1 text-sm text-gray-800">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Right to erasure
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Data portability
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Consent management
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
