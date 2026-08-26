// Renders the hero background media (image, video, or animation) and watermark using
// fully adjustable settings (scale, position, fit mode) coming from /api/settings/hero.
// Used both on the live homepage AND in the admin panel's live preview, so what the
// admin sees while editing is exactly what visitors see - same component, same math.

import { useState } from "react";

export function getBreakpoint(width) {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function Watermark({ watermark, breakpoint }) {
  const wmCfg = watermark?.[breakpoint] || { scale: 1, x: 90, y: 90 };
  if (!watermark?.url) return null;
  return (
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
  );
}

export default function HeroImageLayer({ settings, breakpoint = "desktop", fallbackSrc, alt = "" }) {
  const [mediaErrored, setMediaErrored] = useState(false);
  const image = settings?.image;
  const watermark = settings?.watermark;
  const imgCfg = image?.[breakpoint] || { scale: 1, x: 50, y: 50, width: 100, height: 100 };
  const fitMode = image?.fit_mode || "cover";
  const mediaType = settings?.media_enabled === false ? "image" : (settings?.media_type || "image");

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

  // VIDEO mode - autoplay, muted, loop, inline, cover; falls back to image on load error
  if (mediaType === "video" && settings?.video_url && !mediaErrored) {
    return (
      <>
        <video
          src={settings.video_url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setMediaErrored(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Watermark watermark={watermark} breakpoint={breakpoint} />
      </>
    );
  }

  // ANIMATION mode - animated GIF/WEBP/APNG rendered natively by the browser
  if (mediaType === "animation" && settings?.animation_url && !mediaErrored) {
    return (
      <>
        <img
          src={settings.animation_url}
          alt={alt}
          draggable={false}
          onError={() => setMediaErrored(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Watermark watermark={watermark} breakpoint={breakpoint} />
      </>
    );
  }

  // IMAGE mode (default, and fallback if video/animation fails to load)
  const src = image?.url || fallbackSrc;
  return (
    <>
      {src && <img src={src} alt={alt} style={imageStyle} draggable={false} />}
      <Watermark watermark={watermark} breakpoint={breakpoint} />
    </>
  );
}
