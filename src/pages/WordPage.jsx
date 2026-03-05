import { useParams, Link} from "react-router";
import { useEffect, useState } from 'react';
import {isNetworkError, getNetworkErrorMessage, getGenericErrorMessage, getDictionaryErrorMessage,} from '../utils/errors.js';
import { buildDictionaryUrl, normalizeDictionary } from '../utils/dictionary.js';

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
    if (!word) return;

    async function loadRelated() {
      try {
        setRelatedStatus('loading');
        setRelatedError(null);
        setRelatedWords([]);

        const res = await fetch(buildDatamuseWordsUrl(activeTab, word));

        if (!res.ok) {
          throw new Error(getDatamuseErrorMessage(res.status));
        }

        const data = await res.json();
        const results = Array.isArray(data) ? data : [];
        setRelatedWords(results);
        setRelatedStatus('success');
      } catch (e) {
        setRelatedStatus('error');
        if (isNetworkError(e)) setRelatedError(getNetworkErrorMessage());
        else setRelatedError(e.message || getGenericErrorMessage());
      }
    }

    loadRelated();
  }, [word, activeTab]);

   
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
                  <li key={item.word}>{item.word}</li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default WordPage