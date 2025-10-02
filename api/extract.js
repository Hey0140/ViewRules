// api/extract.js
import OpenAI from "openai";
import Busboy from "busboy";

export const config = { api: { bodyParser: false } }; // Vercel(Node)에서 form-data 직접 파싱

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let imageUrl = null;

  // 1) JSON { imageUrl } 요청 처리
  if (req.headers['content-type']?.includes('application/json')) {
    try {
      const body = await readJson(req);
      imageUrl = body.imageUrl;
    } catch {
      return res.status(400).json({ error: 'invalid json' });
    }
  } else {
    // 2) multipart/form-data 파일 업로드 처리
    const { fileB64, mime } = await readMultipartToBase64(req);
    if (fileB64 && mime) {
      imageUrl = `data:${mime};base64,${fileB64}`;
    }
  }

  if (!imageUrl) return res.status(400).json({ error: 'imageUrl or file required' });

  // 원하는 출력 스키마(예시)
  const schema = {
    type: "object",
    properties: {
      type: { type: "string", enum: ["사유", "공가", "불가"] },
      reason: { type: "string" },
      date: { type: "string", description: "YYYY.MM.DD (요일) or ISO" },
      details: { type: "string" }
    },
    required: ["reason"]
  };

  try {
    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: "이미지 내용을 읽고 아래 JSON 스키마로만 응답하세요." },
          { type: "input_image", image_url: imageUrl }
        ]
      }],
      response_format: { type: "json_schema", json_schema: { name: "AbsenceForm", schema, strict: true } }
    });

    // Vercel Responses SDK 출력 파싱
    const text = resp.output_text ?? resp.output?.[0]?.content?.[0]?.text;
    const data = text ? JSON.parse(text) : resp;
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'extract failed', detail: e.message });
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = ""; req.setEncoding("utf8");
    req.on("data", c => raw += c);
    req.on("end", () => { try { resolve(JSON.parse(raw)); } catch(e){ reject(e); } });
    req.on("error", reject);
  });
}

function readMultipartToBase64(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });
    let chunks = [];
    let mime = null;

    bb.on("file", (_, file, info) => {
      mime = info.mimeType || info.mimetype;
      file.on("data", d => chunks.push(d));
    });
    bb.on("finish", () => {
      if (!chunks.length) return resolve({});
      const buf = Buffer.concat(chunks);
      resolve({ fileB64: buf.toString('base64'), mime });
    });
    bb.on("error", reject);
    req.pipe(bb);
  });
}
