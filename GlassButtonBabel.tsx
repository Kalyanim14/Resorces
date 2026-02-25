import { useMemo, useEffect, useRef, useId } from "react";
import type { CSSProperties, ReactNode, ReactElement } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BlendMode =
  | "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten"
  | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference"
  | "exclusion" | "hue" | "saturation" | "color" | "luminosity"
  | "plus-darker" | "plus-lighter";

type Channel = "R" | "G" | "B";
type Mode    = "dock" | "pill" | "bubble" | "free";

/**
 * Standard size tokens (in px).
 * Maps directly to the component's height — width scales per the preset's
 * natural aspect ratio so the shape is always preserved.
 *
 *   <GlassButtonBabel size={24} mode="bubble" />   → 24 × 24 circle
 *   <GlassButtonBabel size={32} mode="pill"   />   → ~80 × 32 pill
 *   <GlassButtonBabel size={48} mode="dock"   />   → ~168 × 48 dock bar
 */
export type SizeToken = 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 80 | 96 | 112 | 128;

interface Config {
  width:      number;
  height:     number;
  radius:     number;
  scale:      number;
  border:     number;
  lightness:  number;
  alpha:      number;
  blur:       number;
  displace:   number;
  blend:      BlendMode;
  x:          Channel;
  y:          Channel;
  saturation: number;
  r:          number;
  g:          number;
  b:          number;
  frost:      number;
}

export interface GlassButtonBabelProps {
  /** Preset base shape. Default: "dock" */
  mode?:  Mode;
  /**
   * Size token (height in px). All dimensions — width, radius, scale, blur —
   * scale proportionally from the preset's natural height so the shape is
   * always preserved.
   *
   * Standard tokens: 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 80 | 96 | 112 | 128
   * Any positive number also accepted for custom sizes.
   *
   * @example
   * <GlassButtonBabel size={24} mode="bubble">●</GlassButtonBabel>
   * <GlassButtonBabel size={40} mode="pill">click me</GlassButtonBabel>
   * <GlassButtonBabel size={48} mode="dock" />
   */
  size?:  number;
  // Fine-grained overrides (applied after size scaling, before render)
  width?:      number;
  height?:     number;
  radius?:     number;
  scale?:      number;
  border?:     number;
  lightness?:  number;
  alpha?:      number;
  blur?:       number;
  displace?:   number;
  blend?:      BlendMode;
  x?:          Channel;
  y?:          Channel;
  saturation?: number;
  r?:          number;
  g?:          number;
  b?:          number;
  frost?:      number;
  fixed?:      boolean;
  className?:  string;
  style?:      CSSProperties;
  children?:   ReactNode;
}

// ─── Presets (natural / reference dimensions) ─────────────────────────────────

const BASE: Omit<Config, "width" | "height" | "radius"> = {
  scale: -180, border: 0.07, lightness: 50, displace: 0,
  blend: "difference", x: "R", y: "B", alpha: 0.93,
  blur: 11, r: 0, g: 10, b: 20, saturation: 1, frost: 0,
};

const PRESETS: Record<Mode, Config> = {
  dock:   { ...BASE, width: 336, height: 96,  radius: 16, displace: 0.2, frost: 0.05 },
  pill:   { ...BASE, width: 200, height: 80,  radius: 40 },
  bubble: { ...BASE, width: 140, height: 140, radius: 70 },
  free:   { ...BASE, width: 140, height: 280, radius: 80,
            border: 0.15, alpha: 0.74, lightness: 60, blur: 10, scale: -300 },
};

/**
 * Fields that scale linearly with the size factor.
 * Everything else (alpha, border ratio, saturation, blend, channels) is
 * dimensionless and stays constant regardless of size.
 */
const SCALABLE_FIELDS = ["width", "height", "radius", "blur", "displace"] as const;

/**
 * scale is also size-dependent but needs special handling — large negative
 * values need to shrink proportionally so tiny components don't over-displace.
 */
function applySize(preset: Config, size: number): Config {
  const factor = size / preset.height;         // e.g. 24 / 96 = 0.25
  const scaled: Config = { ...preset };

  for (const key of SCALABLE_FIELDS) {
    scaled[key] = preset[key] * factor;
  }

  // scale is negative — multiply by factor to reduce magnitude at small sizes
  scaled.scale = preset.scale * factor;

  // Chromatic offsets also scale so aberration looks right at every size
  scaled.r = preset.r * factor;
  scaled.g = preset.g * factor;
  scaled.b = preset.b * factor;

  return scaled;
}

// ─── Displacement map SVG → data URI ─────────────────────────────────────────

function buildDataURI(cfg: Config): string {
  const b = Math.min(cfg.width, cfg.height) * (cfg.border * 0.5);
  const svg = `<svg viewBox="0 0 ${cfg.width} ${cfg.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gr" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#000"/>
        <stop offset="100%" stop-color="red"/>
      </linearGradient>
      <linearGradient id="gb" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000"/>
        <stop offset="100%" stop-color="blue"/>
      </linearGradient>
    </defs>
    <rect width="${cfg.width}" height="${cfg.height}" fill="black"/>
    <rect width="${cfg.width}" height="${cfg.height}" rx="${cfg.radius}" fill="url(#gr)"/>
    <rect width="${cfg.width}" height="${cfg.height}" rx="${cfg.radius}" fill="url(#gb)"
          style="mix-blend-mode:${cfg.blend}"/>
    <rect x="${b}" y="${b}"
          width="${cfg.width  - b * 2}" height="${cfg.height - b * 2}"
          rx="${cfg.radius}"
          fill="hsl(0 0% ${cfg.lightness}% / ${cfg.alpha})"
          style="filter:blur(${cfg.blur}px)"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlassButtonBabel({
  mode      = "dock",
  size,
  width, height, radius, scale, border, lightness, alpha,
  blur, displace, blend, x, y, saturation, r, g, b, frost,
  fixed     = false,
  className,
  style,
  children,
}: GlassButtonBabelProps): ReactElement {

  const cfg = useMemo<Config>(() => {
    // 1. Start from preset
    const preset = PRESETS[mode] ?? PRESETS.dock;

    // 2. Apply size scaling (if provided) — scales all dimensional fields
    const sized = size != null ? applySize(preset, size) : preset;

    // 3. Apply any explicit prop overrides on top
    return {
      ...sized,
      ...(width      != null && { width }),
      ...(height     != null && { height }),
      ...(radius     != null && { radius }),
      ...(scale      != null && { scale }),
      ...(border     != null && { border }),
      ...(lightness  != null && { lightness }),
      ...(alpha      != null && { alpha }),
      ...(blur       != null && { blur }),
      ...(displace   != null && { displace }),
      ...(blend      != null && { blend }),
      ...(x          != null && { x }),
      ...(y          != null && { y }),
      ...(saturation != null && { saturation }),
      ...(r          != null && { r }),
      ...(g          != null && { g }),
      ...(b          != null && { b }),
      ...(frost      != null && { frost }),
    };
  }, [mode, size, width, height, radius, scale, border, lightness, alpha,
      blur, displace, blend, x, y, saturation, r, g, b, frost]);

  // Unique per-instance filter ID so multiple instances don't clobber each other
  const uid      = useId().replace(/:/g, "");
  const filterId = `gdf-${uid}`;

  const feImgRef = useRef<SVGFEImageElement>(null);
  const dataURI  = useMemo(() => buildDataURI(cfg), [cfg]);

  useEffect(() => {
    feImgRef.current?.setAttribute("href", dataURI);
  }, [dataURI]);

  const wrapperStyle: CSSProperties = {
    ...(fixed
      ? { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999 }
      : { position: "relative", display: "inline-flex" }
    ),
    width:        cfg.width,
    height:       cfg.height,
    borderRadius: cfg.radius,
    backdropFilter:       `url(#${filterId}) saturate(${cfg.saturation})`,
    WebkitBackdropFilter: `url(#${filterId}) saturate(${cfg.saturation})`,
    background: "transparent",
    clipPath: `inset(0px round ${cfg.radius}px)`,
    boxShadow: `
      0 0 2px 1px rgba(255,255,255,0.18) inset,
      0 0 10px 4px rgba(255,255,255,0.10) inset,
      0px 4px 16px rgba(17,17,26,0.08),
      0px 8px 32px rgba(17,17,26,0.06),
      0px 16px 56px rgba(17,17,26,0.05)
    `,
    transition: "width 0.35s ease, height 0.35s ease, border-radius 0.35s ease, clip-path 0.35s ease",
    ...style,
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {children}
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-30%" y="-30%" width="160%" height="160%"
          >
            <feImage ref={feImgRef} x="0" y="0" width="100%" height="100%"
              href={dataURI} result="map" />

            <feDisplacementMap in="SourceGraphic" in2="map"
              xChannelSelector={cfg.x} yChannelSelector={cfg.y}
              scale={cfg.scale + cfg.r} result="dispRed" />
            <feColorMatrix in="dispRed" type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />

            <feDisplacementMap in="SourceGraphic" in2="map"
              xChannelSelector={cfg.x} yChannelSelector={cfg.y}
              scale={cfg.scale + cfg.g} result="dispGreen" />
            <feColorMatrix in="dispGreen" type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />

            <feDisplacementMap in="SourceGraphic" in2="map"
              xChannelSelector={cfg.x} yChannelSelector={cfg.y}
              scale={cfg.scale + cfg.b} result="dispBlue" />
            <feColorMatrix in="dispBlue" type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg"  in2="blue"  mode="screen" result="output" />
            <feGaussianBlur in="output" stdDeviation={cfg.displace} />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

export default function GlassButtonDemo() {
  const SIZES: SizeToken[] = [16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 80, 96];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#e8e4dc",
      fontFamily: "'SF Pro Text', Helvetica, Arial, sans-serif",
      color: "#111",
      overflow: "hidden",
    }}>
      {/* Background text to refract */}
      <div style={{
        position: "fixed", inset: 0, padding: "3rem",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem",
        zIndex: 0, pointerEvents: "none",
      }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <p key={i} style={{ lineHeight: 1.7, fontSize: "0.9rem", margin: 0, opacity: 0.7 }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam nobis quidem harum a
            unde ferendis explicabo modi voluptas quas natus eius dolore fugiat ipsa eligendi.
          </p>
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, padding: "3rem", display: "flex", flexDirection: "column", gap: "3rem" }}>

        {/* ── Bubble sizes ── */}
        <section>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.4, marginBottom: "1rem", textTransform: "uppercase" }}>
            bubble — size tokens
          </p>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            {SIZES.map(s => (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <GlassButtonBabel mode="bubble" size={s}>
                  <span style={{ fontSize: Math.max(s * 0.35, 8), opacity: 0.5 }}>●</span>
                </GlassButtonBabel>
                <span style={{ fontSize: 10, opacity: 0.4 }}>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pill sizes ── */}
        <section>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.4, marginBottom: "1rem", textTransform: "uppercase" }}>
            pill — size tokens
          </p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            {([20, 24, 28, 32, 36, 40, 48, 56] as SizeToken[]).map(s => (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <GlassButtonBabel mode="pill" size={s}>
                  <button style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: Math.max(s * 0.28, 9), fontWeight: 500, color: "#222",
                    width: "100%", height: "100%", padding: `0 ${s * 0.4}px`,
                    whiteSpace: "nowrap",
                  }}>
                    click me
                  </button>
                </GlassButtonBabel>
                <span style={{ fontSize: 10, opacity: 0.4 }}>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dock sizes ── */}
        <section>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.4, marginBottom: "1rem", textTransform: "uppercase" }}>
            dock — size tokens
          </p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            {([24, 32, 40, 48, 56, 64, 80, 96] as SizeToken[]).map(s => (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <GlassButtonBabel mode="dock" size={s}>
                  <span style={{ fontSize: Math.max(s * 0.22, 8), opacity: 0.45, letterSpacing: "0.04em" }}>
                    dock
                  </span>
                </GlassButtonBabel>
                <span style={{ fontSize: 10, opacity: 0.4 }}>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mixed usage ── */}
        <section>
          <p style={{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.4, marginBottom: "1rem", textTransform: "uppercase" }}>
            mixed — inline usage
          </p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* Nav items */}
            {["Home", "About", "Work", "Contact"].map(label => (
              <GlassButtonBabel key={label} mode="pill" size={36}>
                <button style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 500, color: "#111",
                  width: "100%", height: "100%", padding: "0 1rem",
                }}>
                  {label}
                </button>
              </GlassButtonBabel>
            ))}

            <GlassButtonBabel mode="bubble" size={36}>
              <span style={{ fontSize: 16 }}>⚙</span>
            </GlassButtonBabel>

            <GlassButtonBabel mode="bubble" size={48}>
              <span style={{ fontSize: 22 }}>🫧</span>
            </GlassButtonBabel>

            {/* custom size — not a token */}
            <GlassButtonBabel mode="pill" size={44} saturation={1.8}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#333" }}>
                GLASS
              </span>
            </GlassButtonBabel>
          </div>
        </section>

      </div>
    </div>
  );
}