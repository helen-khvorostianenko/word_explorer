import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { buildDatamuseWordsUrl } from '../../utils/datamuse.js';
import {
  isNetworkError,
  getNetworkErrorMessage,
  getGenericErrorMessage,
  getDatamuseErrorMessage,
} from '../../utils/errors.js';

const TABS = [
  { key: 'rel_syn', label: 'Synonyms' },
  { key: 'rel_rhy', label: 'Rhymes' },
  { key: 'ml', label: 'Means Like' },
  { key: 'sp', label: 'Spelled Like' },
  { key: 'sl', label: 'Sounds Like' },
];

function RelatedWords({ word }) {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [relatedStatus, setRelatedStatus] = useState('idle');
  const [relatedError, setRelatedError] = useState(null);
  const [relatedWords, setRelatedWords] = useState([]);

  const tabsControllerRef = useRef(null);
  const tabsCacheRef = useRef({});

  useEffect(() => {
    setActiveTab(TABS[0].key);
  }, [word]);

  useEffect(() => {
    if (!word) return;

    const cacheKey = `${activeTab}-${word}`.toLowerCase();
    if (tabsCacheRef.current[cacheKey]) {
      setRelatedWords(tabsCacheRef.current[cacheKey]);
      setRelatedStatus('success');
      setRelatedError(null);
      return;
    }

    if (tabsControllerRef.current) {
      tabsControllerRef.current.abort();
    }
    const controller = new AbortController();
    tabsControllerRef.current = controller;

    async function loadRelated() {
      try {
        setRelatedStatus('loading');
        setRelatedError(null);
        if (!tabsCacheRef.current[cacheKey]) {
          setRelatedWords([]);
        }

        const res = await fetch(buildDatamuseWordsUrl(activeTab, word), {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(getDatamuseErrorMessage(res.status));
        }

        const data = await res.json();
        const results = Array.isArray(data) ? data : [];
        tabsCacheRef.current[cacheKey] = results;
        setRelatedWords(results);
        setRelatedStatus('success');
      } catch (e) {
        if (e.name === 'AbortError') return;
        setRelatedStatus('error');
        if (isNetworkError(e)) setRelatedError(getNetworkErrorMessage());
        else setRelatedError(e.message || getGenericErrorMessage());
      }
    }

    loadRelated();
    return () => {
      controller.abort();
    };
  }, [word, activeTab]);

  return (
    <section>
      <h2>Explore</h2>
      <div>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            disabled={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {relatedStatus === 'loading' && <p>Loading…</p>}
      {relatedStatus === 'error' && <p>{relatedError}</p>}
      {relatedStatus === 'success' && relatedWords.length === 0 && (
        <p>No results.</p>
      )}
      {relatedWords.length > 0 && (
        <ul>
          {relatedWords.map((item) => (
            <li key={`${item.word}-${activeTab}`}>
              <Link to={`/word/${encodeURIComponent(item.word)}`}>
                {item.word}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RelatedWords;
