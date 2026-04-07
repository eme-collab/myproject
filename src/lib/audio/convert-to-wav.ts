import 'server-only'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

async function getFfmpegPath() {
  const { default: ffmpegPath } = await import('ffmpeg-static')
  return ffmpegPath
}

function runFfmpeg(ffmpegPath: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(ffmpegPath, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
    })

    let stderr = ''

    process.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    process.on('error', (error) => {
      reject(error)
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(stderr || `FFmpeg falhou com código ${code}`))
    })
  })
}

export async function convertAudioBufferToWav(
  inputBuffer: Buffer,
  inputExtension: string
) {
  const ffmpegPath = await getFfmpegPath()

  if (!ffmpegPath) {
    throw new Error('FFmpeg não encontrado.')
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'prumo-audio-'))

  const inputPath = path.join(tempDir, `input.${inputExtension}`)
  const outputPath = path.join(tempDir, 'output.wav')

  try {
    await fs.writeFile(inputPath, inputBuffer)

    await runFfmpeg(ffmpegPath, [
      '-y',
      '-i',
      inputPath,
      '-ac',
      '1',
      '-ar',
      '16000',
      '-c:a',
      'pcm_s16le',
      outputPath,
    ])

    const outputBuffer = await fs.readFile(outputPath)
    return outputBuffer
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}
