export const ARTICLE_CONTENT = {
  machineName: 'article',
  titlePrefix: 'Automated Article',
  summary: 'Stable automated test summary.',
  linkUrl: 'https://example.com/reference',
  linkFieldId: 'edit-link-url',
  linkDescriptionText: 'Enter a valid URL',
} as const;

export const PAGE_CONTENT = {
  machineName: 'page',
  titlePrefix: 'Automated Page',
  aliasFieldId: 'edit-url-alias',
  aliasDescriptionText: 'Optional custom URL path',
} as const;

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${new Date().toISOString()} ${crypto.randomUUID().slice(0, 8)}`;
}
