import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ProductLine } from '../types';

const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        documentType: {
            type: SchemaType.STRING,
            description: "Type of document detected: 'ORDER' for sales orders/invoices, 'LABEL' for industrial labels/tags, 'UNKNOWN' if unclear",
            enum: ["ORDER", "LABEL", "UNKNOWN"]
        },
        clientName: { type: SchemaType.STRING, description: "Nombre del cliente" },
        clientNumber: { type: SchemaType.STRING, description: "Número de cliente" },
        orderNumber: { type: SchemaType.STRING, description: "Número de pedido" },
        date: { type: SchemaType.STRING, description: "Fecha del pedido (YYYY-MM-DD)" },
        notes: { type: SchemaType.STRING, description: "Notas adicionales" },
        products: {
            type: SchemaType.ARRAY,
            description: "Array de productos/líneas del pedido",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    reference: { type: SchemaType.STRING, description: "Código/Referencia del producto" },
                    denomination: { type: SchemaType.STRING, description: "Denominación o descripción del producto" },
                    totalMeters: { type: SchemaType.NUMBER, description: "Cantidad total en metros lineales" },
                    metersPerUnit: { type: SchemaType.NUMBER, description: "Metros por barra/unidad (UD/CAJA)" },
                    boxes: { type: SchemaType.NUMBER, description: "Número de cajas" },
                    unitsPerBox: { type: SchemaType.NUMBER, description: "Unidades por caja" }
                },
                required: ["reference", "denomination", "totalMeters"]
            }
        }
    },
    required: ["documentType", "clientName", "orderNumber", "date", "products"]
} as any;

export interface ExtractedOrderData {
    documentType?: 'ORDER' | 'LABEL' | 'UNKNOWN';
    clientName?: string;
    clientNumber?: string;
    orderNumber?: string;
    date?: string;
    notes?: string;
    products?: ProductLine[];
}

export const analyzeOrderImage = async (base64Image: string): Promise<ExtractedOrderData> => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key is missing");

        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            }
        });

        const prompt = `
FIRST: Determine if this image is a sales ORDER/INVOICE or an industrial LABEL/TAG.
- ORDER: Full page document with "PEDIDO DE VENTA", order number, client info, table with multiple products
- LABEL: Small tag with reference code (REF:xxxx), dimensions (Long:, Cant:), technical drawing

Then analyze this order document.

Extrae la siguiente información:

1. DATOS DEL CLIENTE:
   - Nombre del Cliente
   - Número de Cliente (si está visible)
   - Número de Pedido
   - Fecha
   - Notas adicionales (si hay)

2. TODAS LAS LÍNEAS DE PRODUCTOS (puede haber múltiples):
   Para CADA producto en el pedido, extrae:
   - Código/Referencia (CODIGO)
   - Denominación/Descripción (DENOMINACIÓN)
   - Cantidad total en metros (CANTIDAD)
   - Metros por barra/unidad (UD/CAJA) si está disponible
   - Número de cajas (CAJAS) si está disponible
   - Unidades por caja si está disponible

IMPORTANTE: Devuelve TODOS los productos como un array. Si hay 3 productos, devuelve 3 elementos en el array "products".

Si no encuentras algún campo, déjalo vacío o null.
    `;

        const result = await model.generateContent([
            { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
            prompt
        ]);

        const response = result.response;
        const text = response.text();

        console.log("=== GEMINI RAW RESPONSE (MULTI-PRODUCT) ===");
        console.log(text);
        console.log("=== END RESPONSE ===");

        return JSON.parse(text) as ExtractedOrderData;

    } catch (error) {
        console.error("Gemini Order Analysis Error:", error);
        throw error;
    }
};
