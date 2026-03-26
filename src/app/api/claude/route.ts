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

  // Límite de pasos: ceil(log2(n)) + 2 de margen
  const maxSteps = Math.ceil(Math.log2(array.length)) + 2;

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
      let stepCount = 0;
      let closed = false;

      const safeClose = () => {
        if (!closed) {
          closed = true;
          controller.close();
        }
      };

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
              safeClose();
              return;
            }

            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6);
              try {
                const chunk = JSON.parse(jsonStr);
                const content: string | undefined = chunk?.choices?.[0]?.delta?.content;
                if (content) {
                  jsonBuffer += content;

                  const jsonRegex = /\{[^{}]*"left"\s*:\s*\d+[^{}]*\}/g;
                  let match: RegExpExecArray | null;
                  let lastMatchEnd = 0;
                  while ((match = jsonRegex.exec(jsonBuffer)) !== null) {
                    const candidate = match[0];
                    lastMatchEnd = match.index + match[0].length;
                    try {
                      const parsed = JSON.parse(candidate);
                      if (
                        typeof parsed.left === 'number' &&
                        typeof parsed.mid === 'number' &&
                        typeof parsed.right === 'number'
                      ) {
                        stepCount++;
                        controller.enqueue(
                          new TextEncoder().encode(`data: ${candidate}\n\n`)
                        );

                        if (stepCount >= maxSteps) {
                          controller.enqueue(
                            new TextEncoder().encode(`data: {"type":"limit","message":"Max steps reached"}\n\n`)
                          );
                          reader.cancel();
                          safeClose();
                          return;
                        }

                        if (parsed.found === true) {
                          safeClose();
                          return;
                        }
                      }
                    } catch {
                      // ignore malformed
                    }
                  }
                  if (lastMatchEnd > 0) {
                    jsonBuffer = jsonBuffer.slice(lastMatchEnd);
                  }
                }
              } catch {
                // ignore unparseable SSE chunks
              }
            }
          }
        }

        // Flush remaining buffer
        if (jsonBuffer.trim()) {
          const jsonRegex = /\{[^{}]*"left"\s*:\s*\d+[^{}]*\}/g;
          let match: RegExpExecArray | null;
          while ((match = jsonRegex.exec(jsonBuffer)) !== null) {
            try {
              const parsed = JSON.parse(match[0]);
              if (typeof parsed.left === 'number' && typeof parsed.mid === 'number') {
                stepCount++;
                controller.enqueue(
                  new TextEncoder().encode(`data: ${match[0]}\n\n`)
                );
                if (stepCount >= maxSteps || parsed.found === true) break;
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        if (!closed) {
          controller.error(err);
          closed = true;
        }
      } finally {
        safeClose();
      }
    },
  });

  return new Response(stream, { headers });
}
