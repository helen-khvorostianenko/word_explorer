import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { getCategories, getWordsByCategory } from "../api/api";

function CategoryPage(){
  const {id} = useParams();

  const [category, setCategory] = useState(null);
  const [words, setWords] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

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
              {words.length === 0 ? (
                <p>No words in this category yet.</p>
              ) : (
                <ul>
                  {words.map((w) => (
                    <li key={w.id}>
                      <Link to={`/word/${encodeURIComponent(w.text)}`}>
                        {w.text}
                      </Link>
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