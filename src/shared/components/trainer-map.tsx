import L from "leaflet";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Trainer } from "../../modules/marketplace/domain/marketplace.types";

type Props = {
  trainers: Trainer[];
};

const DEFAULT_CENTER: L.LatLngExpression = [-23.5505, -46.6333];

function markerLabel(trainer: Trainer): HTMLElement {
  const content = document.createElement("div");
  content.className = "trainer-map-popup";

  const name = document.createElement("strong");
  name.textContent = trainer.name;
  content.append(name);

  const details = document.createElement("span");
  details.textContent = `${trainer.specialties[0] ?? "Treino personalizado"} · R$ ${trainer.pricePerHour}/h`;
  content.append(details);

  const link = document.createElement("a");
  link.href = `/trainer/${trainer.id}`;
  link.textContent = "Ver perfil";
  content.append(link);
  return content;
}

function markerIcon(trainer: Trainer) {
  const initial = trainer.name.trim().charAt(0).toUpperCase() || "P";
  return L.divIcon({
    className: "trainer-map-marker-wrapper",
    html: `<span class="trainer-map-marker ${trainer.boosted ? "trainer-map-marker-premium" : ""}">${initial}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });
}

export function TrainerMap({ trainers }: Props) {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const [locating, setLocating] = useState(false);
  const trainersWithCoords = useMemo(
    () =>
      trainers.filter(
        (trainer): trainer is Trainer & { latitude: number; longitude: number } =>
          trainer.latitude != null && trainer.longitude != null,
      ),
    [trainers],
  );

  useEffect(() => {
    if (!mapElement.current || map.current) return;

    const instance = L.map(mapElement.current, { zoomControl: false, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(instance);
    markers.current = L.layerGroup().addTo(instance);
    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
      markers.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !markers.current) return;

    markers.current.clearLayers();
    const bounds = L.latLngBounds([]);
    trainersWithCoords.forEach((trainer) => {
      const marker = L.marker([trainer.latitude, trainer.longitude], { icon: markerIcon(trainer) });
      marker.bindPopup(markerLabel(trainer), { closeButton: false, offset: [0, -4] });
      marker.addTo(markers.current!);
      bounds.extend([trainer.latitude, trainer.longitude]);
    });

    if (trainersWithCoords.length > 1) {
      map.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (trainersWithCoords.length === 1) {
      map.current.setView([trainersWithCoords[0].latitude, trainersWithCoords[0].longitude], 14);
    } else {
      map.current.setView(DEFAULT_CENTER, 12);
    }
  }, [trainersWithCoords]);

  const locateUser = () => {
    if (!map.current || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.current?.setView([coords.latitude, coords.longitude], 14);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="relative h-[42vh] min-h-72 w-full overflow-hidden rounded-b-3xl bg-[#e8edf2]">
      <div ref={mapElement} className="h-full w-full" />

      <div className="absolute right-4 top-4 z-[500] flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
        <button type="button" aria-label="Aumentar zoom" onClick={() => map.current?.zoomIn()} className="flex h-10 w-10 items-center justify-center hover:bg-muted">
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px bg-border" />
        <button type="button" aria-label="Reduzir zoom" onClick={() => map.current?.zoomOut()} className="flex h-10 w-10 items-center justify-center hover:bg-muted">
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <button type="button" aria-label="Usar minha localização" onClick={locateUser} disabled={locating} className="absolute bottom-4 right-4 z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md hover:bg-muted disabled:opacity-60">
        <LocateFixed className={`h-5 w-5 ${locating ? "animate-pulse" : ""}`} />
      </button>

      {trainersWithCoords.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[400] rounded-xl bg-white/95 px-3 py-2 text-center text-xs text-muted-foreground shadow-sm">
          Nenhum profissional com localização disponível.
        </div>
      )}
    </div>
  );
}