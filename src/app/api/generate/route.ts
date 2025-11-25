import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { GeminiRequest, GeminiResponse } from '@/lib/gemini/types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const MODEL_MAP: Record<string, string> = {
  pro: 'gemini-3-pro-image-preview',
  flash: 'gemini-2.5-flash-preview-image',
};

// Request validation schema
const requestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  apiKey: z.string().min(1, 'API key is required'),
  aspectRatio: z.enum(['1:1', '9:16', '4:5', '16:9'], {
    message: 'Invalid aspect ratio',
  }),
  imageSize: z.string().min(1, 'Image size is required'),
  model: z.enum(['pro', 'flash'], {
    message: 'Invalid model selection',
  }),
  referenceImages: z.array(z.object({
    base64: z.string(),
    mimeType: z.string(),
  })).max(6, 'Maximum 6 reference images allowed').optional(),
});

// Type-safe Gemini API response parsing
interface GeminiApiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

interface GeminiApiCandidate {
  content?: {
    parts?: GeminiApiPart[];
    role?: string;
  };
  finishReason?: string;
  index?: number;
}

interface GeminiApiResponse {
  candidates?: GeminiApiCandidate[];
  error?: {
    code: number;
    message: string;
    status?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GeminiRequest = await request.json();

    // Validate request with Zod
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Invalid request - please check your inputs' },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const apiKey = validatedData.apiKey;

    // Map model name
    const modelId = MODEL_MAP[validatedData.model];

    // Build request parts
    const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];

    // Add text prompt
    parts.push({ text: validatedData.prompt });

    // Add reference images
    if (validatedData.referenceImages && validatedData.referenceImages.length > 0) {
      validatedData.referenceImages.forEach((image) => {
        parts.push({
          inline_data: {
            mime_type: image.mimeType,
            data: image.base64,
          },
        });
      });
    }

    // Build Gemini API request
    const geminiRequest = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: validatedData.aspectRatio,
          imageSize: validatedData.imageSize,
        },
      },
    };

    // Call Gemini API
    const response = await fetch(
      `${GEMINI_API_BASE}/${modelId}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(geminiRequest),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      // Log error details only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Gemini API error:', errorData);
      }

      // Map status codes to user-friendly error messages
      let userMessage: string;
      switch (response.status) {
        case 401:
          userMessage = 'Invalid API key - please check your Gemini API key in Settings';
          break;
        case 429:
          userMessage = 'Rate limit exceeded - please wait a moment before trying again';
          break;
        case 400:
          userMessage = 'Invalid request - please check your inputs';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = 'Service temporarily unavailable - please try again later';
          break;
        default:
          userMessage = 'Failed to generate content - please try again';
      }

      return NextResponse.json(
        { error: userMessage },
        { status: response.status }
      );
    }

    const data: GeminiApiResponse = await response.json();

    // Parse response to extract image and text
    let image: string | null = null;
    let text: string | null = null;

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      if (candidate.content && candidate.content.parts) {
        candidate.content.parts.forEach((part: GeminiApiPart) => {
          // Extract text
          if (part.text) {
            text = part.text;
          }

          // Extract image (base64)
          if (part.inline_data && part.inline_data.data) {
            image = part.inline_data.data;
          }
        });
      }
    }

    const result: GeminiResponse = {
      image,
      text,
    };

    return NextResponse.json(result);
  } catch (error) {
    // Log error details only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in generate API:', error);
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred - please try again' },
      { status: 500 }
    );
  }
}
