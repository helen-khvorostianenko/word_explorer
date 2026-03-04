import { useParams, Link} from "react-router";
import { useEffect, useState } from 'react';
import {isNetworkError, getNetworkErrorMessage, getGenericErrorMessage, getDictionaryErrorMessage,} from '../utils/errors.js';
import { buildDictionaryUrl, normalizeDictionary } from '../utils/dictionary.js';

function WordPage() {
  const { word } = useParams();
  const [card, setCard] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState(null);

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
        </>
      )}
    </main>
  );
}

export default WordPage