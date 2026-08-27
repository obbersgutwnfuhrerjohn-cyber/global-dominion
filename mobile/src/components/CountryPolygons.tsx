import React, { useMemo } from "react";
import Svg, { Path } from "react-native-svg";
import geojson from "../data/countries.geojson";

type Country = {
  id: string;
  name: string;
  code?: string;
  color?: string;
  controllerCountryId?: string | null;
  originalCountryId?: string | null;
  status?: string;
  occupationResistance?: number;
};

type Props = {
  width: number;
  height: number;
  countries: Country[];
  selectedCountryId?: string | null;
  onSelectCountry: (countryId: string) => void;
  night?: boolean;
  mode?: "political" | "military" | "economy";
};

const FALLBACK = "#53616B";

function pointToXY(point: [number, number]) {
  const [lon, lat] = point;
  return [((lon + 180) / 360) * 1600, ((90 - lat) / 180) * 800] as const;
}

function ringPath(ring: number[][]) {
  if (!ring.length) return "";
  return ring.map((point, index) => {
    const [x, y] = pointToXY(point as [number, number]);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function geometryPaths(geometry: any): string[] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates.map(ringPath);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((polygon: number[][][]) => polygon.map(ringPath));
  return [];
}

export default function CountryPolygons({ width, height, countries, selectedCountryId, onSelectCountry, night, mode = "political" }: Props) {
  const items = useMemo(() => {
  const byCode = new Map((countries ?? []).map((country) => [country.code?.toUpperCase(), country]));
    return (geojson as any).features.map((feature: any) => {
      const iso = String(feature.properties?.iso_a3 || "").toUpperCase();
      const original = byCode.get(iso);
      if (!original) return null;
      const controller = countries.find((country) => country.id === original.controllerCountryId) || original;
      const selected = selectedCountryId === original.id || selectedCountryId === original.controllerCountryId;
      const warLike = original.status === "revolting" || original.status === "contested" || (original.occupationResistance ?? 0) >= 70;
      const fill = controller?.color || original.color || FALLBACK;
      const opacity = mode === "military" ? 0.17 : mode === "economy" ? 0.12 : 0.20;
      return {
        key: iso || feature.properties?.name,
        countryId: original.id,
        paths: geometryPaths(feature.geometry),
        fill,
        opacity: night ? opacity * 0.92 : opacity,
        stroke: selected ? "#FFE39A" : warLike ? "#FF725C" : "#C7D0D5",
        strokeWidth: selected ? 2.5 : warLike ? 1.5 : 0.7,
        dash: warLike ? "5 3" : undefined,
      };
    }).filter(Boolean);
  }, [countries, selectedCountryId, night, mode]);

  return (
    <Svg
      pointerEvents="box-none"
      width={width}
      height={height}
      viewBox="0 0 1600 800"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {items.map((item: any) => item.paths.map((d: string, index: number) => (
        <Path
          key={`${item.key}-${index}`}
          d={d}
          fill={item.fill}
          fillOpacity={item.opacity}
          stroke={item.stroke}
          strokeOpacity={night ? 0.72 : 0.55}
          strokeWidth={item.strokeWidth}
          strokeDasharray={item.dash}
          fillRule="evenodd"
          onPress={() => onSelectCountry(item.countryId)}
        />
      )))}
    </Svg>
  );
}
