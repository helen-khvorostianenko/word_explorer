import { useState, useEffect, useRef } from 'react';
import { saveNote, getNote, updateNote, deleteNote } from '../../api/api.js';

const DEBOUNCE_MS = 800;
function Note({word, savedWordData}){
  const [note, setNote] = useState('');
  const [noteStatus, setNoteStatus] = useState('idle');
  const [noteId, setNoteId] = useState(null);

  const noteTimeoutRef = useRef(null);
  const isNoteInitialLoad = useRef(true);

  useEffect(() => {
    setNote('');
    setNoteId(null);
    setNoteStatus('idle');
    isNoteInitialLoad.current = true;
  }, [word]);

  useEffect(() => {
    if (!savedWordData) return;

    async function loadNote() {
      try {
        const data = await getNote(word);
        if (data) {
          setNote(data.text);
          setNoteId(data.id);
        }
      } catch {
      } finally {
        isNoteInitialLoad.current = false;
      }
    }
    loadNote();
  }, [savedWordData]);

  useEffect(() => {
    if (isNoteInitialLoad.current) return;
    if (!noteId && !note.trim()) return;

    clearTimeout(noteTimeoutRef.current);
    setNoteStatus('saving');

    noteTimeoutRef.current = setTimeout(async () => {
      try {
        let data;
        if (!noteId) {
          data = await saveNote(word, note);
          setNoteId(data.id);
        } else {
          await updateNote(noteId, note);
        }
        setNoteStatus('saved');
      } catch {
        setNoteStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(noteTimeoutRef.current);
  }, [note]);

  async function handleDeleteNote() {
    if (!noteId) return;

    await deleteNote(noteId);

    setNote('');
    setNoteId(null);
    setNoteStatus('idle');
  }

  function renderNoteStatus() {
    switch (noteStatus) {
      case 'saving':
        return <p>Saving…</p>;
      case 'saved':
        return <p>✓ Saved</p>;
      case 'error':
        return <p>Failed to save note</p>;
      default:
        return null;
    }
  }

  return (
    <section>
      <h2>Notes</h2>
      <textarea
        id="note"
        name="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your note..."
        rows={4}
      />
      {noteId && <button onClick={handleDeleteNote}>Delete note</button>}
      {renderNoteStatus()}
    </section>
  );

}

export default Note;