const pageImagePattern =
  /(!\[([^\]]*)\]\()([^)\s]+)([^)]*\))|(<img\b[^>]*?\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi
const videoPattern =
  /(<video\b[^>]*?\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi

export function imageReferences(markdown) {
  return [...markdown.matchAll(pageImagePattern)].map((match) => {
    const type = match[1] ? 'markdown' : 'html'
    const target = match[3] ?? match[6]
    const htmlTag = type === 'html' ? `${match[5]}${target}${match[7]}` : ''
    return {
      alt:
        type === 'markdown'
          ? match[2]
          : htmlTag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? '',
      target,
      type,
    }
  })
}

export function videoReferences(markdown) {
  return [...markdown.matchAll(videoPattern)].map((match) => match[2])
}

export function imageFormat(buffer, filePath) {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (buffer.subarray(0, pngSignature.length).equals(pngSignature)) return 'png'
  if (['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
    return 'gif'
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpg'
  throw new Error(`Unsupported article image format: ${filePath}`)
}

export function imageDimensions(buffer, format, filePath) {
  if (format === 'png') {
    const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    if (!buffer.subarray(0, signature.length).equals(signature)) {
      throw new Error(`Invalid PNG calibration source: ${filePath}`)
    }
    return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)]
  }

  if (format === 'gif') {
    if (!['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
      throw new Error(`Invalid GIF calibration source: ${filePath}`)
    }
    return [buffer.readUInt16LE(6), buffer.readUInt16LE(8)]
  }

  if (format === 'jpg') {
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
      throw new Error(`Invalid JPEG calibration source: ${filePath}`)
    }

    const startOfFrameMarkers = new Set([
      0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
      0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
    ])
    let offset = 2

    while (offset < buffer.length) {
      while (buffer[offset] === 0xff) offset += 1
      const marker = buffer[offset]
      offset += 1

      if (marker === 0xd8 || marker === 0xd9) continue
      if (offset + 1 >= buffer.length) break

      const segmentLength = buffer.readUInt16BE(offset)
      if (startOfFrameMarkers.has(marker)) {
        return [
          buffer.readUInt16BE(offset + 5),
          buffer.readUInt16BE(offset + 3),
        ]
      }
      offset += segmentLength
    }
  }

  throw new Error(`Could not read image dimensions: ${filePath}`)
}

export function purposeFor(pageTitle, alt, order) {
  return alt.trim() || `${pageTitle} — image ${order}`
}

export { pageImagePattern, videoPattern }
