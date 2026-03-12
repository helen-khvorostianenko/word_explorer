import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import styled from 'styled-components';
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

const SearchWrapper = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchLabel = styled.label`
  color: var(--text-muted);
  font-size: 0.9rem;
  white-space: nowrap;
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  width: 340px;
  transition: border-color 0.2s;
  box-shadow: var(--shadow);

  &:focus {
    border-color: var(--blue);
  }
`;

const SearchButton = styled.button`
  padding: 0.5rem 1.1rem;
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.95rem;
  white-space: nowrap;
  transition: background 0.2s;
`;

const StatusText = styled.p`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
`;

const ErrorText = styled.p`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  font-size: 0.85rem;
  color: var(--red, #c0392b);
`;

const SuggestionList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  list-style: none;
  z-index: 100;
  overflow: hidden;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem;
  background: ${({ $active }) => ($active ? 'var(--bg)' : 'transparent')};
  transition: background 0.15s;
`;

const SuggestionButton = styled.button`
  flex: 1;
  text-align: left;
  background: none;
  border: none;
  padding: 0.5rem 0.5rem;
  color: var(--text);
  cursor: pointer;
  font-size: 0.95rem;

  &:hover {
    background: none;
  }
`;

const CategoryLink = styled(Link)`
  font-size: 0.78rem;
  color: var(--blue);
  white-space: nowrap;
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--blue) 10%, transparent);
  transition: background 0.2s;

  &:hover {
    background: color-mix(in srgb, var(--blue) 20%, transparent);
  }
`;

function SearchBar({ savedWords = [], categories = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const controllerRef = useRef(null);
  const cacheRef = useRef({});

  const savedWordsMap = useMemo(() => {
    return new Map(savedWords.map((word) => [word.text.toLowerCase(), word]));
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
        if (!res.ok) throw new Error(getDatamuseErrorMessage(res.status));

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
    }, 500);

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

  const handleSelect = useCallback(
    (word) => {
      setQuery('');
      setSuggestions([]);
      setActiveIndex(-1);
      navigate(`/word/${encodeURIComponent(word)}`);
    },
    [navigate]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        setQuery('');
        setSuggestions([]);
        setActiveIndex(-1);
        return;
      }
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
        case 'Enter':
          if (activeIndex >= 0 && suggestions[activeIndex]) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex].word);
          }
          break;
        default:
          break;
      }
    },
    [suggestions, activeIndex, handleSelect]
  );

  return (
    <SearchWrapper>
      <SearchForm onSubmit={handleSubmit}>
        <SearchLabel htmlFor="search">Search a word</SearchLabel>
        <SearchInput
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          placeholder="Type a word..."
        />
        <SearchButton type="submit">Search</SearchButton>
      </SearchForm>

      {status === 'loading' && <StatusText>Loading...</StatusText>}
      {status === 'error' && <ErrorText>{error}</ErrorText>}
      {status === 'success' && suggestions.length === 0 && (
        <StatusText>No suggestions found</StatusText>
      )}

      {suggestions.length > 0 && (
        <SuggestionList>
          {suggestions.map((item, idx) => {
            const saved = savedWordsMap.get(item.word.toLowerCase());
            const categoryName = saved
              ? categoriesMap.get(saved.categoryId)
              : null;

            return (
              <SuggestionItem
                key={item.word}
                $active={idx === activeIndex}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <SuggestionButton
                  type="button"
                  tabIndex={-1}
                  onClick={() => handleSelect(item.word)}
                >
                  {item.word}
                </SuggestionButton>
                {saved && categoryName && (
                  <CategoryLink to={`/categories/${saved.categoryId}`}>
                    {categoryName}
                  </CategoryLink>
                )}
              </SuggestionItem>
            );
          })}
        </SuggestionList>
      )}
    </SearchWrapper>
  );
}

export default SearchBar;
