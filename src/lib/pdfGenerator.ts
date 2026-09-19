/**
 * Basoka AI - Kurdish PDF & Document Export Generator
 * Produces publication-grade, RTL-formatted PDF print documents
 * with full Kurdish Sorani Unicode typography support.
 */

interface PdfExportOptions {
  title?: string;
  content: string;
  author?: string;
  date?: string;
}

/**
 * Parses basic Markdown into clean HTML for print/PDF formatting
 */
function markdownToPrintHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h1 class="doc-h1">${escapeHtml(trimmed.slice(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h2 class="doc-h2">${escapeHtml(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h3 class="doc-h3">${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      if (!inList) {
        htmlParts.push('<ul class="doc-list">');
        inList = true;
      }
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      htmlParts.push(`<li>${formatInlineStyles(itemText)}</li>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<blockquote class="doc-quote">${formatInlineStyles(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    // Close list if normal paragraph
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }

    htmlParts.push(`<p class="doc-p">${formatInlineStyles(trimmed)}</p>`);
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInlineStyles(str: string): string {
  let escaped = escapeHtml(str);
  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code `code`
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="doc-code">$1</code>');
  return escaped;
}

/**
 * Extracts a suitable document title from markdown content
 */
export function extractDocumentTitle(content: string, fallback = 'بەڵگەنامەی باسۆکا'): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match && match[1]) {
    return match[1].trim();
  }
  const matchH2 = content.match(/^##\s+(.+)$/m);
  if (matchH2 && matchH2[1]) {
    return matchH2[1].trim();
  }
  return fallback;
}

/**
 * Generates an official, print-ready Kurdish document and triggers
 * the browser's native PDF generation dialog (Save as PDF).
 */
export function generateKurdishPdf(options: PdfExportOptions): void {
  const docTitle = options.title || extractDocumentTitle(options.content, 'ڕاپۆرتی زانیاری');
  const author = options.author || 'سەرۆک';
  const currentDate = options.date || new Date().toLocaleDateString('ckb', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const bodyHtml = markdownToPrintHtml(options.content);

  const fullPrintHtml = `<!DOCTYPE html>
<html lang="ckb" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(docTitle)} - Basoka AI PDF</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 18mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, Arial, sans-serif;
      font-size: 13pt;
      line-height: 1.8;
      color: #1e293b;
      background: #ffffff;
      direction: rtl;
      text-align: right;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .document-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Official Header */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 14px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 16pt;
      font-weight: 800;
      color: #0369a1;
      margin: 0 0 2px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-subtitle {
      font-size: 9.5pt;
      color: #64748b;
      margin: 0;
    }
    .doc-meta-badge {
      text-align: left;
      font-size: 9.5pt;
      color: #475569;
    }
    .doc-meta-badge span {
      display: block;
    }
    .doc-meta-owner {
      font-weight: 700;
      color: #0f172a;
    }

    /* Content Typography */
    .doc-main-title {
      font-size: 19pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 20px 0;
      line-height: 1.4;
      border-right: 5px solid #0284c7;
      padding-right: 12px;
    }
    .doc-h1 {
      font-size: 16pt;
      font-weight: 700;
      color: #0369a1;
      margin: 22px 0 10px 0;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .doc-h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #1e293b;
      margin: 18px 0 8px 0;
    }
    .doc-h3 {
      font-size: 12pt;
      font-weight: 600;
      color: #334155;
      margin: 14px 0 6px 0;
    }
    .doc-p {
      margin: 0 0 14px 0;
      color: #334155;
      text-align: justify;
    }
    .doc-list {
      margin: 0 0 16px 0;
      padding-right: 24px;
      list-style-type: square;
      color: #334155;
    }
    .doc-list li {
      margin-bottom: 8px;
      line-height: 1.7;
    }
    .doc-quote {
      margin: 16px 0;
      padding: 10px 16px;
      background: #f8fafc;
      border-right: 4px solid #38bdf8;
      color: #475569;
      font-style: italic;
      border-radius: 4px 0 0 4px;
    }
    .doc-code {
      font-family: monospace;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11pt;
    }
    strong {
      color: #0f172a;
      font-weight: 700;
    }

    /* Official Footer */
    .doc-footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
      color: #94a3b8;
    }

    @media print {
      body {
        background: transparent;
      }
      .document-container {
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="document-container">
    <header class="doc-header">
      <div>
        <h1 class="brand-title">
          <span>⚡ Basoka AI</span>
        </h1>
        <p class="brand-subtitle">سیستەمی ژیری دەستکردی پێشکەوتووی کوردی</p>
      </div>
      <div class="doc-meta-badge">
        <span>بەروار: ${escapeHtml(currentDate)}</span>
        <span>بۆ: <strong class="doc-meta-owner">${escapeHtml(author)}</strong></span>
      </div>
    </header>

    <main>
      <div class="doc-main-title">${escapeHtml(docTitle)}</div>
      ${bodyHtml}
    </main>

    <footer class="doc-footer">
      <span>ئامادەکراوە لەلایەن Basoka AI بە فەرمانی سەرۆک</span>
      <span>بەڵگەنامەی فەرمی • پەڕگە</span>
    </footer>
  </div>

  <script>
    window.addEventListener('load', function() {
      // Allow fonts to render cleanly before printing
      setTimeout(function() {
        window.focus();
        window.print();
      }, 450);
    });
  </script>
</body>
</html>`;

  // Create an isolated iframe for clean, seamless printing without leaving current view
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.setAttribute('title', 'Kurdish PDF Print Frame');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(fullPrintHtml);
    doc.close();

    // Clean up iframe after print dialog completes
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {
        // Ignored
      }
    }, 60000);
  }
}

/**
 * Detects if the prompt or message is asking for PDF / document creation
 */
export function isPdfRelatedText(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('pdf') ||
    lower.includes('پیدێف') ||
    lower.includes('پی دی ئێف') ||
    lower.includes('فایل') ||
    lower.includes('ڕاپۆرت') ||
    lower.includes('بەڵگەنامە') ||
    lower.includes('چاپکردن')
  );
}
