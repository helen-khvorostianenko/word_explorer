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

export async function getWord(wordId) {
  const res = await fetch(`${API}/words/${encodeURIComponent(wordId)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch word "${wordId}": ${res.status}`);
  }
  return res.json();
} 

export async function updatedWordCategory(wordId, newCategoryId) {
  const res = await fetch(`${API}/words/${encodeURIComponent(wordId)}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ 
      categoryId: newCategoryId,
      updatedAt: Date.now(),
     }),
  });
  if (!res.ok){
    throw new Error(`Failed to update category for word "${wordId}": ${res.status}`);
  }
  return res.json();
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
      id: `note-${wordId.toLowerCase()}`,
      wordId,
      text,
      updatedAt: Date.now(),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to save note for word "${wordId}": ${res.status}`);
  }
  return res.json();
}

export async function deleteNote(noteId) {
  const res = await fetch(`${API}/notes/${encodeURIComponent(noteId)}`, {
    method: `DELETE`,
  });
  if (!res.ok) {
    throw new Error(`Failed to delete note "${noteId}": ${res.status}`);
  }
  return res.json();
}

export async function updateNote(noteId, text) {
  const res = await fetch(`${API}/notes/${encodeURIComponent(noteId)}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      text,
      updatedAt: Date.now(),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update note "${noteId}": ${res.status}`);
  }
  return res.json();  
}