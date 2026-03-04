import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router';

function buildSuggestUrl(prefix) {
  const url = new URL('https://api.datamuse.com/sug');
  url.searchParams.set('s', prefix);
  url.searchParams.set('max', 10);
  return url.toString();
}

const getErrorMessage = (status) => {
  switch (status) {
    case 400:
      return 'Invalid request. Please try a different search term.';
    case 404:
      return 'Suggestions service is temporarily unavailable.';
    case 408:
      return 'Request timeout. Please check your connection and try again.';
    case 429:
      return 'Too many requests. Please wait a moment before typing again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. We are working to fix this as soon as possible.';
    default:
      return `An unexpected error occurred (Status: ${status}). Please try again later.`;
  }
};

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const controllerRef = useRef(null);
  const cacheRef = useRef({})
  
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setStatus('idle');
      setError(null)
      return;
    }

    if (cacheRef.current[trimmed]) {
      setSuggestions(cacheRef.current[trimmed]);
      setStatus('success');
      setError(null);
      return;
    }
    

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    const timeoutId = setTimeout(async () => {
      try {
        setStatus('loading');
        setError(null);

        const res = await fetch(buildSuggestUrl(trimmed), {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(getErrorMessage(res.status));
        }

        const data = await res.json();
        const results = Array.isArray(data) ? data : [];
        cacheRef.current[trimmed] = results;
        setSuggestions(results);
        setStatus('success');
      } catch (e) {
        if (e.name === 'AbortError') return;
        setStatus('error');

        if (e instanceof TypeError && e.message === 'Failed to fetch') {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(e.message || 'Something went wrong. Please try again.');
        }
      }
    }, 300);
    
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      cacheRef.current = {};
    }
  }, [query]);

  const onSelect = (word) => {
    navigate(`/word/${encodeURIComponent(word)}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const word = query.trim();
    if (!word) return;
    navigate(`/word/${encodeURIComponent(word)}`);
  };

  
  return (
    <main>
      <h1>Word Explorer</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="search">Search a word</label>
        <input
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          placeholder="Type a word..."
        />
        <button type="submit">Search</button>
      </form>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && <p>{error}</p>}

      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((item) => (
            <li key={item.word}>
              <button type="button" onClick={() => onSelect(item.word)}>
                {item.word}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
export default HomePage;