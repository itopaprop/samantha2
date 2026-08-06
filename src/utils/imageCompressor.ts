/**
 * Compresses an image file or data URL to a smaller canvas image (max 400x400 JPEG)
 * to prevent localStorage QuotaExceededError while preserving clear visual quality.
 */
export async function compressImageFile(file: File, maxWidth = 400, maxHeight = 400, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((event.target?.result as string) || '');
        }
      };
      img.onerror = () => {
        resolve((event.target?.result as string) || '');
      };
      img.src = (event.target?.result as string) || '';
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}
