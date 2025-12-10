
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface ExtractedData {
  documentType?: 'LABEL' | 'ORDER' | 'UNKNOWN';
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
  notes?: string;
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
  timestamp: string;
  orderNumber?: string;
  customerName?: string; // NEW: Added for Excel export
  items?: any[]; // NEW: Added for order items
  status?: string; // NEW: Added for order status
  notes?: string;
}

export interface SyncProgressData {
  current: number;
  total: number;
  type: string;
}

export interface ExportData {
  records: Record[];
  orders: OrderRecord[];
}

export interface ReferenceImage {
  id: string;           // UUID
  reference: string;    // Product reference (e.g., "10008")
  imageData: string;    // Base64 PNG image (high quality)
  fileName: string;     // Original filename
  uploadedAt: number;   // Timestamp
  notes?: string;       // Optional description
}
