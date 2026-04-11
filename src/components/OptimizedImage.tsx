interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

/**
 * OptimizedImage wraps <picture> to serve WebP with PNG/JPG fallback.
 * - Derives .webp path automatically from the src prop.
 * - Uses loading="lazy" by default; loading="eager" + fetchpriority="high" when priority is true.
 * - Includes explicit width/height to prevent CLS.
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
}: OptimizedImageProps) => {
  // Derive the WebP path from the original src
  const webpSrc = src.replace(/\.(png|jpe?g)$/i, ".webp");

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        className={className}
      />
    </picture>
  );
};

export default OptimizedImage;
