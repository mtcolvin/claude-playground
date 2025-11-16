import { NextRequest } from 'next/server'

/**
 * Server-Sent Events endpoint for real-time updates
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  if (!userId) {
    return new Response('User ID required', { status: 400 })
  }

  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connection-status',
        data: { status: 'connected' },
      })}\n\n`
      controller.enqueue(encoder.encode(initialMessage))

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch (error) {
          clearInterval(heartbeat)
        }
      }, 30000) // Every 30 seconds

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        controller.close()
      })

      // Example: Send notification after 5 seconds (for testing)
      // In production, this would be triggered by actual events
      // setTimeout(() => {
      //   const notification = `event: notification\ndata: ${JSON.stringify({
      //     title: 'Test Notification',
      //     body: 'Real-time connection working!',
      //   })}\n\n`
      //   controller.enqueue(encoder.encode(notification))
      // }, 5000)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
