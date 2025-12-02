/**
 * Compress an image to fit within Firestore's 1MB document limit
 * @param base64String - The original base64 image string
 * @param maxSizeKB - Maximum size in KB (default 200KB to leave room for other data)
 * @returns Compressed base64 string
 */
export const compressImage = async (base64String: string, maxSizeKB: number = 200): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Calculate new dimensions (max 800px width/height)
            let width = img.width;
            let height = img.height;
            const maxDimension = 800;

            if (width > height && width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
            } else if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Try different quality levels until we get under maxSizeKB
            let quality = 0.8;
            let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

            while (compressedBase64.length > maxSizeKB * 1024 && quality > 0.1) {
                quality -= 0.1;
                compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            }

            resolve(compressedBase64);
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = base64String;
    });
};

/**
 * Check if a base64 string is already compressed (is a URL or small enough)
 */
export const needsCompression = (base64String: string): boolean => {
    // If it's a URL (from Firebase Storage), don't compress
    if (base64String.startsWith('http')) {
        return false;
    }

    // If it's already small enough (< 200KB), don't compress
    if (base64String.length < 200 * 1024) {
        return false;
    }

    return true;
};
