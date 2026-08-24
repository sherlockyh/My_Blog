export interface TocItem {
  id: string;
  level: number;
  text: string;
}

function createHeadingId(text: string, index: number) {
  return `${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') || 'section'}-${index}`;
}

export function getToc(content: string): TocItem[] {
  return content
    .split('\n')
    .map((line, index) => {
      const match = /^(#{2,3})\s+(.+)$/.exec(line);
      if (!match) return null;
      const text = match[2].replace(/[*_`]/g, '').trim();
      return { id: createHeadingId(text, index), level: match[1].length, text };
    })
    .filter((item): item is TocItem => Boolean(item));
}
