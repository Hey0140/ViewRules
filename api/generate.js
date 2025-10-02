// api/generate.js
import Busboy from "busboy";
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const out = (new URL(req.url, 'http://x')).searchParams.get('out') || 'txt';

  const { fileBuffer, filename } = await readFile(req);
  if (!fileBuffer) return res.status(400).json({ error: 'file required' });

  // TODO: 여기서 파일을 바탕으로 실제 txt/docx/pdf 생성 로직 수행
  // 지금은 데모로 TXT만 에코
  if (out === 'txt') {
    const content = `업로드 파일명: ${filename}\n크기: ${fileBuffer.length} bytes\n...여기에 처리 결과...`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="output.txt"`);
    return res.status(200).send(content);
  }

  // 그 외는 임시로 JSON
  return res.status(200).json({ ok: true, note: 'docx/pdf 구현 필요' });
}

function readFile(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });
    let chunks = []; let filename = null;

    bb.on("file", (_, file, info) => {
      filename = info.filename;
      file.on("data", d => chunks.push(d));
    });
    bb.on("finish", () => resolve({ fileBuffer: Buffer.concat(chunks), filename }));
    bb.on("error", reject);
    req.pipe(bb);
  });
}
