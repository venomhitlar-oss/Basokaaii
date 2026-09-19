import { AIModel } from '../types';

export const MODEL_REGISTRY: AIModel[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (خێرا و فرەچەشن)',
    provider: 'google',
    descriptionKurdish: 'مۆدێلی بنەڕەتی و خێرا بۆ وەڵامدانەوە، گفتوگۆی ڕۆژانە، کورتکردنەوە و شییکاری بە کوردی.',
    contextWindow: '1M Tokens',
    speed: 'زۆر خێرا',
    tier: 'خۆڕایی',
    capabilities: {
      text: true,
      vision: true,
      imageGen: false,
      audio: true,
      coding: true,
      reasoning: true,
      rag: true,
    },
    enabled: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro (بیرکردنەوەی قووڵ و کۆد)',
    provider: 'google',
    descriptionKurdish: 'مۆدێلی زیرەکی بەهێز بۆ بیرکردنەوەی ئاڵۆز، کۆدنووسین، بیرکاری و شیکاریی زانستی قووڵ.',
    contextWindow: '2M Tokens',
    speed: 'مامناوەند',
    tier: 'پێشکەوتوو',
    capabilities: {
      text: true,
      vision: true,
      imageGen: false,
      audio: false,
      coding: true,
      reasoning: true,
      rag: true,
    },
    enabled: true,
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Gemini Image Studio (دروستکردنی وێنە)',
    provider: 'google',
    descriptionKurdish: 'دروستکردنی وێنەی بینراو و هونەری لە دەقی کوردی و ئینگلیزی بە کواڵیتی بەرز.',
    contextWindow: '32K Tokens',
    speed: 'خێرا',
    tier: 'پێشکەوتوو',
    capabilities: {
      text: false,
      vision: true,
      imageGen: true,
      audio: false,
      coding: false,
      reasoning: false,
      rag: false,
    },
    enabled: true,
  },
  {
    id: 'gemini-3.5-transcribe',
    name: 'Gemini Audio Transcribe (وەرگێڕانی دەنگ)',
    provider: 'google',
    descriptionKurdish: 'گۆڕینی دەنگ و فایلە دەنگییەکان بۆ دەقی نووسراو بە وردبینییەکی بەرز.',
    contextWindow: '128K Tokens',
    speed: 'خێرا',
    tier: 'خۆڕایی',
    capabilities: {
      text: true,
      vision: false,
      imageGen: false,
      audio: true,
      coding: false,
      reasoning: false,
      rag: false,
    },
    enabled: true,
  },
];

export interface RouterDecision {
  selectedModel: string;
  modelName: string;
  reason: string;
  isImageTask: boolean;
}

/**
 * Intelligent Auto Model Router
 * Inspects the prompt, attachments, and context to pick the optimal model.
 */
export function autoRouteModel(prompt: string, hasImages: boolean = false, hasAudio: boolean = false): RouterDecision {
  const lower = prompt.toLowerCase();

  // Image Generation detection (Kurdish keywords: وێنە، بکێشە، دروست بکە، نیگار)
  const isImageGen =
    lower.includes('وێنە') &&
    (lower.includes('بکێشە') ||
      lower.includes('دروست') ||
      lower.includes('ببەخشە') ||
      lower.includes('draw') ||
      lower.includes('generate') ||
      lower.includes('image') ||
      lower.includes('picture'));

  if (isImageGen) {
    return {
      selectedModel: 'gemini-3.1-flash-lite-image',
      modelName: 'Gemini Image Studio',
      reason: 'داواکاری دروستکردنی وێنەی بینراو دەستنیشانکرا',
      isImageTask: true,
    };
  }

  // Deep reasoning / complex coding detection
  const isComplex =
    lower.includes('کۆد') ||
    lower.includes('بەرنامە') ||
    lower.includes('فەنکشن') ||
    lower.includes('ئەلگۆریتم') ||
    lower.includes('کێشەی بیرکاری') ||
    lower.includes('function') ||
    lower.includes('class') ||
    lower.includes('algorithm') ||
    lower.includes('python') ||
    lower.includes('typescript') ||
    lower.includes('react') ||
    lower.includes('sql') ||
    lower.includes('debug') ||
    lower.length > 800;

  if (isComplex) {
    return {
      selectedModel: 'gemini-3.1-pro-preview',
      modelName: 'Gemini 3.1 Pro',
      reason: 'داواکاری ئەندازیاری، کۆدنووسین یان بیرکردنەوەی قووڵ دەستنیشانکرا',
      isImageTask: false,
    };
  }

  // Default to Gemini 3.8 Flash
  return {
    selectedModel: 'gemini-3.8-flash',
    modelName: 'Gemini 3.8 Flash',
    reason: 'خێراترین و گونجاوترین مۆدێل بۆ وەڵامدانەوەی سۆرانی هەڵبژێردرا',
    isImageTask: false,
  };
}

/**
 * Smart Fallback selector if current model fails
 */
export function getFallbackModel(currentModelId: string): string {
  if (currentModelId === 'gemini-3.1-pro-preview') {
    return 'gemini-3.8-flash';
  }
  if (currentModelId === 'gemini-3.1-flash-lite-image') {
    return 'gemini-3.8-flash'; // fallback to descriptive generation
  }
  return 'gemini-3.8-flash';
}
