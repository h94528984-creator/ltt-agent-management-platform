export type ServiceCenterEntry = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
};

export const SERVICE_CENTERS: ServiceCenterEntry[] = [
  { id: 1, name: "مركز خدمات غرب طرابلس",   lat: 32.84333929, lng: 13.06906152, address: "" },
  { id: 2, name: "مركز خدمات الزاوية",        lat: 32.76599097, lng: 12.73618057, address: "" },
  { id: 3, name: "مركز خدمات غريان",           lat: 32.17003923, lng: 13.00607412, address: "" },
  { id: 4, name: "مركز خدمات جنوب طرابلس",   lat: 32.83905969, lng: 13.14877326, address: "" },
  { id: 5, name: "مركز خدمات شارع الزاوية",   lat: 32.87278696, lng: 13.19058980, address: "شارع الزاوية" },
  { id: 6, name: "مركز خدمات كبار العملاء",   lat: 32.89204760, lng: 13.16715321, address: "برج طرابلس" },
];
