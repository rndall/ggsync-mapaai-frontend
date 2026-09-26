import { fetchClient } from '@/lib/api'
import type { operations } from '@/types/api'

type StoreVideoChunkBody =
  operations['match.storeVideoChunk']['requestBody']['content']['multipart/form-data']

// 1.5 MiB per chunk: must stay well under PHP's stock
// `upload_max_filesize=2M`, which silently discards the file part above the
// limit (Laravel then 422s on `chunk: required,file`). Small enough for that,
// large enough that a max-size video (2 GiB backend cap) needs ~1366 chunks,
// comfortably inside the backend's `total_chunks max:2000`.
export const VIDEO_CHUNK_SIZE_BYTES = Math.floor(1.5 * 1024 * 1024)

export function chunkCount(
  totalBytes: number,
  chunkSize: number = VIDEO_CHUNK_SIZE_BYTES,
): number {
  return Math.max(1, Math.ceil(totalBytes / chunkSize))
}

// Hex-encoded SHA-256 of the whole file for the `content_hash` field.
// Returns null when WebCrypto is unavailable so callers can send null.
export async function sha256Hex(file: File): Promise<string | null> {
  try {
    const buffer = await file.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', buffer)
    return [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return null
  }
}

type UploadProgress = {
  done: number
  total: number
}

// Sequential chunk upload: POST /matches/{match}/video-chunks with
// multipart {index, chunk}. Sequential (not parallel) so the server sees
// indices in order; the final chunk resolves with 202 when complete.
export async function uploadVideoInChunks(
  matchId: number,
  file: File,
  options?: {
    chunkSize?: number
    onProgress?: (progress: UploadProgress) => void
  },
): Promise<void> {
  const chunkSize = options?.chunkSize ?? VIDEO_CHUNK_SIZE_BYTES
  const total = chunkCount(file.size, chunkSize)
  for (let index = 0; index < total; index += 1) {
    const blob = file.slice(
      index * chunkSize,
      (index + 1) * chunkSize,
      file.type || 'video/mp4',
    )
    const payload = new FormData()
    payload.append('index', String(index))
    payload.append('chunk', blob, file.name)
    const { error } = await fetchClient.POST(
      '/matches/{match}/video-chunks',
      {
        params: { path: { match: matchId } },
        body: payload as unknown as StoreVideoChunkBody,
      },
    )
    if (error) throw error
    options?.onProgress?.({ done: index + 1, total })
  }
}
