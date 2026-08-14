/**
 * A single work capture. AVIF first, WebP fallback, explicit dimensions so
 * nothing shifts as it loads. Only the first takeover is eager.
 */
export function WorkMedia({ media, alt, width = 1440, height = 900, eager = false }) {
  const src = (ext, w) => `/work/${media}-${w}.${ext}`;

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${src('avif', 800)} 800w, ${src('avif', 1440)} 1440w`}
        sizes="(max-width: 900px) 100vw, 60vw"
      />
      <source
        type="image/webp"
        srcSet={`${src('webp', 800)} 800w, ${src('webp', 1440)} 1440w`}
        sizes="(max-width: 900px) 100vw, 60vw"
      />
      <img
        src={src('webp', 1440)}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        // React 18 passes this through only in lowercase.
        fetchpriority={eager ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  );
}
