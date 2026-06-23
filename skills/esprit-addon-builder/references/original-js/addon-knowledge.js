/**
 * addon-knowledge.js
 * دانش مستندات Addon System - برای استفاده در هر دو فاز
 */

const ADDON_KNOWLEDGE = {

  fieldTypes: ['textinput', 'textarea', 'file', 'number', 'date', 'select', 'selectbox', 'checkbox'],

  categories: ['Content', 'Commerce', 'Events', 'People', 'Media', 'Location', 'Document'],

  accessValues: ['all', 'authenticated', 'owner', 'admin', 'owner,admin', 'users', 'groups'],

  fieldTypeRules: [
    { keywords: ['image', 'photo', 'thumbnail', 'logo', 'avatar', 'picture'], type: 'file', direction: 'ltr', length: 255, defaultvalue: '' },
    { keywords: ['title', 'name'], type: 'textinput', direction: 'rtl', length: 255, defaultvalue: '' },
    { keywords: ['url', 'link', 'website', 'href'], type: 'textinput', direction: 'ltr', length: 1024, defaultvalue: '#' },
    { keywords: ['email'], type: 'textinput', direction: 'ltr', length: 100, defaultvalue: '' },
    { keywords: ['phone', 'mobile', 'tel', 'fax'], type: 'textinput', direction: 'ltr', length: 20, defaultvalue: '' },
    { keywords: ['price', 'cost', 'count', 'rating', 'number', 'qty', 'quantity', 'amount', 'score'], type: 'number', direction: 'ltr', length: 10, defaultvalue: '0' },
    { keywords: ['date', 'time', 'year', 'month'], type: 'date', direction: 'ltr', length: 10, defaultvalue: '' },
    { keywords: ['description', 'content', 'bio', 'about', 'summary', 'text', 'detail', 'body'], type: 'textarea', direction: 'rtl', length: 'max', defaultvalue: '' },
  ],

  linkTargetField: {
    friendlyname: 'نحوه باز شدن لینک',
    friendlyname_en: 'Link Target',
    fieldname: 'target',
    fieldtype: 'selectbox',
    staticitems: '[{"text":" تب جاری","value":"_self"},{"text":" تب جدید","value":"_blank"}]',
    defaultvalue: '_self',
    length: 20,
    direction: 'ltr',
    deleted: 0,
    ord: 998,
    showonlist: 0,
    subform: 0,
    search: 0,
    required: 0
  },

  ordlistField: {
    friendlyname: 'Order',
    fieldname: 'ordlist',
    fieldtype: 'selectbox',
    staticitems: '[{"text":"  1","value":"1"},{"text":"  2","value":"2"},{"text":"  3","value":"3"},{"text":"  4","value":"4"},{"text":"  5","value":"5"},{"text":"  6","value":"6"},{"text":"  7","value":"7"},{"text":"  8","value":"8"},{"text":"  9","value":"9"},{"text":"  10","value":"10"},{"text":"  11","value":"11"},{"text":"  12","value":"12"}]',
    defaultvalue: '1',
    deleted: 0,
    ord: 999,
    showonlist: 1,
    subform: 0,
    search: 0,
    required: 1
  },

  sqlTemplate: {
    select: (fields, tablename) => {
      const cols = fields
        .filter(f => f.fieldname !== 'ordlist')
        .map(f => {
          const def = f.fieldname === 'target' ? '_self' : f.fieldtype === 'number' ? '0' : /(^|_)link(_|$)|url|href|website/.test(f.fieldname || '') ? '#' : '';
          return `ISNULL(${f.fieldname},'${def}') AS ${f.fieldname}`;
        }).join(',\n    ');
      return `SELECT\n    ${cols}\nFROM ${tablename}\nWHERE deleted = 0 AND siteid = [system:site-id]\nORDER BY CAST(ordlist AS INT) ASC`;
    }
  },

  mappingPatterns: {
    text: (name) => `[query-result:${name}]`,
    file: (name) => `[query-result-fileurl:${name}]`,
  },

  contentSourceHints: {
    newsLikeSources: ['contents', 'contentgroups', 'files', 'setting', 'pages', 'contents_vote'],
    newsLikeTypes: ['news', 'article', 'blog', 'announcement', 'photo_report', 'video_report', 'editorial_widget'],
    contentsColumns: ['id', 'siteid', 'kicker', 'mainheadline', 'lead', 'deck', 'customdatetime', 'expiretime', 'maincontent', 'groups', 'picid', 'positions', 'published', 'deleted', 'presentinsite', 'shamsi_year', 'shamsi_month', 'shamsi_day', 'shamsi_hour', 'shamsi_minute'],
    contentgroupsColumns: ['id', 'parentid', 'siteid', 'groupname', 'deleted'],
    widgetSettingFields: ['title', 'on_category', 'on_page', 'arch_title', 'item_count', 'on_position'],
    outputAliases: ['row', 'subfolder', 'kicker', 'title', 'lead', 'link', 'boxTitle', 'archiveTitle', 'archivePage', 'groupTitle', 'pic', 'content_type_icon', 'display_day', 'display_month', 'display_year'],
    filters: ['c.siteid = [system:site-id]', 'c.published = 1', 'c.deleted = 0', 'c.presentinsite = 0', 'ISNULL(c.expiretime, GETDATE()) >= GETDATE()', 'ISNULL(c.customdatetime, GETDATE()) <= GETDATE()']
  },

  getFieldType(fieldname) {
    const lower = fieldname.toLowerCase();
    for (const rule of this.fieldTypeRules) {
      if (rule.keywords.some(k => lower.includes(k))) {
        return rule;
      }
    }
    return { type: 'textinput', direction: 'rtl', length: 255, defaultvalue: '' };
  },

  buildFieldDef(fieldname, friendlyname, ord, extra = {}) {
    const rule = this.getFieldType(fieldname);
    return {
      friendlyname: friendlyname || fieldname,
      fieldname: fieldname.toLowerCase().replace(/\s+/g, '_'),
      fieldtype: rule.type,
      defaultvalue: rule.defaultvalue,
      length: rule.length,
      direction: rule.direction,
      deleted: 0,
      ord: ord,
      showonlist: fieldname === 'ordlist' || ord === 1 ? 1 : 0,
      subform: 0,
      search: fieldname.includes('title') || fieldname.includes('name') ? 1 : 0,
      required: 0,
      ...extra
    };
  },

  categoryFromContent(html) {
    const lower = html.toLowerCase();
    if (/news|article|blog|post|story|headline|breaking|editor|author|publish|published|breadcrumb|tag|tags|archive|magazine|press|announcement|خبر|مقاله|نویسنده|انتشار|تاریخ|برچسب|آرشیو|اخبار/.test(lower)) return 'Content';
    if (/product|shop|price|store|buy|cart/.test(lower)) return 'Commerce';
    if (/event|conference|concert|meetup|workshop/.test(lower)) return 'Events';
    if (/person|team|staff|member|profile|employee/.test(lower)) return 'People';
    if (/video|gallery|media|photo/.test(lower)) return 'Media';
    if (/restaurant|hotel|location|place|address|map/.test(lower)) return 'Location';
    if (/document|file|report|download/.test(lower)) return 'Document';
    return 'Content';
  }

};

if (typeof module !== 'undefined') module.exports = ADDON_KNOWLEDGE;
