/**
 * Reads a local file, uploads it to the backend server, and returns the persistent relative URL.
 */
export async function uploadImageToServer(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: file.name,
              dataUrl: reader.result,
            }),
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.error || 'Server upload failed');
          }

          const data = await response.json();
          resolve(data.url);
        } catch (error) {
          console.error('Error in uploadImageToServer:', error);
          reject(error);
        }
      } else {
        reject(new Error('Failed to parse file into a data URL'));
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error('FileReader read error'));
    };

    reader.readAsDataURL(file);
  });
}
