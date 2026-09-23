import { put } from "@vercel/blob";

const MAX_DATA_URL = 1_200_000;
const MAX_BLOB_BYTES = 4_000_000;

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function parseDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([\s\S]+)$/i.exec(dataUrl.trim());
  if (!match) return null;
  const contentType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) return null;
  return { contentType, buffer };
}

export async function persistUploadedImage(dataUrl: string, userId: string) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return { error: "图片格式无法保存。", status: 400 } as const;
  if (parsed.buffer.length > MAX_BLOB_BYTES) {
    return { error: "图片太大。", status: 413 } as const;
  }

  if (blobConfigured()) {
    try {
      const ext = parsed.contentType === "image/png" ? "png" : parsed.contentType === "image/webp" ? "webp" : "jpg";
      const blob = await put(`wuyule/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`, parsed.buffer, {
        access: "public",
        contentType: parsed.contentType,
      });
      return { url: blob.url } as const;
    } catch (error) {
      console.error("blob upload failed", error);
      if (dataUrl.length <= MAX_DATA_URL) {
        return { url: dataUrl, fallback: "data" as const };
      }
      return { error: "图片存储暂时不可用。", status: 503, missingBlob: true } as const;
    }
  }

  if (dataUrl.length > MAX_DATA_URL) {
    return { error: "未配置图片存储，无法保存这张图。", status: 503, missingBlob: true } as const;
  }
  return { url: dataUrl, fallback: "data" as const };
}
