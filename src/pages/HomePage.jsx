import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router';
import {
  isNetworkError,
  getNetworkErrorMessage,
  getGenericErrorMessage,
  getDatamuseErrorMessage,
} from '../utils/errors.js';

function buildSuggestUrl(prefix) {
  const url = new URL('https://api.datamuse.com/sug');
  url.searchParams.set('s', prefix);
  url.searchParams.set('max', 10);
  return url.toString();
}

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

    const key = trimmed.toLowerCase();
    if (cacheRef.current[key]) {
      setSuggestions(cacheRef.current[key]);
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
          throw new Error(getDatamuseErrorMessage(res.status));
        }

        const data = await res.json();
        const results = Array.isArray(data) ? data : [];
        cacheRef.current[key] = results;
        setSuggestions(results);
        setStatus('success');
      } catch (e) {
        if (e.name === 'AbortError') return;
        setStatus('error');

        if (isNetworkError(e)) {
          setError(getNetworkErrorMessage());
        } else {
          setError(e.message || getGenericErrorMessage());
        }
      }
    }, 300);
    
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
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
      {status === 'success' && suggestions.length === 0 && (
        <p>No suggestions found</p>
      )}
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