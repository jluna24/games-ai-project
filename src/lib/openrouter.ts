// Modelo fijo — no configurable por el usuario
export const OPENROUTER_MODEL = 'openrouter/free';

// Construye el prompt para que el modelo resuelva búsqueda binaria
export function buildBinarySearchPrompt(array: number[], target: number): string {
  return `You are playing binary search on the array: [${array.join(', ')}]
Target: ${target}

Solve binary search step by step. For each step, emit ONLY a JSON object on a single line:
{"left": <L>, "mid": <M>, "right": <R>, "comparison": "less"|"greater"|"equal", "stepNumber": <N>, "found": true|false}

Start with left=0, right=${array.length - 1}, mid=Math.floor((left+right)/2).
Stop when found=true or left > right.
Do not emit any other text, only the JSON objects.`;
}

// Llama a OpenRouter con stream: true y retorna el Response con el stream
// Lanza error si OPENROUTER_API_KEY no está definida
// Incluye header HTTP-Referer: http://localhost:3000
export async function streamBinarySearch(array: number[], target: number): Promise<Response> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const prompt = buildBinarySearchPrompt(array, target);

  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  });
}
