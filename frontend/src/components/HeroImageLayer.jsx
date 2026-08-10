// Renders the hero background image and watermark using fully adjustable settings
// (scale, position, fit mode) coming from /api/settings/hero. Used both on the live
// homepage AND in the admin panel's live preview, so what the admin sees while editing
// is exactly what visitors see - same component, same math, no drift between the two.

export function getBreakpoint(width) {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export default function HeroImageLayer({ settings, breakpoint = "desktop", fallbackSrc, alt = "" }) {
  const image = settings?.image;
  const watermark = settings?.watermark;
  const imgCfg = image?.[breakpoint] || { scale: 1, x: 50, y: 50, width: 100, height: 100 };
  const wmCfg = watermark?.[breakpoint] || { scale: 1, x: 90, y: 90 };
  const fitMode = image?.fit_mode || "cover";
  const src = image?.url || fallbackSrc;

  const imageStyle =
    fitMode === "custom"
      ? {
          position: "absolute",
          left: `${imgCfg.x}%`,
          top: `${imgCfg.y}%`,
          width: `${imgCfg.width}%`,
          height: `${imgCfg.height}%`,
          transform: `translate(-50%, -50%) scale(${imgCfg.scale || 1})`,
          objectFit: "contain",
        }
      : {
          width: "100%",
          height: "100%",
          objectFit: fitMode,
          objectPosition: `${imgCfg.x}% ${imgCfg.y}%`,
          transform: `scale(${imgCfg.scale || 1})`,
          transformOrigin: `${imgCfg.x}% ${imgCfg.y}%`,
        };

  return (
    <>
      {src && <img src={src} alt={alt} style={imageStyle} draggable={false} />}
      {watermark?.url && (
        <img
          src={watermark.url}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: `${wmCfg.x}%`,
            top: `${wmCfg.y}%`,
            transform: `translate(-50%, -50%) scale(${wmCfg.scale || 1})`,
            opacity: watermark.opacity ?? 0.5,
            maxWidth: "220px",
            maxHeight: "220px",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      )}
    </>
  );
}
