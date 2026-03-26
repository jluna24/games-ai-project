// Modelo fijo — no configurable por el usuario
export const OPENROUTER_MODEL = 'openrouter/auto';

// Construye el prompt para que el modelo resuelva búsqueda binaria
export function buildBinarySearchPrompt(array: number[], target: number): string {
  const n = array.length;
  const initialMid = Math.floor((n - 1) / 2);
  return `You must solve binary search. Output ONLY raw JSON objects, one per line, no markdown, no explanation, no extra text.

Array (0-indexed): [${array.join(', ')}]
Target value: ${target}
Initial state: left=0, right=${n - 1}, mid=${initialMid}

Rules:
- Each line must be exactly one JSON object: {"left":<L>,"mid":<M>,"right":<R>,"comparison":"less"|"greater"|"equal","stepNumber":<N>,"found":true|false}
- "comparison" = "equal" if array[mid]==target, "less" if target < array[mid], "greater" if target > array[mid]
- If "less": next right = mid-1, next mid = floor((left + mid-1) / 2)
- If "greater": next left = mid+1, next mid = floor((mid+1 + right) / 2)
- Set "found":true when array[mid]==target
- Stop after "found":true or when left > right
- DO NOT write anything except the JSON lines

Begin:`;
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
