/**
 * Logo portal diambil dari Google Drive: admin menempelkan link berbagi Drive,
 * lalu diubah menjadi alamat gambar langsung yang bisa dipakai di <img>.
 *
 * Syarat: file di Drive dibagikan "Siapa saja yang memiliki link" (Viewer).
 */

const DRIVE_FILE_ID = '[A-Za-z0-9_-]{10,}'

const DRIVE_PATTERNS: RegExp[] = [
  // https://drive.google.com/file/d/<ID>/view?usp=sharing
  new RegExp(`^https?://drive\\.google\\.com/file/d/(${DRIVE_FILE_ID})`),
  // https://drive.google.com/open?id=<ID>, /uc?id=<ID>, /thumbnail?id=<ID>
  new RegExp(`^https?://drive\\.google\\.com/(?:open|uc|thumbnail)\\?(?:.*&)?id=(${DRIVE_FILE_ID})`),
  // https://lh3.googleusercontent.com/d/<ID> (sudah bentuk langsung)
  new RegExp(`^https?://lh3\\.googleusercontent\\.com/d/(${DRIVE_FILE_ID})`),
]

/** ID file Google Drive dari sebuah URL, atau `null` bila bukan link Drive. */
export function getGoogleDriveFileId(url: string): string | null {
  const value = url.trim()

  for (const pattern of DRIVE_PATTERNS) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

/** Ubah link berbagi Google Drive menjadi URL gambar langsung; URL lain dikembalikan apa adanya. */
export function toDirectImageUrl(url: string): string {
  const fileId = getGoogleDriveFileId(url)
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url.trim()
}
