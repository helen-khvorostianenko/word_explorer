import { useParams, Link} from "react-router";
import { useEffect, useState, useRef, use} from 'react';
import {
  isNetworkError,
  getNetworkErrorMessage,
  getGenericErrorMessage,
  getDictionaryErrorMessage,
  getDatamuseErrorMessage,
} from '../utils/errors.js';
import { buildDictionaryUrl, normalizeDictionary } from '../utils/dictionary.js';
import { getCategories, saveNote, saveWord } from "../api/api.js";

const TABS = [
  { key:'rel_syn', label: 'Synonyms' },
  { key:'rel_rhy', label: 'Rhymes' },
  { key:'ml', label: 'Means Like' },
  { key:'sp', label: 'Spelled Like' },
  { key:'sl', label: 'Sounds Like' },
];   
function buildDatamuseWordsUrl(tabKey, word) {
  const url = new URL('https://api.datamuse.com/words');
  url.searchParams.set(tabKey, word);
  url.searchParams.set('max', '20');
  return url.toString();
}

function WordPage() {
  const { word } = useParams();
  const [card, setCard] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [relatedStatus, setRelatedStatus] = useState('idle');
  const [relatedError, setRelatedError] = useState(null);
  const [relatedWords, setRelatedWords] = useState([]);
  const tabsControllerRef = useRef(null);
  const tabsCacheRef = useRef({});

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!word) return;

    async function load() {
      try {
        setStatus('loading');
        setError(null);
        setCard(null);

        const res = await fetch(buildDictionaryUrl(word));
        console.log(res);
        if (!res.ok) {
          throw new Error(getDictionaryErrorMessage(res.status, word));
        }

        const data = await res.json();
        const normalized = normalizeDictionary(data);
        if (!normalized) {
          throw new Error('No data for this word');
        }

        setCard(normalized);
        setStatus('success');
      } catch(e){
        setStatus('error');
        if (isNetworkError(e)) {
          setError(getNetworkErrorMessage());
        } else {
          setError(e.message || getGenericErrorMessage());
        }
      }
    }
    load();
  }, [word]);

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
    tabsControllerRef.current = controller

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
    }
  }, [word, activeTab]);

  useEffect(() => {
    async function loadCategories(params) {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 ){
        setSelectedCategory(data[0].id);  
      }    
    }
    loadCategories();
  }, []);

   
  return (
    <main>
      <div>
        <Link to="/">Home</Link>
      </div>

      {status === 'loading' && <p>Loading word…</p>}
      {status === 'error' && <p>{error}</p>}

      {status === 'success' && card && (
        <>
          <h1>{card.word}</h1>
          <div>
            <strong>IPA:</strong> {card.ipa || '—'}{' '}
            {card.audioUrl ? <audio controls src={card.audioUrl} /> : null}
          </div>
          <section>
            <h2>Definitions</h2>
            {card.definitionsByPos.length === 0 ? (
              <p>—</p>
            ) : (
              <div>
                {card.definitionsByPos.map((group) => (
                  <div key={group.partOfSpeech}>
                    <div>
                      <em>{group.partOfSpeech}</em>
                    </div>
                    <ol>
                      {group.definitions.map((def, idx) => (
                        <li key={`${group.partOfSpeech}-${idx}`}>{def}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </section>
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
                  <li key={item.word}>
                    <Link to={`/word/${encodeURIComponent(item.word)}`}>
                      {item.word}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2>Save word</h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            <button onClick={() => saveWord(word, selectedCategory)}>Save word</button>
          </section>
        </>
      )}
    </main>
  );
}

export default WordPage