const API = 'http://localhost:3001';

export async function getCategories() {
  const res = await fetch(`${API}/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getWordsByCategory(category) {
  const res = await fetch(
    `${API}/words?categoryId=${encodeURIComponent(category)}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch words for category "${category}": ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function saveWord(word, categoryId) {
  const res = await fetch(`${API}/words`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id: word.toLowerCase(),
      text: word,
      categoryId,
      addedAt: Date.now(),
    })
  });
  if (!res.ok) {
    throw new Error(`Failed to save word "${word}": ${res.status}`);
  }
  return res.json();
}

export async function getNote(wordId) {
  const res = await fetch(`${API}/notes?wordId=${encodeURIComponent(wordId)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch note for word "${wordId}": ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : null;
}

export async function saveNote(wordId, text) {
  const res = await fetch(`${API}/notes`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id: `note-${wordId}.toLowerCase()`, 
      wordId,
      text,
      updatedAt: Date.now(),
    })
  });
  if (!res.ok) {
    throw new Error(`Failed to save note for word "${wordId}": ${res.status}`);
  }
  return res.json();
}
