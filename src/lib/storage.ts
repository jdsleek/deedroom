import { promises as fs } from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads')

export async function saveFile(
  relativePath: string,
  buffer: Buffer | ArrayBuffer
): Promise<string> {
  const fullPath = path.join(UPLOAD_DIR, relativePath)
  const dir = path.dirname(fullPath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(fullPath, Buffer.from(buffer))
  return fullPath
}

export async function getFileStream(relativePath: string) {
  const fullPath = path.join(UPLOAD_DIR, relativePath)
  if (!path.resolve(fullPath).startsWith(path.resolve(UPLOAD_DIR))) {
    throw new Error('Invalid path')
  }
  return fs.readFile(fullPath)
}

export async function deleteFile(relativePath: string) {
  const fullPath = path.join(UPLOAD_DIR, relativePath)
  if (!path.resolve(fullPath).startsWith(path.resolve(UPLOAD_DIR))) {
    throw new Error('Invalid path')
  }
  await fs.unlink(fullPath).catch(() => {})
}
