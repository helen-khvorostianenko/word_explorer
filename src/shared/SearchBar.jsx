
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, Link } from 'react-router';
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

function SearchBar({ savedWords = [], categories = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const controllerRef = useRef(null);
  const cacheRef = useRef({});
  const listRef = useRef(null);

  const savedWordsMap = useMemo(() => {
    return new Map (savedWords.map((word) => [word.text.toLowerCase(), word]));
  }, [savedWords]);

  const categoriesMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.id, cat.name]));
  }, [categories]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setStatus('idle');
      setError(null);
      return;
    }

    const key = trimmed.toLowerCase();
    if (cacheRef.current[key]) {
      setSuggestions(cacheRef.current[key]);
      setStatus('success');
      setError(null);
      return;
    }

    if (controllerRef.current) controllerRef.current.abort();
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
        setError(
          isNetworkError(e)
            ? getNetworkErrorMessage()
            : e.message || getGenericErrorMessage()
        );
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex].word);
        return;
      }
      const word = query.trim();
      if (!word) return;
      navigate(`/word/${encodeURIComponent(word)}`);
    },
    [query, navigate, activeIndex, suggestions]
  );

  const handleSelect = useCallback((word) => {
    setQuery('');
    setSuggestions([]);
    setActiveIndex(-1);
    navigate(`/word/${encodeURIComponent(word)}`);
  }, [navigate]);

  function handleKeyDown(e) {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Escape':
        setQuery('');
        setSuggestions([]);
        setActiveIndex(-1);
        break;
      case 'Enter':
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          e.preventDefault();
          handleSelect(suggestions[activeIndex].word);
        }
        break;
      default:
        break;
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="search">Search a word</label>
        <input
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          placeholder="Type a word..."
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
          }
        />
        <button type="submit">Search</button>
      </form>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && <p>{error}</p>}
      {status === 'success' && suggestions.length === 0 && (
        <p>No suggestions found</p>
      )}
      {suggestions.length > 0 && (
        <ul id="search-suggestions" ref={listRef} role="listbox">
          {suggestions.map((item, idx) => {
            const saved = savedWordsMap.get(item.word.toLowerCase());
            const categoryName = saved
              ? categoriesMap.get(saved.categoryId)
              : null;
            return (
              <li
                key={item.word}
                id={`suggestion-${idx}`}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(item.word)}
                  tabIndex={idx === activeIndex ? 0 : -1}
                >
                  {item.word}
                </button>
                {saved && categoryName && (
                  <Link to={`/categories/${saved.categoryId}`}>
                    {categoryName}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;