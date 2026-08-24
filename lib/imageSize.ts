/**
 * imageSize.ts
 * Zero-dependency utility to read image dimensions from a raw buffer.
 * Supports PNG and JPEG — the two formats we accept from users.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Reads the dimensions of a PNG or JPEG from its raw bytes.
 * - PNG: reads the IHDR chunk at bytes 16–24.
 * - JPEG: scans for SOF0/SOF2 markers (0xFFC0, 0xFFC2).
 *
 * @param buffer - Raw image bytes.
 * @param mimeType - "image/png" | "image/jpeg".
 * @returns { width, height } or { 0, 0 } if parsing fails.
 */
export function getImageDimensions(
  buffer: Buffer,
  mimeType: string
): ImageDimensions {
  try {
    if (mimeType === "image/png") {
      // PNG signature: 8 bytes, then IHDR chunk (4 len + 4 type + 4 W + 4 H)
      if (buffer.length < 24) return { width: 0, height: 0 };
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      // Walk JPEG segments looking for SOF markers
      let offset = 2; // skip initial FFD8
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        // SOF0 = 0xC0, SOF1 = 0xC1, SOF2 = 0xC2 (progressive)
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        // Move to next segment: 2-byte marker + 2-byte length
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      }
      return { width: 0, height: 0 };
    }
  } catch {
    // If anything goes wrong, just return zeros — non-critical
  }

  return { width: 0, height: 0 };
}
