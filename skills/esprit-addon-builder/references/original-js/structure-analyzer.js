/**
 * structure-analyzer.js
 * تحلیل ساختاری HTML برای تشخیص الگوهای تکرارشونده
 */

const StructureAnalyzer = {

  /**
   * ساخت امضای ساختاری برای یک element
   * مثال: div.card[img[]|h3[]|p[]]
   */
  getSignature(el) {
    const tag = el.tagName.toLowerCase();
    const cls = Array.from(el.classList).slice(0, 2).join('.');
    const prefix = cls ? `${tag}.${cls}` : tag;

    const childSigs = Array.from(el.children)
      .map(c => this.getSignature(c))
      .join('|');

    return childSigs ? `${prefix}[${childSigs}]` : `${prefix}[]`;
  },

  /**
   * استخراج نام فیلد پیشنهادی از یک element
   */
  guessFieldName(el) {
    const tag = el.tagName.toLowerCase();
    const cls = el.className || '';
    const id = el.id || '';
    const dataField = el.getAttribute('data-field') || '';

    if (dataField) return dataField.toLowerCase().replace(/\s+/g, '_');

    const combined = (cls + ' ' + id).toLowerCase().replace(/[^a-z0-9\s_-]/g, '');
    const keywords = combined.split(/[\s_-]+/).filter(Boolean);
    if (keywords.length) return keywords.join('_');

    const tagMap = {
      h1: 'title', h2: 'title', h3: 'title', h4: 'subtitle', h5: 'subtitle',
      p: 'description', span: 'text', a: 'link', img: 'image',
      strong: 'label', em: 'note', time: 'date', small: 'caption'
    };
    return tagMap[tag] || tag;
  },

  /**
   * استخراج فیلدها از یک element نمونه
   */
  extractFields(el, prefix = '') {
    const fields = [];
    const tag = el.tagName.toLowerCase();

    if (tag === 'img') {
      fields.push({ fieldname: prefix + 'image', element: 'img', attr: 'src' });
      return fields;
    }
    if (tag === 'a') {
      fields.push({ fieldname: prefix + 'link', element: 'a', attr: 'href' });
      if (el.children.length === 0) {
        fields.push({ fieldname: prefix + 'link_text', element: 'a', attr: 'text' });
      }
    }

    if (el.children.length === 0 && el.textContent.trim()) {
      const name = this.guessFieldName(el);
      fields.push({ fieldname: prefix + name, element: tag, attr: 'text' });
      return fields;
    }

    for (const child of el.children) {
      const childFields = this.extractFields(child, prefix);
      for (const cf of childFields) {
        if (!fields.find(f => f.fieldname === cf.fieldname)) {
          fields.push(cf);
        }
      }
    }

    return fields;
  },

  /**
   * تحلیل اصلی HTML
   */
  analyze(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="_root">${htmlString}</div>`, 'text/html');
    const root = doc.getElementById('_root');

    const signatureMap = new Map();

    const walk = (el, depth = 0) => {
      if (depth > 5) return;
      if (el.nodeType !== Node.ELEMENT_NODE) return;

      const sig = this.getSignature(el);
      if (!signatureMap.has(sig)) signatureMap.set(sig, []);
      signatureMap.get(sig).push(el);

      for (const child of el.children) walk(child, depth + 1);
    };

    for (const child of root.children) walk(child);

    const repeatingPatterns = [];
    for (const [sig, elements] of signatureMap) {
      if (elements.length >= 2) {
        const fields = this.extractFields(elements[0]);
        const uniqueFieldNames = [...new Set(fields.map(f => f.fieldname))];

        if (uniqueFieldNames.length >= 1) {
          repeatingPatterns.push({
            signature: sig,
            count: elements.length,
            fields: uniqueFieldNames,
            sampleHTML: elements[0].outerHTML,
            elements: elements
          });
        }
      }
    }

    repeatingPatterns.sort((a, b) => {
      const depthA = (a.signature.match(/\[/g) || []).length;
      const depthB = (b.signature.match(/\[/g) || []).length;
      if (depthB !== depthA) return depthB - depthA;
      return b.fields.length - a.fields.length;
    });

    const topPattern = repeatingPatterns[0] || null;
    let staticFields = [];

    if (!topPattern) {
      staticFields = this.extractFields(root);
    } else {
      for (const child of root.children) {
        const sig = this.getSignature(child);
        if (sig !== topPattern.signature) {
          const sf = this.extractFields(child);
          staticFields.push(...sf);
        }
      }
    }

    return {
      hasRepeatingPattern: repeatingPatterns.length > 0,
      repeatingPatterns,
      topPattern,
      staticFields: [...new Set(staticFields.map(f => f.fieldname))].map(fn =>
        staticFields.find(f => f.fieldname === fn)
      ),
      allFields: topPattern ? topPattern.fields : staticFields.map(f => f.fieldname),
      recommendation: this.buildRecommendation(repeatingPatterns, staticFields)
    };
  },

  /**
   * تولید گزارش متنی برای ارسال به AI
   */
  buildRecommendation(patterns, staticFields) {
    if (patterns.length === 0) {
      return 'ساختار ساده - بدون الگوی تکرارشونده - از فیلدهای مجزا استفاده شود.';
    }

    const top = patterns[0];
    const lines = [
      `⚠️ ${top.count} ساختار تکرارشونده با امضای "${top.signature}" پیدا شد.`,
      `فیلدهای هر آیتم: ${top.fields.join(', ')}`,
      `→ توصیه: جدول child جداگانه با ${top.fields.length} فیلد بساز.`,
      `→ این فیلدها را در جدول parent قرار نده.`,
    ];

    if (staticFields.length > 0) {
      lines.push(`فیلدهای جدول parent (ثابت): ${staticFields.map(f => f.fieldname).join(', ')}`);
    }

    return lines.join('\n');
  },

  /**
   * ساخت پیش‌نمایش جدول‌ها
   */
  buildTablePreview(analysis, addonName) {
    const snake = addonName.toLowerCase().replace(/\s+/g, '_');
    const tables = [];

    if (analysis.hasRepeatingPattern && analysis.topPattern) {
      tables.push({
        role: 'parent',
        tablename: snake,
        fields: analysis.staticFields.map(f => f.fieldname),
        label: `جدول اصلی: ${snake}`
      });
      tables.push({
        role: 'child',
        tablename: snake + '_items',
        fields: analysis.topPattern.fields,
        label: `جدول آیتم‌ها: ${snake}_items`,
        foreignKey: snake + '_id'
      });
    } else {
      tables.push({
        role: 'single',
        tablename: snake,
        fields: analysis.allFields,
        label: `جدول: ${snake}`
      });
    }

    return tables;
  }

};

if (typeof module !== 'undefined') module.exports = StructureAnalyzer;
