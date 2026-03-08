import { Link, useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import CategoryForm from '../features/word/categories/CategoryForm.jsx';
import {
  getCategories,
  getWordsByCategory,
  deleteWord,
  updateCategory,
  deleteCategory,
} from '../api/api.js';
import {
  isNetworkError,
  getNetworkErrorMessage,
  getGenericErrorMessage,
} from '../utils/errors.js';

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

  useEffect(() => {
    async function load() {
      try {
        setStatus('loading');
        setError(null);
        setCategory(null);
        setWords([]);

        const [cats, wordList] = await Promise.all([
          getCategories(),
          getWordsByCategory(id),
        ]);

        const found = cats.find((cat) => cat.id === id) ?? null;
        setCategory(found);
        setWords(wordList);
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

  async function handleDeleteCategory() {
    try {
      await Promise.all(words.map((word) => deleteWord(word.id)));
      await deleteCategory(id);
      navigate('/')
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
    console.log(category);
    setRenameValue(category.name);
    setRenameError(null);
    setIsRenaming(true);
  }

  function handleChange(e) {
    setRenameValue(e.target.value);
  }

  function handleCancel(){
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
    <main>
      <Link to="/">Home</Link>

      {status === 'loading' && <p>Loading…</p>}
      {status === 'error' && <p>{error}</p>}

      {status === 'success' && (
        <>
          {!category ? (
            <p>Category not found.</p>
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
                <>
                  <h1>{category.name}</h1>
                  <button onClick={handleStartRename}>Rename</button>
                </>
              )}

              {deleteWordError && <p>{deleteWordError}</p>}

              {words.length === 0 ? (
                <p>No words in this category yet.</p>
              ) : (
                <ul>
                  {words.map((w) => (
                    <li key={w.id}>
                      <Link to={`/word/${encodeURIComponent(w.text)}`}>
                        {w.text}
                      </Link>
                      <button onClick={() => handleDeleteWord(w.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <section>
                <h2>Danger zone</h2>
                <p>
                  Deleting this category will permanently remove all saved words
                  and their notes.
                </p>
                {deleteCategoryError && <p>{deleteCategoryError}</p>}
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)}>
                    Delete category
                  </button>
                ) : (
                  <div>
                    <p>Are you sure? This cannot be undone.</p>
                    <button onClick={handleDeleteCategory}>Yes, delete</button>
                    <button onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}

export default CategoryPage;