import {
  Projector,
  Wind,
  PenLine,
  Table2,
  Armchair,
  Monitor,
  Tv,
  Speaker,
  Presentation,
  Wifi,
  Check,
  type LucideIcon,
} from 'lucide-react';

const FACILITY_ICONS: Record<string, LucideIcon> = {
  proyektor: Projector,
  projector: Projector,
  ac: Wind,
  'air conditioner': Wind,
  whiteboard: PenLine,
  papan: PenLine,
  'meja rapat': Table2,
  'meja bundar': Table2,
  meja: Table2,
  table: Table2,
  'meja-kursi': Armchair,
  kursi: Armchair,
  lcd: Tv,
  tv: Tv,
  'sound system': Speaker,
  speaker: Speaker,
  audio: Speaker,
  podium: Presentation,
  komputer: Monitor,
  computer: Monitor,
  'jaringan lan': Wifi,
  lan: Wifi,
  wifi: Wifi,
};

export function getFacilityIcon(name: string): LucideIcon {
  return FACILITY_ICONS[name.trim().toLowerCase()] ?? Check;
}
