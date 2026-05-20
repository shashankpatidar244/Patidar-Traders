export async function GET() {
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
  
    // Single immediate message (safe for dev)
    writer.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`)
    writer.close()
  
    return new Response(
        `data: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`,
        { headers: { "Content-Type": "text/event-stream" } }
      )
  }