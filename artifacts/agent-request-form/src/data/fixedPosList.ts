export type FixedPosEntry = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
};

export const FIXED_POS_LIST: FixedPosEntry[] = [
  { id: 1, name: "نقطة بيع مطار معيتيقة", lat: 32.905696, lng: 13.273555, address: "مطار معيتيقة الدولي" },
];
