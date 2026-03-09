import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import PageLayout from '../shared/PageLayout.jsx';
import SearchBar from '../shared/SearchBar.jsx';
import CategoryForm from '../features/categories/CategoryForm.jsx';
import { createCategory, getAllWords, getCategories } from '../api/api.js';
import { getGenericErrorMessage, getNetworkErrorMessage, isNetworkError } from '../utils/errors.js';

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState(null);

  const [allWords, setAllWords] = useState([]);


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

  return (
    <PageLayout>
      <h1>Word Explorer</h1>
      <SearchBar savedWords={allWords} categories={categories}/>
      <section>
        <h2>Your lists</h2>
        {status === 'loading' && <p>Loading...</p>}
        {status === 'error' && <p>{error}</p>}
        {status === 'success' && (
          <>
            {categories.length === 0 && !isCreating && (
              <p>No lists yet. Create your first one!</p>
            )}
            <ul>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/categories/${cat.id}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>

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