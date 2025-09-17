const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'


export async function generateDoc(file, out = 'txt') {
const fd = new FormData()
fd.append('file', file)


const resp = await fetch(`${API_BASE}/generate?out=${out}`, {
method: 'POST',
body: fd,
})
if (!resp.ok) throw new Error(`서버 오류 ${resp.status}`)


const ctype = resp.headers.get('content-type') || ''
if (ctype.includes('application/json')) {
const data = await resp.json()
return { type: 'json', data }
} else {
const blob = await resp.blob()
const cd = resp.headers.get('Content-Disposition') || ''
const m = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/)
const filename = decodeURIComponent(m?.[1] || m?.[2] || `output.${out}`)
return { type: 'blob', blob, filename }
}
}