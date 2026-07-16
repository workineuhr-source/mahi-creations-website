/**
 * Resizes and compresses an image file to a maximum dimension (width or height) of 1000px,
 * returning a lightweight base64 Data URL.
 */
function compressImage(file: File, maxDimension: number = 1000, quality: number = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw image onto canvas
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed jpeg data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } else {
          // Fallback if canvas context is not supported
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a local file, compresses it to a lightweight size, attempts to upload it to the backend server,
 * and falls back gracefully to a direct compressed Data URL if the backend API is unavailable or restricted.
 */
export async function uploadImageToServer(file: File): Promise<string> {
  try {
    // 1. First compress the image to keep size tiny (~80KB - 150KB) and fast
    const compressedDataUrl = await compressImage(file, 1000, 0.82);

    try {
      // 2. Attempt to upload the compressed version to the backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: file.name.replace(/\.[^/.]+$/, "") + ".jpg", // Force .jpg extension extension
          dataUrl: compressedDataUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.url) {
          console.log('Successfully uploaded compressed image to server:', data.url);
          return data.url;
        }
      }
      
      console.warn('Server upload API returned a non-ok status. Falling back to secure compressed Data URL.');
    } catch (apiError) {
      console.warn('Backend server upload API is unreachable (typical on standard static Hostinger packages). Using high-performance compressed Data URL fallback instead.', apiError);
    }

    // 3. Graceful fallback: return the compressed data URL directly so it can still be saved & viewed
    return compressedDataUrl;
  } catch (error) {
    console.error('Failed to process image:', error);
    throw new Error('Could not process or compress image. Please make sure the file is a valid image.');
  }
}

