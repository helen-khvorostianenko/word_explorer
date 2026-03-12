import { Link, useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import CategoryForm from '../features/categories/CategoryForm.jsx';
import {
  getCategories,
  getWordsByCategory,
  deleteWord,
  updateCategory,
  deleteCategory,
  getAllNotes,
} from '../api/api.js';
import {
  isNetworkError,
  getNetworkErrorMessage,
  getGenericErrorMessage,
} from '../utils/errors.js';
import PageLayout from '../shared/PageLayout.jsx';

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: var(--navy);
  margin-bottom: 0.5rem;
`;

const RenameButton = styled.button`
  padding: 0.3rem 0.8rem;
  background: var(--surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.85rem;
  transition:
    border-color 0.2s,
    color 0.2s;

  &:hover {
    border-color: var(--blue);
    color: var(--text);
  }
`;

const StatusMessage = styled.p`
  color: var(--text-muted);
  font-size: 0.95rem;
`;

const ErrorMessage = styled.p`
  color: var(--red, #c0392b);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
`;

const WordList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const WordItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);

  &:first-child {
    border-top: 1px solid var(--border);
  }
`;

const WordLink = styled(Link)`
  color: var(--navy);
  font-size: 0.95rem;
  transition: color 0.2s;

  &:hover {
    color: var(--blue);
  }
`;

const WordInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const NotePreview = styled.span`
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: var(--blue);
  }
`;

const RemoveButton = styled.button`
  padding: 0.25rem 0.6rem;
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

// ─── Danger zone ─────────────────────────────────────────────────

const DangerSection = styled.section`
  margin-top: 3rem;
  padding: 1.25rem;
  border: 1px solid #f5c6cb;
  border-radius: var(--radius);
  background: #fff8f8;
`;

const DangerText = styled.p`
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
`;

const DeleteButton = styled.button`
  padding: 0.4rem 1rem;
  background: none;
  color: var(--red, #c0392b);
  border: 1px solid var(--red, #c0392b);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition:
    background 0.2s,
    color 0.2s;

  &:hover {
    background: var(--red, #c0392b);
    color: #fff;
  }
`;

const ConfirmRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ConfirmText = styled.p`
  font-size: 0.9rem;
  color: var(--text);
  margin-bottom: 0.75rem;
`;

const ConfirmDeleteButton = styled.button`
  padding: 0.4rem 1rem;
  background: var(--red, #c0392b);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const ConfirmCancelButton = styled.button`
  padding: 0.4rem 1rem;
  background: var(--surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--blue);
  }
`;

function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [words, setWords] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState(null);
  const [deleteWordError, setDeleteWordError] = useState(null);
  const [deleteCategoryError, setDeleteCategoryError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState([]);

  const notesMap = new Map(notes.map((n) => [n.wordId, n.text]));

  useEffect(() => {
    async function load() {
      try {
        setStatus('loading');
        setError(null);
        setCategory(null);
        setWords([]);

        const [cats, wordList, allNotes] = await Promise.all([
          getCategories(),
          getWordsByCategory(id),
          getAllNotes(),
        ]);

        const found = cats.find((cat) => cat.id === id) ?? null;
        setCategory(found);
        setWords(wordList);
        setNotes(allNotes);
        setStatus('success');
      } catch (e) {
        setStatus('error');
        setError(
          isNetworkError(e)
            ? getNetworkErrorMessage()
            : e.message || getGenericErrorMessage()
        );
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setConfirmDelete(false);
    }
    if (confirmDelete) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmDelete]);

  async function handleDeleteCategory() {
    try {
      await Promise.all(words.map((word) => deleteWord(word.id)));
      await deleteCategory(id);
      navigate('/');
    } catch (e) {
      setConfirmDelete(false);
      setDeleteCategoryError(
        isNetworkError(e)
          ? getNetworkErrorMessage()
          : e.message || getGenericErrorMessage()
      );
    }
  }
  async function handleDeleteWord(wordId) {
    try {
      setDeleteWordError(null);
      await deleteWord(wordId);
      setWords((prev) => prev.filter((word) => word.id !== wordId));
    } catch (e) {
      setDeleteWordError(
        isNetworkError(e)
          ? getNetworkErrorMessage()
          : e.message || getGenericErrorMessage()
      );
    }
  }

  function handleStartRename() {
    setRenameValue(category.name);
    setRenameError(null);
    setIsRenaming(true);
  }

  function handleChange(e) {
    setRenameValue(e.target.value);
  }

  function handleCancel() {
    setIsRenaming(false);
    setRenameError(null);
  }

  async function handleRename(e) {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameError('Name cannot be empty.');
      return;
    }
    if (trimmed === category.name) {
      setIsRenaming(false);
      return;
    }
    try {
      setRenameError(null);
      const updated = await updateCategory(id, trimmed);
      setCategory(updated);
      setIsRenaming(false);
    } catch (e) {
      setRenameError(
        isNetworkError(e)
          ? getNetworkErrorMessage()
          : e.message || getGenericErrorMessage()
      );
    }
  }

  return (
    <PageLayout>
      {status === 'loading' && <StatusMessage>Loading…</StatusMessage>}
      {status === 'error' && <ErrorMessage>{error}</ErrorMessage>}

      {status === 'success' && (
        <>
          {!category ? (
            <StatusMessage>Category not found.</StatusMessage>
          ) : (
            <>
              {isRenaming ? (
                <CategoryForm
                  value={renameValue}
                  error={renameError}
                  onSubmit={handleRename}
                  onChange={handleChange}
                  onCancel={handleCancel}
                  submitLabel="Save"
                />
              ) : (
                <TitleRow>
                  <PageTitle>{category.name}</PageTitle>
                  <RenameButton onClick={handleStartRename}>
                    Rename
                  </RenameButton>
                </TitleRow>
              )}

              {deleteWordError && (
                <ErrorMessage>{deleteWordError}</ErrorMessage>
              )}

              {words.length === 0 ? (
                <StatusMessage>No words in this category yet.</StatusMessage>
              ) : (
                <WordList>
                  {words.map((word) => {
                    const noteText = notesMap.get(word.id);
                    return (
                      <WordItem key={word.id}>
                        <WordInfo>
                          <WordLink
                            to={`/word/${encodeURIComponent(word.text)}`}
                          >
                            {word.text}
                          </WordLink>
                          {noteText && <NotePreview>{noteText}</NotePreview>}
                        </WordInfo>
                        <RemoveButton onClick={() => handleDeleteWord(word.id)}>
                          Remove
                        </RemoveButton>
                      </WordItem>
                    );
                  })}
                </WordList>
              )}
              <DangerSection>
                <DangerText>
                  Deleting this category will permanently remove all saved words
                  and their notes.
                </DangerText>
                {deleteCategoryError && (
                  <ErrorMessage>{deleteCategoryError}</ErrorMessage>
                )}
                {!confirmDelete ? (
                  <DeleteButton onClick={() => setConfirmDelete(true)}>
                    Delete category
                  </DeleteButton>
                ) : (
                  <>
                    <ConfirmText>
                      Are you sure? This cannot be undone.
                    </ConfirmText>
                    <ConfirmRow>
                      <ConfirmDeleteButton onClick={handleDeleteCategory}>
                        Yes, delete
                      </ConfirmDeleteButton>
                      <ConfirmCancelButton
                        onClick={() => setConfirmDelete(false)}
                      >
                        Cancel
                      </ConfirmCancelButton>
                    </ConfirmRow>
                  </>
                )}
              </DangerSection>
            </>
          )}
        </>
      )}
    </PageLayout>
  );
}

export default CategoryPage;
