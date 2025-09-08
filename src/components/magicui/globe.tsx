"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const GLOBE_CONFIG = {
  width: 800,
  height: 600,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1] as [number, number, number],
  markerColor: [58 / 255, 159 / 255, 255 / 255] as [number, number, number], // Shiny dark blue
  glowColor: [1, 1, 1] as [number, number, number],
  markers: [
    { location: [14.5995, 120.9842] as [number, number], size: 0.03 },
    { location: [19.076, 72.8777] as [number, number], size: 0.1 },
    { location: [23.8103, 90.4125] as [number, number], size: 0.05 },
    { location: [30.0444, 31.2357] as [number, number], size: 0.07 },
    { location: [39.9042, 116.4074] as [number, number], size: 0.08 },
    { location: [-23.5558, -46.6396] as [number, number], size: 0.1 },
    { location: [19.4326, -99.1332] as [number, number], size: 0.1 },
    { location: [40.7128, -74.006] as [number, number], size: 0.1 },
    { location: [34.6937, 135.5023] as [number, number], size: 0.05 },
    { location: [41.8781, -87.6298] as [number, number], size: 0.1 },
    { location: [51.5072, -0.1276] as [number, number], size: 0.07 },
    { location: [40.7589, -73.9851] as [number, number], size: 0.1 },
    { location: [37.7749, -122.4194] as [number, number], size: 0.1 },
    { location: [52.52, 13.405] as [number, number], size: 0.1 },
    { location: [48.8566, 2.3522] as [number, number], size: 0.1 },
    { location: [37.5665, 126.978] as [number, number], size: 0.1 },
    { location: [35.6762, 139.6503] as [number, number], size: 0.1 },
    { location: [55.7558, 37.6173] as [number, number], size: 0.1 },
    { location: [41.9028, 12.4964] as [number, number], size: 0.1 },
    { location: [33.4484, -112.074] as [number, number], size: 0.1 },
  ],
};

export default function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: typeof GLOBE_CONFIG;
}) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      phi += delta / 200;
    }
  };

  const onRender = (state: Record<string, any>) => {
    if (!pointerInteracting.current) phi += 0.002; // Slower rotation
    state.phi = phi;
    state.width = width * 2;
    state.height = width * 2;
  };

  const onResize = () => {
    if (canvasRef.current && (width = canvasRef.current.offsetWidth)) {
      window.addEventListener("resize", onResize);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    });

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    });
    return () => globe.destroy();
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[800px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_style_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}