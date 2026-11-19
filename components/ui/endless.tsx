"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ShoppingBag } from "lucide-react";

export const SPLASH_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584990347449-39904d60920a?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
];

const TOTAL = SPLASH_IMAGE_URLS.length;
const Z_FAR = -2400;
const Z_NEAR = 780;
const RANGE = Z_NEAR - Z_FAR;
const DURATION = 16;
const FADE_IN = 0.06;
const FADE_OUT = 0.04;

const css = `
.endless-root,
.endless-root *,
.endless-root *::before,
.endless-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.endless-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #050505;
  color: #ffffff;
  font-family: inherit;
  user-select: none;
}

.endless-root .endless-scene {
  position: absolute;
  inset: 0;
  -webkit-perspective: 1100px;
  perspective: 1100px;
  -webkit-perspective-origin: 50% 50%;
  perspective-origin: 50% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.endless-root .endless-world {
  position: absolute;
  inset: 0;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.endless-root .endless-plane {
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: #111111;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.2);
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
}

.endless-root .endless-plane img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.endless-root .endless-title-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 50;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: auto;
}

.endless-root .endless-title {
  color: #ffffff;
  font-family: inherit;
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  line-height: 1.1;
  text-transform: uppercase;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 20px rgba(99, 102, 241, 0.4));
  white-space: nowrap;
}

.endless-root .endless-badge {
  display: inline-block;
  margin-bottom: 0.75rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #c7d2fe;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 9999px;
  backdrop-filter: blur(8px);
}

@media (min-width: 768px) {
  .endless-root .endless-title {
    font-size: 4rem;
    letter-spacing: 0.18em;
  }
}

@media (min-width: 1200px) {
  .endless-root .endless-title {
    font-size: 5.5rem;
  }
}

.endless-root .endless-footer {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transform: translateX(-50%);
  color: #a1a1aa;
}

@media (min-width: 768px) {
  .endless-root .endless-footer {
    bottom: 2.5rem;
  }
}

.endless-root .endless-caption {
  color: #94a3b8;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
}

.endless-root .endless-enter-btn {
  margin-top: 0.5rem;
  padding: 0.6rem 1.6rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #0f172a;
  background: #ffffff;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.endless-root .endless-enter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 255, 255, 0.4);
}

/* iOS WebKit 3D fix */
@supports (-webkit-touch-callout: none) {
  .endless-root {
    overflow: visible;
    -webkit-clip-path: inset(0);
    clip-path: inset(0);
  }
}
`;

function opacityForProgress(progress: number) {
  if (progress < FADE_IN) return Math.max(0, progress / FADE_IN);
  if (progress > 1 - FADE_OUT) return Math.max(0, (1 - progress) / FADE_OUT);
  return 1;
}

function getLayout() {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;
  const planeW = width < 768 ? Math.min(width * 0.32, 220) : Math.min(width * 0.26, 440);
  return {
    planeW,
    planeH: planeW * (4 / 3),
    offsetX: width * 0.35,
    angle: 22,
  };
}

export interface EndlessProps {
  brandName?: string;
  tagline?: string;
  onEnter?: () => void;
}

export default function Endless({
  brandName = "NOVA MART",
  tagline = "Future of Luxury E-Commerce",
  onEnter,
}: EndlessProps) {
  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;

    const planes = Array.from(world.querySelectorAll<HTMLElement>(".endless-plane"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tweens: gsap.core.Tween[] = [];

    gsap.ticker.lagSmoothing(0);
    gsap.set(world, { force3D: true });

    const applyLayout = () => {
      const { planeW, planeH, offsetX, angle } = getLayout();
      planes.forEach((plane, index) => {
        const isLeft = index % 2 === 0;
        plane.style.width = `${planeW}px`;
        plane.style.height = `${planeH}px`;
        gsap.set(plane, {
          xPercent: -50,
          yPercent: -50,
          x: isLeft ? -offsetX : offsetX,
          y: 0,
          rotationY: isLeft ? angle : -angle,
          force3D: true,
        });
      });
    };

    applyLayout();

    planes.forEach((plane, index) => {
      const img = plane.querySelector("img") as HTMLImageElement;
      const startProgress = index / TOTAL;

      gsap.set(plane, { z: Z_FAR + startProgress * RANGE });
      if (img) img.style.opacity = String(opacityForProgress(startProgress));
      plane.style.zIndex = String(Math.round(startProgress * 1000));

      if (reduceMotion) return;

      const tween = gsap.fromTo(
        plane,
        { z: Z_FAR },
        {
          z: Z_NEAR,
          duration: DURATION,
          ease: "none",
          repeat: -1,
          immediateRender: false,
          onUpdate() {
            const progress = this.progress();
            if (img) img.style.opacity = String(opacityForProgress(progress));
            plane.style.zIndex = String(Math.round(progress * 1000));
          },
        },
      );

      tween.progress(startProgress);
      tweens.push(tween);
    });

    window.addEventListener("resize", applyLayout);

    return () => {
      window.removeEventListener("resize", applyLayout);
      tweens.forEach((tween) => tween.kill());
      gsap.killTweensOf(planes);
    };
  }, []);

  return (
    <section className="endless-root" aria-label={`${brandName} 3D Corridor Splash`}>
      <style>{css}</style>
      <div className="endless-scene">
        <div className="endless-world" ref={worldRef}>
          {SPLASH_IMAGE_URLS.map((url, i) => (
            <div className="endless-plane" key={`${url}-${i}`}>
              <img src={url} alt={`Nova Mart Spotlight ${i + 1}`} loading="eager" decoding="async" />
            </div>
          ))}
        </div>
      </div>

      <div className="endless-title-wrap">
        <span className="endless-badge">✨ Next-Gen Shopping Experience</span>
        <h1 className="endless-title">{brandName}</h1>
      </div>

      <div className="endless-footer">
        <ShoppingBag className="size-6 text-indigo-400" />
        <p className="endless-caption">{tagline}</p>
        {onEnter && (
          <button type="button" onClick={onEnter} className="endless-enter-btn">
            Enter Store →
          </button>
        )}
      </div>
    </section>
  );
}

export { Endless as Component };
