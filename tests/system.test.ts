/**
 * Basoka AI - Comprehensive System & Core Engine Test Suite
 * Executed by `npm run test`
 */

import { normalizeKurdishText, checkKurdishQuality, cleanTextForSpeech, KURDISH_UI } from '../src/lib/kurdish';
import { MODEL_REGISTRY, autoRouteModel, getFallbackModel } from '../src/lib/models';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✔ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✖ [FAIL] ${testName}`);
    failed++;
  }
}

console.log('🚀 Running Basoka AI System Test Suite...\n');

// 1. Kurdish Text Engine Tests
console.log('1. Kurdish Text Engine Tests:');
assert(KURDISH_UI.defaultGreeting === 'سڵاو چۆنی سەرۆک؟', 'Default greeting is exact owner greeting: سڵاو چۆنی سەرۆک؟');
assert(KURDISH_UI.brand === 'basoka ai', 'Brand matches basoka ai');

const rawKurdish = 'پێ ويستە كە يارمەتی بدەيت';
const normalized = normalizeKurdishText(rawKurdish);
assert(normalized.includes('پێ ویستە') && normalized.includes('کە'), 'Converts Arabic Waw/Yeh/Kaf to Kurdish characters');

const qualityCheck = checkKurdishQuality(rawKurdish);
assert(qualityCheck.fixes.length > 0, 'Kurdish quality checker flags typographic improvements');

const markdownText = '## سەرۆک\nئەم کۆدە ببینە:\n```ts\nconsole.log(1);\n```\nسەرکەوتوو بوو!';
const cleanedForTTS = cleanTextForSpeech(markdownText);
assert(!cleanedForTTS.includes('```') && !cleanedForTTS.includes('##'), 'Removes code blocks and headers for clean speech synthesis');

// 2. Model Routing & Hierarchy Tests
console.log('\n2. Model Routing & Fallback Tests:');
assert(MODEL_REGISTRY.length >= 4, 'Includes all required models (flash, pro, lite, transcribe)');
const defaultModel = MODEL_REGISTRY.find(m => m.id === 'gemini-3.8-flash');
assert(!!defaultModel, 'Default high-intelligence model gemini-3.8-flash exists');

const codingRouting = autoRouteModel('کۆدێکی تایتسکریپتم بۆ بنووسە');
assert(codingRouting.selectedModel === 'gemini-3.1-pro-preview', 'Auto routes complex code request to Gemini 3.1 Pro');

const fallbackModel = getFallbackModel('gemini-3.1-pro-preview');
assert(fallbackModel === 'gemini-3.8-flash', 'Provides fallback model when primary encounters quota/error');

// 3. PWA & Manifest Integrity
console.log('\n3. PWA & Manifest Verification:');
const manifestPath = path.resolve('public/manifest.json');
assert(fs.existsSync(manifestPath), 'public/manifest.json exists');
const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifestContent.short_name === 'Basoka AI', 'Manifest short_name matches Basoka AI');
assert(manifestContent.icons.length >= 2, 'Manifest contains multiple responsive icons');

// 4. Android Package & Wrapper Verification
console.log('\n4. Android Package & Wrapper Verification:');
const androidManifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');
assert(fs.existsSync(androidManifestPath), 'android/app/src/main/AndroidManifest.xml exists');
const manifestXml = fs.readFileSync(androidManifestPath, 'utf8');
assert(manifestXml.includes('android.permission.RECORD_AUDIO'), 'AndroidManifest includes microphone permission for Kurdish voice');
assert(manifestXml.includes('android:supportsRtl="true"'), 'AndroidManifest declares native RTL support');

const stringsPath = path.resolve('android/app/src/main/res/values/strings.xml');
assert(fs.existsSync(stringsPath), 'strings.xml exists');
const stringsXml = fs.readFileSync(stringsPath, 'utf8');
assert(stringsXml.includes('ai.basoka.app'), 'Android application ID is ai.basoka.app');

// 5. Zero-Secret Security Verification
console.log('\n5. Zero-Secret Security Verification:');
const envExample = fs.readFileSync(path.resolve('.env.example'), 'utf8');
assert(!envExample.includes('AIzaSy'), 'No live Google API key in .env.example');
assert(envExample.includes('GEMINI_API_KEY'), '.env.example defines GEMINI_API_KEY template');

console.log(`\n========================================`);
console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All Basoka AI tests verified successfully!');
}
