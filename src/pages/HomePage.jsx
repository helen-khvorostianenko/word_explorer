import { useEffect, useState, useCallback} from 'react';
import { Link } from 'react-router';
import PageLayout from '../shared/PageLayout.jsx';
import SearchBar from '../shared/SearchBar.jsx';
import CategoryForm from '../features/categories/CategoryForm.jsx';
import { createCategory, getAllWords, getCategories } from '../api/api.js';
import { getGenericErrorMessage, getNetworkErrorMessage, isNetworkError } from '../utils/errors.js';

const PREVIEW_WORDS_COUNT = 3;
const PAGE_SIZE = 10;

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState(null);

  const [allWords, setAllWords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    async function load() {
      try{
        setStatus('loading');
        setError(null);
        const [cats, words] = await Promise.all([getCategories(), getAllWords()]);
        setCategories(cats);
        setAllWords(words);
        setStatus('success');
      } catch (e) {
        setStatus('error');
        setError(isNetworkError(e) 
          ? getNetworkErrorMessage() 
          : e.message || getGenericErrorMessage()
        );
      }
      
    }
    load();
  }, []);

  function handleChange(e) {
    setNewName(e.target.value);
  }
  
  function handleCancel(){
    setIsCreating(false);
    setNewName('');
    setCreateError(null);
  }
  
  async function handleCreate(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreateError('Name cannot be empty.');
      return;
    }
    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setCreateError('A list with this name already exists.');
      return;
    }

    try {
      setCreateError(null);
      const created = await createCategory(trimmed);
      setCategories((prev) => [...prev, created]);
      setNewName('');
      setIsCreating(false);
    } catch (e) {
      setCreateError(
        isNetworkError(e)
          ? getNetworkErrorMessage()
          : e.message || getGenericErrorMessage()
      );
    }
  }

  function getPreviewWords(catId) {
    return allWords
      .filter((word) => word.categoryId === catId)
      .slice(0, PREVIEW_WORDS_COUNT);
  }

  const totalPages = Math.ceil(categories.length / PAGE_SIZE);
  
  const getPagedCategories = useCallback(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, currentPage]);

  const handlePrev = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }, [totalPages]);


  return (
    <PageLayout>
      <h1>Word Explorer</h1>
      <SearchBar savedWords={allWords} categories={categories} />
      <section>
        <h2>Your lists</h2>
        {status === 'loading' && <p>Loading...</p>}
        {status === 'error' && <p>{error}</p>}
        {status === 'success' && (
          <>
            {categories.length === 0 && !isCreating && (
              <p>No lists yet. Create your first one!</p>
            )}
            <ul className="category-grid">
              {getPagedCategories().map((cat) => {
                const preview = getPreviewWords(cat.id);
                const wordCount = allWords.filter(
                  (w) => w.categoryId === cat.id
                ).length;

                return (
                  <li key={cat.id}>
                    <Link
                      to={`/categories/${cat.id}`}
                      className="category-card"
                    >
                      <h3>{cat.name}</h3>
                      {preview.length > 0 ? (
                        <ul className="category-card__preview">
                          {preview.map((word) => (
                            <li key={word.id}>{word.text}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="category-card__empty">No words yet</p>
                      )}
                      <p className="category-card__count">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div>
                <button onClick={handlePrev} disabled={currentPage === 1}>
                  Prev
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}

            {isCreating ? (
              <CategoryForm
                value={newName}
                error={createError}
                onSubmit={handleCreate}
                onChange={handleChange}
                onCancel={handleCancel}
              />
            ) : (
              <button onClick={() => setIsCreating(true)}>+ New List</button>
            )}
          </>
        )}
      </section>
    </PageLayout>
  );
}
export default HomePage;