# ⚡ Basoka AI — سیستەمی ژیری دەستکردی کوردی

<div align="center">
  <img src="public/icon.svg" width="128" height="128" alt="Basoka AI Logo" />
  <h3>پلاتفۆرمی پێشکەوتووی ژیری دەستکرد بە زمانی کوردی سۆرانی بۆ سەرۆک</h3>
  <p><strong>Advanced Personal AI Operating System for Web, Desktop & Android</strong></p>

  [![CI](https://github.com/OWNER/basoka-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/basoka-ai/actions/workflows/ci.yml)
  [![Android](https://github.com/OWNER/basoka-ai/actions/workflows/android-build.yml/badge.svg)](https://github.com/OWNER/basoka-ai/actions/workflows/android-build.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-Android-1192e8)](https://capacitorjs.com/)
</div>

---

## 📖 ناساندن (Introduction)

**باسۆکا (Basoka AI)** سیستەمێکی تەواو و پێشکەوتووی ژیری دەستکردە کە بە تایبەتی بۆ زمانی **کوردیی سۆرانی (Kurdish Sorani)** و بۆ خزمەتی کەسیی سەرۆک داڕێژراوە. ئەم بەرنامەیە دەتوانێت لەسەر سێ پلاتفۆرمی سەرەکی بە شێوەی خۆماڵی (Native) و بەردەوام کار بکات:
1. **وێب و PWA (Progressive Web App):** کارکردن لەسەر هەموو وێبگەڕەکان و توانای دامەزراندن لەسەر شاشەی سەرەکی.
2. **ئەندرۆید (Android App via Capacitor):** کۆد و پێکهاتەی تەواوی پرۆژەی ئەندرۆید لە فۆڵدەری `android/` بە ناسنامەی `ai.basoka.app` و مۆڵەتە پێویستەکان.
3. **دێسکتۆپ و سێرڤەر (Desktop & Server):** سێرڤەری Node/Expressی پارێزراو بۆ داواکارییە نهێنییەکان.

---

## ✨ تایبەتمەندییە سەرەکییەکان (Key Features)

- 👑 **سڵاوی تایبەتی سەرۆک:** لە دەستپێکی نوێدا دەستبەجێ بە «سڵاو چۆنی سەرۆک؟» پێشوازیت لێدەکات.
- 🌐 **ڕووکاری تەواو کوردی و RTL:** فۆنتی ستانداردی Vazirmatn، ئاراستەی ڕاست بۆ چەپ لە هەموو بەش و مۆداڵەکاندا.
- ⚡ **نیشانەی ئاوی ئەنیمەیشندار (Basoka Watermark):** نیشانەی بازنەیی و گەشانەوەی تایبەت لە پاشبنەما بە توانای کەم/زیادکردنی ڕووناکی.
- 🧠 **ڕێڕەوی زیرەکی مۆدێلەکان (Intelligent Model Cascade):**
  - **Gemini 3.8 Flash:** مۆدێلی بنەڕەتی زۆر خێرا بۆ وەڵامدانەوەی ڕۆژانە.
  - **Gemini 3.1 Pro:** بیرکردنەوەی قووڵ، ئەندازیاری، بیرکاری و کۆدنووسین.
  - **Gemini Image Studio:** دروستکردنی وێنەی داهێنەرانە بە فەرمانی کوردی (لەگەڵ دۆخی یەدەگی ژیر لە کاتی لۆدی بەرز).
  - **Auto Model Router:** هەڵبژاردنی خۆکاری مۆدێلی گونجاو بەپێی جۆری دەقەکە.
- 📄 **دروستکردنی فەرمیی فایلی PDF:** دروستکردنی بەڵگەنامەی فەرمی کوردی بە دوگمەی داگرتنی ڕاستەوخۆ بە ستانداردەکانی چاپ.
- 🎙️ **دەنگ و خوێندنەوەی کوردی:**
  - تۆمارکردنی دەنگ بە مایکرۆفۆن (STT).
  - خوێندنەوەی دەنگیی خۆکار و دەستی (TTS) بە پاککردنەوەی هێماکانی مارکداون.
- 💾 **بیرگەی زیرەک و پڕۆژەکان (Memory & Workspaces):** پاشەکەوتکردنی یادەوەرییەکانی سەرۆک و جیاکردنەوەی فەزای کار.
- 🧮 **سندوقی ئامرازە پارێزراوەکان (Safe Execution Sandbox):** ژمێریاری بیرکاری بەبێ مەترسی، چاکسازی ڕێنووسی کوردی و گەڕانی زانیاری.
- 📦 **یەدەگ و گەڕاندنەوە (Backup & Restore):** هەناردەکردن و هاوردەکردنی هەموو داتاکان بە یەک فایلی پارێزراوی JSON.
- 🛡️ **ئاسایشی ١٠٠٪ بەبێ دزەکردنی کلیلەکان (Zero Secret Leakage):** کلیلەکانی API لە پشت سێرڤەری پارێزراون.

---

## 🏗️ پێکهاتەی پرۆژە (Project Architecture)

```
basoka-ai/
├── android/                   # پرۆژەی ئامادەکراوی ئەندرۆید (Native Android Project)
│   ├── app/src/main/          # AndroidManifest.xml, icons, strings
│   ├── build.gradle           # رێکخستنەکانی Gradle
│   └── gradlew                # سکریپتی کارپێکردنی Gradle
├── public/                    # فایلی وێنە، PWA Manifest، Service Worker
│   ├── icon.svg               # لۆگۆی تایبەتی باسۆکا
│   ├── manifest.json          # ڕێکخستنی دابەزاندنی PWA
│   └── sw.js                  # کاشکردنی ئۆفلاین
├── src/                       # کۆدی React 19 + Tailwind CSS
│   ├── components/            # مۆداڵ، چات، سەرپەڕە، نیشانەی ئاو
│   ├── lib/                   # بزوێنەری کوردی، دەنگ، مۆدێل، پەڕگەی PDF
│   └── types.ts               # پێناسەکانی TypeScript
├── tests/                     # تاقیکردنەوە سیستەمییەکان (System Test Suite)
│   └── system.test.ts         # تاقیکردنەوەی بزوێنەری کوردی، مۆدێل و ئاسایش
├── .github/workflows/         # کارپێکردنە خۆکارەکانی گیت‌هاب (CI/CD)
│   ├── ci.yml                 # پشکنینی کۆد، تاقیکردنەوە، و بنیاتنان
│   ├── android-build.yml      # دروستکردنی فایلی APKی ئەندرۆید
│   └── release.yml            # بڵاوکردنەوەی وەشانی فەرمی
├── capacitor.config.ts        # ڕێکخستنی ئەندرۆید بە Capacitor
├── server.ts                  # سێرڤەری پارێزراوی Express API
├── package.json               # پێداویستییەکان و فەرمانەکان
└── .env.example               # نموونەی ڕێکخستنی نهێنییەکان
```

---

## 🚀 داگرتن و کارپێکردن لەسەر ئامێرەکەت (Quick Start)

### ١. کڵۆنکردنی پرۆژەکە لە گیت‌هاب (Clone)
```bash
git clone https://github.com/YOUR_USERNAME/basoka-ai.git
cd basoka-ai
```

### ٢. دامەزراندنی پێداویستییەکان (Install Dependencies)
```bash
npm install
```

### ٣. ڕێکخستنی فایلی نهێنییەکان (Environment Setup)
فایلی نموونەیی کۆپی بکە بۆ سەر فایلی نوێی `.env`:
```bash
cp .env.example .env
```
پاشان کلیلی Gemini API تێدا بنووسە:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### ٤. دەستپێکردنی دۆخی گەشەپێدان (Development Mode)
```bash
npm run dev
```
ئێستا لە وێبگەڕەکەت سەردانی `http://localhost:3000` بکە.

---

## 🧪 تاقیکردنەوەکان و پشکنینی تەندروستی (Testing & Lint)

```bash
# پشکنینی هەڵەی تایپ و کۆد
npm run lint

# کارپێکردنی تاقیکردنەوە سیستەمییەکان
npm run test
```

---

## 🏗️ بنیاتنانی وەشانی بەرهەمهێنان (Production Build)

```bash
npm run build
npm start
```
ئەم فەرمانە کۆدی وێبەکە دەکاتە فایلە کورتکراوەکانی ناو `dist/` و سێرڤەرێکی سەربەخۆی بەهێز لەسەر پۆرتی ۳۰۰۰ دادەنێت.

---

## 📱 بنیاتنانی بەرنامەی ئەندرۆید (Android Build & APK)

پرۆژەکە بە تەواوی بۆ ئەندرۆید ئامادەکراوە و لە ڕێگەی **Capacitor**ەوە ڕێکخراوە.

### ڕێگەی یەکەم: دروستکردنی APK لە ڕێگەی کۆمپیوتەرەکەت
پێداویستییەکان: Android Studio یان Java 17 + Android SDK.

1. کۆپیکردنی دوایین گۆڕانکارییەکانی وێب بۆ ناو فۆڵدەری ئەندرۆید:
```bash
npm run cap:build:android
```

2. کردنەوەی پرۆژەکە لە ناو Android Studio:
```bash
npx cap open android
```
لە ناو ئەندرۆید ستۆدیۆ بڕۆ سەر **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

3. یان دروستکردنی ڕاستەوخۆ لە ڕێگەی تێرمیناڵەوە:
```bash
cd android
./gradlew assembleDebug
```
فایلی APK لەم شوێنە دروست دەبێت:
`android/app/build/outputs/apk/debug/app-debug.apk`

### ڕێگەی دووەم: دروستکردنی خۆکار لە ناو GitHub Actions
ئەم پرۆژەیە خاوەنی فایلی `.github/workflows/android-build.yml`ە:
- هەر کاتێک کۆدەکە پاڵ بنێیت بۆ ناو گیت‌هاب (Push)، ڕاستەوخۆ لە ناو سێرڤەرەکانی گیت‌هابدا پرۆسەی Gradle دەست پێدەکات و فایلی **APK** وەک Artifact بۆ دادەگرێت بەبێ ئەوەی پێویستت بە دانانی ئەندرۆید ستۆدیۆ بێت لەسەر کۆمپیوتەرەکەت!

---

## 🔒 ئاسایش و پاراستنی نهێنییەکان (Security Guidelines)

- **هیچ کلیلێک مەخە ناو کۆدی کراوە:** هەمیشە فایلی `.env` پشتگوێ خراوە بە هۆی `.gitignore`.
- **پاراستنی واژووی ئەندرۆید (Android Keystore):** هیچ کات فایلی `.jks` یان `.keystore` مەخە ناو گیت‌هاب؛ لە باتی ئەوە لە **GitHub Secrets** دایبنێ.
- **تۆڕی پارێزراو:** پەیوەندییەکانی نێوان بەکارهێنەر و مۆدێلەکانی ژیری دەستکرد هەمیشە بە سێرڤەری پارێزراوی پشتەوە (Backend) دەڕۆن و هیچ نهێنییەک بۆ لای کاربەر ناگەڕێتەوە.

---

## 📄 مۆڵەت (License)

ئەم پڕۆژەیە لەژێر مۆڵەتی **MIT** بڵاوکراوەتەوە. بڕوانە فایلی [LICENSE](LICENSE).

---

<div align="center">
  <strong>دروستکراوە بۆ خزمەتی سەرۆک لەلایەن Basoka AI</strong>
</div>
