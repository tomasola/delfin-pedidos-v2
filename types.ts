
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface ExtractedData {
  reference: string;
  length: string;
  quantity: string;
  boundingBox?: BoundingBox;
}

export interface Record {
  id: string;
  reference: string;
  length: string;
  quantity: string;
  originalImage: string; // Base64
  croppedImage: string; // Base64
  timestamp: number;
  // Nuevos campos para empaque
  boxSize?: string;
  packingPhoto?: string; // Base64
}

export type AppTab = 'scan' | 'history' | 'data' | 'admin';

export interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProductLine {
  reference: string;
  denomination: string;
  totalMeters: number;
  metersPerUnit?: number;
  boxes?: number;
  unitsPerBox?: number;
}

export interface OrderRecord {
  id: string;
  clientName: string;
  clientNumber: string;
  orderNumber: string;
  date: string;
  notes: string;
  products: ProductLine[];  // Changed from single product to array
  originalImage: string;
  croppedImage?: string;
  timestamp: number;
  status: 'pendiente' | 'completado';
}

