import { Link } from "@tanstack/react-router";
import { Minus, Navigation, Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Trainer } from "../../modules/marketplace/domain/marketplace.types";

type Props = {
  trainers: Trainer[];
};

type Position = { left: number; top: number };

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function positionsFor(trainers: Trainer[]): Map<string, Position> {
  const entries = trainers.map((trainer) => ({ id: trainer.id, lat: trainer.latitude, lng: trainer.longitude }));
  const withCoords = entries.filter((entry): entry is { id: string; lat: number; lng: number } =>
    entry.lat != null && entry.lng != null,
  );

  if (withCoords.length === 0) {
    return new Map(
      entries.map((entry, index) => [
        entry.id,
        { left: 20 + ((index * 30) % 60), top: 32 + ((index * 22) % 42) },
      ]),
    );
  }

  const lats = withCoords.map((entry) => entry.lat);
  const lngs = withCoords.map((entry) => entry.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = Math.max(0.001, maxLat - minLat);
  const spanLng = Math.max(0.001, maxLng - minLng);

  return new Map(
    withCoords.map((entry) => [
      entry.id,
      {
        left: 15 + ((entry.lng - minLng) / spanLng) * 70,
        top: 25 + (1 - (entry.lat - minLat) / spanLat) * 55,
      },
    ] as [string, Position]),
  );
}

function MapPinBadge({ trainer }: { trainer: Trainer }) {
  if (trainer.photo) {
    return <img src={trainer.photo} alt="" className="h-5 w-5 rounded-full bg-white object-cover" />;
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[var(--brand-black)]">
      {initialsOf(trainer.name)}
    </span>
  );
}

export function MapMock({ trainers }: Props) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const positions = useMemo(() => positionsFor(trainers), [trainers]);

  const onDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, ox: position.x, oy: position.y };
  };

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;

    setPosition({
      x: drag.current.ox + (event.clientX - drag.current.x),
      y: drag.current.oy + (event.clientY - drag.current.y),
    });
  };

  const onUp = () => {
    drag.current = null;
  };

  return (
    <div className="relative h-[42vh] w-full overflow-hidden rounded-b-3xl bg-[#e8edf2] select-none touch-none">
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={(event) => setZoom((current) => Math.min(2.5, Math.max(0.7, current - event.deltaY * 0.001)))}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
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

        {trainers.map((trainer) => {
          const pos = positions.get(trainer.id) ?? { left: 50, top: 50 };
          return (
            <Link
              key={trainer.id}
              to="/trainer/$id"
              params={{ id: trainer.id }}
              className="absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="relative flex flex-col items-center">
                {trainer.boosted && (
                  <span className="mb-1 rounded-full bg-[var(--brand-black)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--brand-yellow)] shadow-md">
                    Premium
                  </span>
                )}
                <div className="flex items-center gap-1.5 rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-yellow)] px-2.5 py-1 text-xs font-bold shadow-[var(--shadow-pin)]">
                  <MapPinBadge trainer={trainer} />
                  R$ {trainer.pricePerHour}
                </div>
                <div className="-mt-0.5 h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-[var(--brand-black)]" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="absolute right-4 top-4 flex flex-col gap-1 rounded-xl bg-white shadow-md">
        <button type="button" onClick={() => setZoom((current) => Math.min(2.5, current + 0.2))} className="flex h-9 w-9 items-center justify-center">
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border" />
        <button type="button" onClick={() => setZoom((current) => Math.max(0.7, current - 0.2))} className="flex h-9 w-9 items-center justify-center">
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <button type="button" onClick={() => { setPosition({ x: 0, y: 0 }); setZoom(1); }} className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md">
        <Navigation className="h-5 w-5" />
      </button>
    </div>
  );
}