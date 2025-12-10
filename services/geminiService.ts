import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ExtractedData } from '../types';

const MODEL_NAME = 'gemini-1.5-pro'; // Testing Pro model to debug 404/Update issues

// ... (rest of imports)

// ... inside identifyProduct ...

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    documentType: {
      type: SchemaType.STRING,
      description: "Type of document detected: 'LABEL' for industrial labels/tags, 'ORDER' for sales orders/invoices, 'UNKNOWN' if unclear",
      enum: ["LABEL", "ORDER", "UNKNOWN"]
    },
    reference: { type: SchemaType.STRING, description: "The product reference code or ID found on the label." },
    length: { type: SchemaType.STRING, description: "The length dimension found on the label (e.g., 6000mm, 6m)." },
    quantity: { type: SchemaType.STRING, description: "The quantity or count found on the label." },
    boundingBox: {
      type: SchemaType.OBJECT,
      description: "The bounding box of the technical drawing/profile sketch (usually black lines on white background). Returns values normalized 0-1000.",
      properties: {
        ymin: { type: SchemaType.NUMBER },
        xmin: { type: SchemaType.NUMBER },
        ymax: { type: SchemaType.NUMBER },
        xmax: { type: SchemaType.NUMBER },
      },
      required: ["ymin", "xmin", "ymax", "xmax"]
    }
  },
  required: ["documentType", "reference", "length", "quantity", "boundingBox"]
} as any;

export const analyzeImage = async (base64Image: string): Promise<ExtractedData> => {
  try {
    // @ts-ignore
    const apiKey = import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
    if (!apiKey) throw new Error("API Key is missing");

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      }
    });

    const prompt = `
      FIRST: Determine if this image is an industrial LABEL/TAG or a sales ORDER/INVOICE.
      - LABEL: Small tags with reference codes (REF:xxxxx), dimensions (Long:, Cant:), usually with technical drawings
      - ORDER: Full page documents with order numbers, client info, multiple products, tables
      
      Then analyze this industrial label. 
      Extract the Reference Number, Length, and Quantity.
      Also, identify the technical drawing or profile cross-section (usually a black line drawing). 
      Return the bounding box for this drawing.
      If a field is not found, return empty string.
    `;

    const result = await model.generateContent([
      { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
      prompt
    ]);

    const response = result.response;
    const text = response.text();

    return JSON.parse(text) as ExtractedData;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

// ... inside identifyProduct ...
export const identifyProduct = async (targetBase64: string, candidates: { reference: string; image: string }[]): Promise<{ matchedReference: string | null; reasoning?: string }> => {
  try {
    // @ts-ignore
    const apiKey = import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
    if (!apiKey) throw new Error("API Key is missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const cleanTarget = targetBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    // Prepare prompt parts: Target Image + (Labeled Candidate Images)
    const promptParts: any[] = [
      "Here is a TARGET image of a product I want to identify (the first image).",
      { inlineData: { mimeType: "image/jpeg", data: cleanTarget } },
      "Below are CANDIDATE images from my database, each with a known reference number.",
    ];

    candidates.forEach((candidate, index) => {
      const cleanCandidate = candidate.image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      promptParts.push(`Candidate #${index + 1} (Reference: ${candidate.reference}):`);
      promptParts.push({ inlineData: { mimeType: "image/jpeg", data: cleanCandidate } });
    });

    promptParts.push(`
      TASK: Compare the TARGET image to EACH of the CANDIDATE images.
      
      Output a JSON object containing a list called "rankedCandidates".
      For each candidate, provide:
      - "reference": The reference number.
      - "score": A similarity score between 0 and 100 (where 100 is identical).
      - "reasoning": A short note on why it matches or not.
      
      CRITERIA:
      - Compare the SHAPE/GEOMETRY in the target photo vs the drawing/photo in the candidate.
      - Be generous with scores. If it looks vaguely similar, give it > 50.
      
      Format:
      {
        "rankedCandidates": [
          { "reference": "12345", "score": 85, "reasoning": "..." },
          ...
        ]
      }
    `);

    const result = await model.generateContent(promptParts);
    const response = result.response;
    const text = response.text();

    const data = JSON.parse(text);

    // Sort by score descending
    const ranked = (data.rankedCandidates || []).sort((a: any, b: any) => b.score - a.score);
    const bestMatch = ranked[0];

    if (bestMatch && bestMatch.score > 0) {
      return {
        matchedReference: bestMatch.reference,
        reasoning: `Score: ${bestMatch.score}/100. ${bestMatch.reasoning}`
      };
    }

    return { matchedReference: null, reasoning: "No valid candidates returned." };

  } catch (error) {
    console.error("Visual Search Error:", error);
    return { matchedReference: null, reasoning: error instanceof Error ? error.message : "API Error" };
  }
};

export const testModelAvailability = async (): Promise<string> => {
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-1.0-pro'];
  let report = "Informe de Modelos disponibles:\n";

  // Need API Key again
  // @ts-ignore
  const apiKey = import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
  if (!apiKey) return "Error: No API Key found in env.";

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent("hello");
      report += `✅ ${m}: FUNCIONA\n`;
    } catch (e: any) {
      report += `❌ ${m}: Falló (${e.message?.slice(0, 50)}...)\n`;
    }
  }
  return report;
};

const FALLBACK_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro'
];

export const identifyProductWithFallback = async (targetBase64: string, candidates: { reference: string; image: string }[]): Promise<{ matchedReference: string | null; reasoning?: string }> => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '');
  if (!apiKey) throw new Error("API Key is missing");
  const genAI = new GoogleGenerativeAI(apiKey);

  const cleanTarget = targetBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const promptParts: any[] = [
    "Here is a TARGET image of a product I want to identify (the first image).",
    { inlineData: { mimeType: "image/jpeg", data: cleanTarget } },
    "Below are CANDIDATE images from my database, each with a known reference number.",
  ];

  candidates.forEach((candidate, index) => {
    const cleanCandidate = candidate.image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    promptParts.push(`Candidate #${index + 1} (Reference: ${candidate.reference}):`);
    promptParts.push({ inlineData: { mimeType: "image/jpeg", data: cleanCandidate } });
  });

  promptParts.push(`
      TASK: Compare the TARGET image to EACH of the CANDIDATE images.
      Output a JSON object containing a list called "rankedCandidates".
      For each candidate, provide:
      - "reference": The reference number.
      - "score": A similarity score between 0 and 100 (where 100 is identical).
      - "reasoning": A short note.
      Format: { "rankedCandidates": [{ "reference": "...", "score": 85, "reasoning": "..." }] }
  `);

  let errors: string[] = [];

  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`🤖 Intentando Visual Search con modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
      });

      const result = await model.generateContent(promptParts);
      const response = result.response;
      const text = response.text();
      const data = JSON.parse(text);

      const ranked = (data.rankedCandidates || []).sort((a: any, b: any) => b.score - a.score);
      const bestMatch = ranked[0];

      if (bestMatch && bestMatch.score > 0) {
        return {
          matchedReference: bestMatch.reference,
          reasoning: `(Modelo: ${modelName}) Score: ${bestMatch.score}. ${bestMatch.reasoning}`
        };
      }
      return { matchedReference: null, reasoning: `(Modelo: ${modelName}) No candidates returned.` };

    } catch (error: any) {
      console.warn(`❌ Falló modelo ${modelName}:`, error.message);
      errors.push(`${modelName}: ${error.message?.slice(0, 200)}`);
    }
  }

  return { matchedReference: null, reasoning: `Todos fallaron. Detalles: ${errors.join(' | ')}` };
};