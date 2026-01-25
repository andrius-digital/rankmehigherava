/**
 * Image compression utility for client-side image optimization before upload
 * - Files < 500KB: No compression (already optimized)
 * - Files 500KB - 5MB: 90% quality, max 2000px
 * - Files > 5MB: 85% quality, max 2000px (stronger compression)
 */

const MAX_DIMENSION = 2000;
const SMALL_FILE_THRESHOLD = 500 * 1024; // 500KB
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
const QUALITY_STANDARD = 0.9;
const QUALITY_LARGE = 0.85;

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}

export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // Skip non-image files
  if (!file.type.startsWith("image/")) {
    return { file, originalSize, compressedSize: originalSize, wasCompressed: false };
  }

  // Skip small files (already optimized)
  if (file.size < SMALL_FILE_THRESHOLD) {
    return { file, originalSize, compressedSize: originalSize, wasCompressed: false };
  }

  // Skip SVG files (vector, no compression needed)
  if (file.type === "image/svg+xml") {
    return { file, originalSize, compressedSize: originalSize, wasCompressed: false };
  }

  try {
    const quality = file.size > LARGE_FILE_THRESHOLD ? QUALITY_LARGE : QUALITY_STANDARD;
    const compressedFile = await compressImageFile(file, quality);
    
    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      wasCompressed: true,
    };
  } catch (error) {
    console.error("Image compression failed, using original:", error);
    return { file, originalSize, compressedSize: originalSize, wasCompressed: false };
  }
}

async function compressImageFile(file: File, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // Resize if larger than max dimension
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Determine output type - keep PNG for files that likely have transparency
      const isPNG = file.type === "image/png";
      const outputType = isPNG ? "image/png" : "image/jpeg";
      const outputQuality = isPNG ? undefined : quality;

      // Only fill white background for JPEG (which doesn't support transparency)
      // PNG files preserve transparency by NOT filling the background
      if (!isPNG) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }

          // If compressed is larger than original, return original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          // Create new file with same name
          const compressedFile = new File([blob], file.name, {
            type: outputType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        outputType,
        outputQuality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
