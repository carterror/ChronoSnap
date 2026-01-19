export interface Era {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  gradient: string;
}

export type AppState = 'intro' | 'capture' | 'select-era' | 'processing' | 'result';

export interface GenerationConfig {
  apiKey: string;
}

export interface ProcessedImage {
  original: string; // Base64
  generated: string | null; // Base64
  era: Era | null;
}
