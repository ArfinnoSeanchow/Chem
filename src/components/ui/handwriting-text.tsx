import { useEffect, useRef, useState } from "react";

/**
 * Redox UI Upgrade — HandwritingText
 * Version: 2.1.0
 *
 * Drop-in component for Vite + React + TypeScript.
 *
 * Also exports:
 * - PostLandingNav: compact single-line navbar for the section after the landing page.
 * - REDOX_CHANGELOG_ENTRY: ready-to-paste changelog entry.
 *
 * Usage:
 *   import { HandwritingText, PostLandingNav } from "./HandwritingText";
 */

const OPENTYPE_CDN =
  "https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js";

const DEFAULT_FONT_URL =
  "https://cdn.21st.dev/assets/mirror/13/1347863151acdc00fa281daaba1a3543dbce5870b55f9cf7479a15bb84007681.ttf";

export interface HandwritingTextProps {
  text?: string;
  words?: string[];
  interval?: number;
  fontUrl?: string;
  duration?: number;
  delay?: number;
  strokeWidth?: number;
  fill?: boolean;
  height?: string;
  className?: string;
}

type Geometry = {
  full: string;
  contours: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

let libPromise: Promise<any> | null = null;

function loadOpentype(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available"));
  }

  const existing = (window as any).opentype;
  if (existing) return Promise.resolve(existing);

  if (!libPromise) {
    libPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = OPENTYPE_CDN;
      script.async = true;

      script.onload = () => {
        const lib = (window as any).opentype;
        if (lib) resolve(lib);
        else reject(new Error("opentype.js loaded but exposed nothing"));
      };

      script.onerror = () =>
        reject(new Error("Failed to load opentype.js"));

      document.head.appendChild(script);
    });
  }

  return libPromise;
}

const fontCache = new Map<string, Promise<any>>();

function loadFont(url: string): Promise<any> {
  const cached = fontCache.get(url);
  if (cached) return cached;

  const pending = Promise.all([
    loadOpentype(),
    fetch(url, { mode: "cors" }).then((res) => {
      if (!res.ok) {
        throw new Error(`Font request failed: ${res.status} ${res.statusText}`);
      }
      return res.arrayBuffer();
    }),
  ]).then(([lib, buffer]) => lib.parse(buffer));

  fontCache.set(url, pending);
  return pending;
}

const EM = 100;

export function HandwritingText({
  text = "Redox",
  words = [],
  interval = 3200,
  fontUrl = DEFAULT_FONT_URL,
  duration = 1.5,
  delay = 0.05,
  strokeWidth = 1.6,
  fill = true,
  height = "1.15em",
  className = "",
}: HandwritingTextProps) {
  const cycle = words.length > 0;
  const [index, setIndex] = useState(0);
  const [font, setFont] = useState<any>(null);
  const [geom, setGeom] = useState<Geometry | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [lengths, setLengths] = useState<number[]>([]);
  const [fontError, setFontError] = useState(false);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  const current = cycle ? words[index % words.length] : text;

  useEffect(() => {
    if (!cycle) return;

    const id = window.setInterval(
      () => setIndex((value) => value + 1),
      interval
    );

    return () => window.clearInterval(id);
  }, [cycle, interval]);

  useEffect(() => {
    let cancelled = false;
    setFontError(false);

    loadFont(fontUrl)
      .then((loadedFont) => {
        if (!cancelled) setFont(loadedFont);
      })
      .catch((error) => {
        console.error("[HandwritingText] Font loading failed:", error);
        if (!cancelled) {
          setFont(null);
          setFontError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fontUrl]);

  useEffect(() => {
    if (!font || !current) {
      setGeom(null);
      return;
    }

    try {
      const path = font.getPath(current, 0, EM, EM);
      const box = path.getBoundingBox();
      const pad = EM * 0.12;
      const full = path.toPathData(2);

      const contours = full
        .split(/(?=M)/)
        .map((d: string) => d.trim())
        .filter((d: string) => d.length > 1);

      setGeom({
        full,
        contours,
        x: box.x1 - pad,
        y: box.y1 - pad,
        w: box.x2 - box.x1 + pad * 2,
        h: box.y2 - box.y1 + pad * 2,
      });

      setDrawn(false);
      setLengths([]);
      pathRefs.current = [];
    } catch (error) {
      console.error("[HandwritingText] Glyph generation failed:", error);
      setGeom(null);
    }
  }, [font, current]);

  useEffect(() => {
    if (!geom) return;

    const id = requestAnimationFrame(() => {
      setLengths(
        geom.contours.map((_, index) => {
          const element = pathRefs.current[index];
          return element ? element.getTotalLength() : 0;
        })
      );

      requestAnimationFrame(() => setDrawn(true));
    });

    return () => cancelAnimationFrame(id);
  }, [geom]);

  if (!current) return null;

  if (fontError || !geom) {
    return (
      <span className={className} style={{ display: "inline-block" }}>
        {current}
      </span>
    );
  }

  const count = Math.max(1, geom.contours.length);

  return (
    <svg
      key={current}
      viewBox={`${geom.x} ${geom.y} ${geom.w} ${geom.h}`}
      role="img"
      aria-label={current}
      className={["inline-block", className].filter(Boolean).join(" ")}
      style={{
        display: "inline-block",
        height,
        width: `calc(${height} * ${(geom.w / geom.h).toFixed(4)})`,
        overflow: "visible",
        verticalAlign: "middle",
      }}
    >
      {fill && (
        <path
          d={geom.full}
          fill="currentColor"
          stroke="none"
          style={{
            opacity: drawn ? 1 : 0,
            transition: drawn
              ? `opacity 0.45s ease-out ${(delay + duration * 0.72).toFixed(3)}s`
              : "none",
          }}
        />
      )}

      {geom.contours.map((d, i) => {
        const length = lengths[i] || 1;
        const each = Math.max(0.2, (duration / count) * 2.4);
        const start = delay + (i / count) * duration;

        return (
          <path
            key={`${current}-${i}`}
            ref={(element) => {
              pathRefs.current[i] = element;
            }}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={length}
            strokeDashoffset={drawn ? 0 : length}
            style={{
              transition: drawn
                ? `stroke-dashoffset ${each.toFixed(3)}s ease-out ${start.toFixed(3)}s`
                : "none",
            }}
          />
        );
      })}
    </svg>
  );
}

/**
 * Single-line post-landing navbar.
 *
 * The component intentionally uses only CSS classes and no external UI library.
 * Tailwind users can drop it into the page immediately.
 */
export interface PostLandingNavItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface PostLandingNavProps {
  items?: PostLandingNavItem[];
  className?: string;
}

export function PostLandingNav({
  items = [
    { label: "Solver", active: true },
    { label: "Reactions" },
    { label: "Methodology" },
    { label: "Verification" },
    { label: "About" },
  ],
  className = "",
}: PostLandingNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className={[
        "sticky top-0 z-40 w-full border-b border-black/10 bg-white/90 backdrop-blur-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-8 px-5 sm:px-8 lg:px-10">
        <a
          href="#top"
          className="shrink-0 text-sm font-semibold tracking-[-0.02em] text-black no-underline"
        >
          REDOX
        </a>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const content = (
              <span
                className={[
                  "relative inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors",
                  item.active
                    ? "bg-black text-white"
                    : "text-black/55 hover:bg-black/[0.05] hover:text-black",
                ].join(" ")}
              >
                {item.label}
              </span>
            );

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="no-underline"
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                className="appearance-none border-0 bg-transparent p-0"
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * Ready-to-paste changelog entry for the existing project's CHANGELOG.md.
 */
export const REDOX_CHANGELOG_ENTRY = `## 2.1.0 — UI / Handwriting Upgrade

### Added
- Reworked HandwritingText with a resilient font-loading fallback.
- Added animated SVG stroke drawing with graceful plain-text fallback.
- Added optional rotating words support.
- Added a compact single-line post-landing navigation component.

### Improved
- Removed the Next.js-only "use client" directive for Vite compatibility.
- Added visible font-loading errors in the browser console.
- Improved SVG sizing and vertical alignment.
- Improved navigation spacing, active state, and horizontal overflow behavior.

### Fixed
- HandwritingText no longer becomes visually empty when the remote font fails.
- Added safer handling for missing or empty text.
- Prevented stale SVG path references between animated phrases.
`;

export default HandwritingText;
