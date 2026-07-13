const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'b', 'i', 'u',
  'a', 'img', 'div', 'span', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'pre', 'code', 'sup', 'sub',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
  div: new Set(['class', 'style']),
  span: new Set(['class', 'style']),
  p: new Set(['class', 'style']),
  h1: new Set(['class', 'style']),
  h2: new Set(['class', 'style']),
  h3: new Set(['class', 'style']),
  h4: new Set(['class', 'style']),
  table: new Set(['class']),
  td: new Set(['class', 'style']),
  th: new Set(['class', 'style']),
  figure: new Set(['class']),
  figcaption: new Set(['class']),
  code: new Set(['class']),
  pre: new Set(['class']),
};

const DANGEROUS_ATTRS = new Set([
  'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
  'onmousedown', 'onmouseup', 'onkeydown', 'onkeyup',
  'onfocus', 'onblur', 'onchange', 'oninput', 'onsubmit',
  'javascript', 'data', 'vbscript',
]);

function sanitizeStyle(style: string): string {
  return style
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/url\s*\(\s*['"]?\s*javascript:/gi, 'url(')
    .replace(/position\s*:\s*fixed/gi, 'position:static')
    .replace(/position\s*:\s*absolute/gi, 'position:relative');
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return processNode(doc.body).innerHTML;
  } catch {
    return html.replace(/<[^>]*>/g, '');
  }
}

function processNode(node: Element): Element {
  const children = Array.from(node.children);
  for (const child of children) {
    const tag = child.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      if (tag === 'script' || tag === 'style' || tag === 'iframe' || tag === 'object' || tag === 'embed') {
        child.remove();
        continue;
      }
      const parent = child.parentNode;
      while (child.firstChild) {
        parent?.insertBefore(child.firstChild, child);
      }
      parent?.removeChild(child);
      continue;
    }
    const attrs = Array.from(child.attributes);
    for (const attr of attrs) {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value;
      if (DANGEROUS_ATTRS.has(attrName)) {
        child.removeAttribute(attr.name);
        continue;
      }
      const allowed = ALLOWED_ATTRS[tag];
      if (allowed && !allowed.has(attrName)) {
        child.removeAttribute(attr.name);
        continue;
      }
      if (attrName === 'href' || attrName === 'src') {
        if (/^(javascript|data|vbscript):/i.test(attrValue.trim())) {
          child.removeAttribute(attr.name);
        }
      }
      if (attrName === 'style') {
        child.setAttribute('style', sanitizeStyle(attrValue));
      }
      if (attrName === 'target' && attrValue === '_blank') {
        const rel = child.getAttribute('rel') || '';
        if (!rel.includes('noopener')) {
          child.setAttribute('rel', rel ? `${rel} noopener noreferrer` : 'noopener noreferrer');
        }
      }
    }
    processNode(child);
  }
  return node;
}
