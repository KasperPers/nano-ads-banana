export interface ReferenceImage {
  base64: string;
  mimeType: string;
}

export interface GeminiRequest {
  prompt: string;
  referenceImages?: ReferenceImage[];
  aspectRatio: string;
  imageSize: string;
  model: 'pro' | 'flash';
  apiKey: string; // User-provided API key
}

export interface GeminiResponse {
  image: string | null;
  text: string | null;
}

export interface GeminiAPIError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}
