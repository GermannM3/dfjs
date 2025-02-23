const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

class ImageService {
  static async processImage(buffer, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      const processedImage = await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, { quality });

      const outputBuffer = await processedImage.toBuffer();
      const filename = `${crypto.randomUUID()}.${format}`;
      const filepath = path.join('uploads', filename);

      await fs.writeFile(filepath, outputBuffer);

      return {
        filename,
        filepath,
        size: outputBuffer.length
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }
}

module.exports = ImageService;