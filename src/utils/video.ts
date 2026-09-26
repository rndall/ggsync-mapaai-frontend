export function isMp4File(file: File): boolean {
  return file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
}
