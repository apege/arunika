/**
 * Compresses an image File or Blob to WebP format using HTML5 Canvas.
 * Reduces file size dramatically (often 90%+ reduction) while retaining crisp clarity.
 * 
 * @param file The image File from input
 * @param maxWidth Maximum width constraint in pixels (default: 1200px)
 * @param maxHeight Maximum height constraint in pixels (default: 1200px)
 * @param quality WebP compression quality between 0.1 and 1.0 (default: 0.8)
 * @returns Promise<string> Base64 WebP Data URL
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 960,
  maxHeight = 960,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa format gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaled dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original data URL if 2D context is unavailable
          resolve(event.target?.result as string);
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          // Convert to lightweight modern WebP format
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          resolve(webpDataUrl);
        } catch {
          // Fallback in case of browser-specific format restriction
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };

      img.onerror = () => {
        reject(new Error('Gagal memproses file gambar.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari perangkat.'));
    };
  });
}
