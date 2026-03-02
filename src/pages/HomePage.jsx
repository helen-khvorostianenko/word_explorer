import { useEffect, useState, useRef } from "react";

function buildSuggestUrl(prefix) {
  const url = new URL('https://api.datamuse.com/sug');
  url.searchParams.set('s', prefix);
  url.searchParams.set('max', 10);
  return url.toString();
}

function HomePage() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setStatus('idle');
      setError(null)
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    
    async function load() {
        try {
          setStatus('loading');
          setError(null);

          const res = await fetch(buildSuggestUrl(trimmed), {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`Datamuse error: ${res.status}`);

          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setStatus('success');

        } catch (e) {
          if (e.name === 'AbortError') return;
          setStatus('error');
          setError(e.message || 'Failed to load suggestions');
        }
    }

    load();
    return () => controller.abort();
  }, [query]);

  
  return (
    <main>
      <h1>Word Explorer</h1>

      <label htmlFor="search">Search a word</label>
      <input
        id="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        placeholder="Type a word..."
      />
      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && <p>{error}</p>}

      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((item) => (
            <li key={item.word}>{item.word}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
export default HomePage;