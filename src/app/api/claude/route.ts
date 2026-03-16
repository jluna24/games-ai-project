import { streamBinarySearch } from '@/lib/openrouter';

interface AIRequestBody {
  array: number[];
  target: number;
}

export async function POST(request: Request): Promise<Response> {
  let body: AIRequestBody;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!Array.isArray(body?.array) || body?.target === undefined) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { array, target } = body;

  let upstreamResponse: Response;

  try {
    upstreamResponse = await streamBinarySearch(array, target);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('OPENROUTER_API_KEY')) {
      return Response.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 500 });
    }
    return Response.json({ error: message }, { status: 500 });
  }

  if (!upstreamResponse.ok) {
    return Response.json(
      { error: upstreamResponse.statusText },
      { status: upstreamResponse.status }
    );
  }

  const upstreamBody = upstreamResponse.body;
  if (!upstreamBody) {
    return Response.json({ error: 'Empty response from upstream' }, { status: 502 });
  }

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstreamBody.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let jsonBuffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed === 'data: [DONE]') {
              controller.close();
              return;
            }

            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6);
              try {
                const chunk = JSON.parse(jsonStr);
                const content: string | undefined = chunk?.choices?.[0]?.delta?.content;
                if (content) {
                  jsonBuffer += content;

                  // Emit complete JSON lines
                  const jsonLines = jsonBuffer.split('\n');
                  jsonBuffer = jsonLines.pop() ?? '';

                  for (const jsonLine of jsonLines) {
                    const trimmedJson = jsonLine.trim();
                    if (!trimmedJson) continue;
                    try {
                      JSON.parse(trimmedJson); // validate
                      controller.enqueue(
                        new TextEncoder().encode(`data: ${trimmedJson}\n\n`)
                      );
                    } catch {
                      // ignore non-JSON lines
                    }
                  }
                }
              } catch {
                // ignore unparseable chunks
              }
            }
          }
        }

        // Flush remaining jsonBuffer
        if (jsonBuffer.trim()) {
          try {
            JSON.parse(jsonBuffer.trim());
            controller.enqueue(
              new TextEncoder().encode(`data: ${jsonBuffer.trim()}\n\n`)
            );
          } catch {
            // ignore
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers });
}
