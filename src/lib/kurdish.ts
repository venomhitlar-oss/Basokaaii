/**
 * Kurdish Quality Engine & Typography Utilities for Basoka AI
 * Specifically tailored for Sorani Kurdish (ckb)
 */

export const KURDISH_NORMALIZATION_RULES: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
  { pattern: /ي/g, replacement: 'ی', reason: 'گۆڕینی یای عەرەبی بۆ پیتی کوردی ی' },
  { pattern: /ك/g, replacement: 'ک', reason: 'گۆڕینی کافی عەرەبی بۆ کافی کوردی ک' },
  { pattern: /ى/g, replacement: 'ی', reason: 'گۆڕینی ئەلفی مەقسوورە بۆ ی' },
  { pattern: /ة/g, replacement: 'ە', reason: 'گۆڕینی تای تەئنیث بۆ پیتە بزوێنی کوردی ە' },
  { pattern: /ؤ/g, replacement: 'ۆ', reason: 'گۆڕینی واوی هەمزەدار بۆ ۆ' },
  { pattern: /ئەو ها/g, replacement: 'ئەوها', reason: 'چاکسازی بۆشایی لە وشەی لێکدراو' },
  { pattern: /پێ وست/g, replacement: 'پێویست', reason: 'پێکەوەبەستنی وشەی پێویست' },
  { pattern: /دڵ نیا/g, replacement: 'دڵنیا', reason: 'پێکەوەبەستنی وشەی دڵنیا' },
];

/**
 * Normalizes Kurdish Sorani text for correct typography and encoding
 */
export function normalizeKurdishText(text: string): string {
  if (!text) return '';
  let result = text;
  for (const rule of KURDISH_NORMALIZATION_RULES) {
    result = result.replace(rule.pattern, rule.replacement);
  }
  // Normalize spacing around Kurdish punctuation
  result = result
    .replace(/\s+([،؛؟:.!])/g, '$1')
    .replace(/([،؛؟])(?=[^\s])/g, '$1 ')
    .replace(/\s{2,}/g, ' ');

  return result.trim();
}

/**
 * Detects possible Kurdish spelling / typography improvements
 */
export function checkKurdishQuality(text: string): { original: string; improved: string; fixes: string[] } {
  const fixes: string[] = [];
  let improved = text;

  for (const rule of KURDISH_NORMALIZATION_RULES) {
    if (rule.pattern.test(text)) {
      fixes.push(rule.reason);
      improved = improved.replace(rule.pattern, rule.replacement);
    }
  }

  return {
    original: text,
    improved: improved.trim(),
    fixes,
  };
}

/**
 * Prepares text for Text-to-Speech:
 * Removes markdown symbols, code blocks, URLs, citations and metadata
 * so speech sounds clean, smooth and distraction-free in Kurdish.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  
  let clean = text;
  // Remove markdown code blocks completely
  clean = clean.replace(/```[\s\S]*?```/g, ' لێرەدا کۆد هەیە. ');
  // Remove inline code
  clean = clean.replace(/`([^`]+)`/g, '$1');
  // Remove citations [سەرچاوە: ...] or [1]
  clean = clean.replace(/\[\s*سەرچاوە[^\]]*\]/gi, '');
  clean = clean.replace(/\[\d+\]/g, '');
  // Remove markdown headers #, ##, etc.
  clean = clean.replace(/#{1,6}\s*/g, '');
  // Remove bold/italic asterisks
  clean = clean.replace(/[*_~]{1,3}/g, '');
  // Remove markdown links [title](url) -> title
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove markdown lists and blockquotes
  clean = clean.replace(/^[\s*-+>]+\s*/gm, '');
  // Remove raw URLs
  clean = clean.replace(/https?:\/\/\S+/g, '');
  // Normalize whitespace
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}

/**
 * Core Kurdish UI labels
 */
export const KURDISH_UI = {
  brand: 'basoka ai',
  brandKurdish: 'باسۆکا ئەی ئای',
  defaultGreeting: 'سڵاو چۆنی سەرۆک؟',
  placeholderInput: 'پەیامێک یان فەرمانێک بۆ باسۆکا بنووسە...',
  send: 'ناردن',
  stop: 'ڕاگرتن',
  attach: 'هاوپێچکردنی فایل',
  voice: 'دەنگ',
  listening: 'گوێ دەگرم...',
  newChat: 'گفتوگۆی نوێ',
  history: 'مێژووی گفتوگۆکان',
  settings: 'ڕێکخستنەکان',
  autoMode: 'دۆخی خۆکار (Auto)',
  projects: 'پڕۆژەکان',
  memory: 'بیرگەی ژیر',
  knowledgeBase: 'بنکەی زانیاری و فایلەکان',
  modelCompare: 'بەراوردی مۆدێلەکان',
  workflows: 'کارپێکردنە خۆکارەکان',
  diagnostics: 'پشکنین و پاراستن',
  regenerate: 'دووبارە دروستکردنەوە',
  copy: 'کۆپیکردن',
  copied: 'کۆپیکرا!',
  readAloud: 'خوێندنەوە بە دەنگ',
  speaking: 'دەخوێنێتەوە...',
  stopVoice: 'ڕاگرتنی دەنگ',
  feedbackGood: 'باش بوو',
  feedbackBad: 'باش نەبوو',
  kurdishQualityBadge: 'کوالێتی کوردی کۆنترۆڵکراوە',
  noData: 'هیچ تۆمارێک نییە',
  cancel: 'پاشگەزبوونەوە',
  confirm: 'پەسەندکردن',
  delete: 'سڕینەوە',
  save: 'پاشەکەوتکردن',
  export: 'دەرکردنی داتا',
  import: 'هاوردەکردنی داتا',
  approvalRequired: 'ڕەزامەندی سەرۆک پێویستە',
};
