import { Link } from "@tanstack/react-router";
import type { Trainer } from "@/lib/mock-data";
import { Navigation, Plus, Minus } from "lucide-react";
import { useRef, useState } from "react";

type Props = { trainers: Trainer[] };

/** Stylized mock map with custom pins, pan and zoom. */
export function MapMock({ trainers }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({ x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) });
  };
  const onUp = () => { drag.current = null; };

  const recenter = () => { setPos({ x: 0, y: 0 }); setZoom(1); };

  return (
    <div className="relative h-[42vh] w-full overflow-hidden rounded-b-3xl bg-[#e8edf2] touch-none select-none">
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={(e) => setZoom((z) => Math.min(2.5, Math.max(0.7, z - e.deltaY * 0.001)))}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
          transformOrigin: "center",
          transition: drag.current ? "none" : "transform 0.15s ease-out",
        }}
      >
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#d6dde4" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M 0 120 Q 200 100 400 140 T 800 130" stroke="#cdd6df" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M 180 0 Q 200 200 240 400 T 280 800" stroke="#cdd6df" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M 0 280 Q 300 320 600 270 T 1000 290" stroke="#cdd6df" strokeWidth="10" fill="none" strokeLinecap="round" />
        </svg>

        <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
          <div className="relative">
            <div className="absolute inset-0 -m-3 animate-ping rounded-full bg-blue-500/30" />
            <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
          </div>
        </div>

        {trainers.map((t) => (
          <Link
            key={t.id} to="/trainer/$id" params={{ id: t.id }}
            className="absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
            style={{ left: `${t.posX}%`, top: `${t.posY}%` }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="relative flex flex-col items-center">
              {t.boosted && (
                <span className="mb-1 rounded-full bg-[var(--brand-black)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--brand-yellow)] shadow-md">
                  Premium
                </span>
              )}
              <div className="flex items-center gap-1.5 rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-yellow)] px-2.5 py-1 text-xs font-bold shadow-[var(--shadow-pin)]">
                <img src={t.photo} alt="" className="h-5 w-5 rounded-full bg-white" />
                R${t.pricePerHour}
              </div>
              <div className="-mt-0.5 h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-[var(--brand-black)]" />
            </div>
          </Link>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-1 rounded-xl bg-white shadow-md">
        <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))} className="flex h-9 w-9 items-center justify-center">
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border" />
        <button onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))} className="flex h-9 w-9 items-center justify-center">
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <button onClick={recenter} className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md">
        <Navigation className="h-5 w-5" />
      </button>
    </div>
  );
}
