import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { getCategories, getWordsByCategory, deleteWord } from '../api/api.js';
import {
  isNetworkError,
  getNetworkErrorMessage,
  getGenericErrorMessage,
} from '../utils/errors.js';

function CategoryPage(){
  const {id} = useParams();

  const [category, setCategory] = useState(null);
  const [words, setWords] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    async function load() {
      try{
        setStatus('loading');
        setError(null);
        setCategory(null);
        setWords([]);

        const[cats, wordList] = await Promise.all([
          getCategories(),
          getWordsByCategory(id),
        ]);

        const found = cats.find((cat) => cat.id === id) ?? null;
        setCategory(found);
        setWords(wordList);
        setStatus('success');
      } catch(e) {
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

  async function handleDeleteWord(wordId) {
    try{
      setDeleteError(null);
      await deleteWord(wordId)
      setWords((prev) => prev.filter((w) => w.id !== wordId));
    } catch {
      setDeleteError(
        isNetworkError(e)
          ? getNetworkErrorMessage()
          : e.message || getGenericErrorMessage()
      );  
    }
  }


  return (
    <main>
      <Link to="/">Home</Link>
      <h1>Category</h1>
      <p>ID: {id}</p>
      {status === 'loading' && <p>Loading…</p>}
      {status === 'error' && <p>{error}</p>}

      {status === 'success' && (
        <>
          {!category ? (
            <p>Category not found.</p>
          ) : (
            <>
              <h1>{category.name}</h1>
              {deleteError && <p>{deleteError}</p>}
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
            </>
          )}
        </>
      )}
    </main>
  );
}

export default CategoryPage;