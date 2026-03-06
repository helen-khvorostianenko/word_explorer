export function buildDatamuseWordsUrl(tabKey, word) {
  const url = new URL('https://api.datamuse.com/words');
  url.searchParams.set(tabKey, word);
  url.searchParams.set('max', '20');
  return url.toString();
}
