export function buildDictionaryUrl(word) {
  return `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
}

export function normalizeDictionary(apiData, maxDefsPerPart = 3) {
  const entry = Array.isArray(apiData) ? apiData[0] : null;
  if (!entry) return null;

  const word = entry.word || '';

  const ipa =
    entry.phonetic ||
    entry.phonetics?.find((p) => typeof p.text === 'string' && p.text.trim())?.text ||
    null;

  const audioUrl =
    entry.phonetics?.find((p) => typeof p.audio === 'string' && p.audio.trim())?.audio ||
    null;

  const definitionsByPos = (entry.meanings || []).map((m) => ({
    partOfSpeech: m.partOfSpeech || '—',
    definitions: (m.definitions || [])
      .map((d) => d.definition)
      .filter(Boolean)
      .slice(0, maxDefsPerPart),
  })).filter((group) => group.definitions.length > 0);

  return { word, ipa, audioUrl, definitionsByPos };
}