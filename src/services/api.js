// src/services/api.js
const API_BASE = import.meta.env.PROD
  ? ''                                  // ✅ Vercel(프로덕션)에서는 상대경로 사용
  : (import.meta.env.VITE_API_BASE || 'http://localhost:8000'); // 로컬 개발용

async function fetchOrThrow(url, opts) {
  const resp = await fetch(url, opts);
  if (!resp.ok) {
    let msg = `서버 오류 ${resp.status}`;
    try { msg += `: ${await resp.text()}` } catch {}
    throw new Error(msg);
  }
  return resp;
}

export async function generateDoc(file, out = 'txt') {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await fetchOrThrow(`${API_BASE}/api/generate?out=${encodeURIComponent(out)}`, {
    method: 'POST', body: fd
  });
  const ctype = resp.headers.get('content-type') || '';
  if (ctype.includes('application/json')) return { type: 'json', data: await resp.json() };
  const blob = await resp.blob();
  const cd = resp.headers.get('Content-Disposition') || '';
  const m = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/);
  const filename = decodeURIComponent(m?.[1] || m?.[2] || `output.${out}`);
  return { type: 'blob', blob, filename };
}

export async function extractByImageFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await fetchOrThrow(`${API_BASE}/api/extract`, { method: 'POST', body: fd });
  return await resp.json();
}

export async function extractByImageUrl(imageUrl) {
  const resp = await fetchOrThrow(`${API_BASE}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });
  return await resp.json();
}
