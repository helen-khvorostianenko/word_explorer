import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { saveNote, getNote, updateNote, deleteNote } from '../../api/api.js';

const DEBOUNCE_MS = 800;

const Section = styled.section``;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--navy);
  border-left: 3px solid var(--gold);
  padding-left: 0.6rem;
  margin-bottom: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--blue);
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  min-height: 1.5rem;
`;

const StatusText = styled.span`
  font-size: 0.85rem;
  color: ${({ $status }) => {
    if ($status === 'saved') return 'var(--blue)';
    if ($status === 'error') return 'var(--red, #c0392b)';
    return 'var(--text-muted)';
  }};
`;

const DeleteButton = styled.button`
  padding: 0.3rem 0.75rem;
  background: none;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.8rem;
  transition:
    border-color 0.2s,
    color 0.2s;

  &:hover {
    border-color: var(--red, #c0392b);
    color: var(--red, #c0392b);
  }
`;

function Note({ wordId }) {
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

    async function loadNote() {
      try {
        const data = await getNote(wordId);
        if (data) {
          setNote(data.text);
          setNoteId(data.id);
        }
      } catch {
        // note may not exist yet — ignore
      } finally {
        isNoteInitialLoad.current = false;
      }
    }
    loadNote();
  }, [wordId]);

  useEffect(() => {
    if (isNoteInitialLoad.current) return;
    if (!noteId && !note.trim()) return;

    clearTimeout(noteTimeoutRef.current);
    setNoteStatus('saving');

    noteTimeoutRef.current = setTimeout(async () => {
      try {
        let data;
        if (!noteId) {
          data = await saveNote(wordId, note);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  async function handleDeleteNote() {
    if (!noteId) return;
    clearTimeout(noteTimeoutRef.current);
    try {
      await deleteNote(noteId);
      setNote('');
      setNoteId(null);
      setNoteStatus('idle');
    } catch {
      setNoteStatus('error');
    }
  }

  function renderNoteStatus() {
    switch (noteStatus) {
      case 'saving':
        return 'Saving…';
      case 'saved':
        return '✓ Saved';
      case 'error':
        return 'Failed to save note';
      default:
        return null;
    }
  }

  return (
    <Section>
      <SectionTitle>Notes</SectionTitle>
      <Textarea
        id="note"
        name="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your note here…"
        rows={4}
      />
      <Footer>
        <StatusText $status={noteStatus}>{renderNoteStatus()}</StatusText>
        {noteId && (
          <DeleteButton onClick={handleDeleteNote}>Delete note</DeleteButton>
        )}
      </Footer>
    </Section>
  );
}

export default Note;
