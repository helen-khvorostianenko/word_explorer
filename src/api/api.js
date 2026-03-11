import { nanoid } from 'nanoid';

const SERVER_BASE_URL = 'http://localhost:3001';

export async function getCategories() {
  const res = await fetch(`${SERVER_BASE_URL}/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createCategory(name) {
  const res = await fetch(`${SERVER_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: nanoid(8),
      name,
      createdAt: Date.now(),
    }),
  });
  if (!res.ok) throw new Error(`Failed to create category: ${res.status}`);
  return res.json();
}

export async function updateCategory(categoryId, name) {
  const res = await fetch(
    `${SERVER_BASE_URL}/categories/${encodeURIComponent(categoryId)}`,
    {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    }
  );
  if (!res.ok) throw new Error(`Failed to update category: ${res.status}`);
  return res.json();
}

export async function deleteCategory(categoryId) {
  const res = await fetch(
    `${SERVER_BASE_URL}/categories/${encodeURIComponent(categoryId)}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) throw new Error(`Failed to delete category: ${res.status}`);
  return res.json();
}
export async function getWordsByCategory(categoryId) {
  const res = await fetch(
    `${SERVER_BASE_URL}/words?categoryId=${encodeURIComponent(categoryId)}`
  );
  if (!res.ok) throw new Error(
    `Failed to fetch words for category "${categoryId}": ${res.status}`
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getWord(wordText) {
  const res = await fetch(`${SERVER_BASE_URL}/words?text=${encodeURIComponent(wordText)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch word "${wordText}": ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function getAllWords() {
  const res = await fetch(`${SERVER_BASE_URL}/words`);
  if (!res.ok) throw new Error(`Failed to fetch words: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function saveWord(wordText, categoryId) {
  const res = await fetch(`${SERVER_BASE_URL}/words`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: nanoid(8),
      text: wordText,
      categoryId,
      addedAt: Date.now(),
    }),
  });
  if (!res.ok) throw new Error(`Failed to save word "${wordText}": ${res.status}`);
  return res.json();
}

export async function updateWordCategory(wordId, newCategoryId) {
  const res = await fetch(`${SERVER_BASE_URL}/words/${encodeURIComponent(wordId)}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      categoryId: newCategoryId,
      updatedAt: Date.now(),
    }),
  });
  if (!res.ok) throw new Error(`Failed to update word category: ${res.status}`);
  return res.json();
}

export async function deleteWord(wordId) {
  const res = await fetch(`${SERVER_BASE_URL}/words/${encodeURIComponent(wordId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete word: ${res.status}`);
  return res.json();
}

export async function getNote(wordId) {
  const res = await fetch(`${SERVER_BASE_URL}/notes?wordId=${encodeURIComponent(wordId)}`);
  if (!res.ok)
    throw new Error(`Failed to fetch note for word "${wordId}": ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data[0] : null;
}

export async function saveNote(wordId, text) {
  const res = await fetch(`${SERVER_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id: nanoid(8),
      wordId,
      text,
      updatedAt: Date.now(),
    }),
  });
  if (!res.ok)
    throw new Error(`Failed to save note for word "${wordId}": ${res.status}`);
  return res.json();
}

export async function updateNote(noteId, text) {
  const res = await fetch(`${SERVER_BASE_URL}/notes/${encodeURIComponent(noteId)}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      text,
      updatedAt: Date.now(),
    }),
  });
  if (!res.ok) throw new Error(`Failed to update note : ${res.status}`);
  return res.json();
}

export async function deleteNote(noteId) {
  const res = await fetch(`${SERVER_BASE_URL}/notes/${encodeURIComponent(noteId)}`, {
    method: `DELETE`,
  });
  if (!res.ok)
    throw new Error(`Failed to delete note "${noteId}": ${res.status}`);
  return res.json();
}
