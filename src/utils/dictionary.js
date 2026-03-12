export function buildDictionaryUrl(word) {
  return `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
}

export function normalizeDictionary(apiData, maxDefsPerPart = 3) {
  const entry = Array.isArray(apiData) ? apiData[0] : null;
  if (!entry) return null;

  const word = entry.word || '';

  const ipa =
    entry.phonetic ||
    entry.phonetics?.find(
      (item) => typeof item.text === 'string' && item.text.trim()
    )?.text ||
    null;

  const audioUrl =
    entry.phonetics?.find(
      (item) => typeof item.audio === 'string' && item.audio.trim()
    )?.audio || null;

  const definitionsByPos = (entry.meanings || [])
    .map((item) => ({
      partOfSpeech: item.partOfSpeech || '—',
      definitions: (item.definitions || [])
        .map((d) => d.definition)
        .filter(Boolean)
        .slice(0, maxDefsPerPart),
    }))
    .filter((group) => group.definitions.length > 0);

  return { word, ipa, audioUrl, definitionsByPos };
}
