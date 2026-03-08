import { useParams} from "react-router";
import { useEffect, useState} from 'react';
import Note from '../features/word/Note.jsx';
import WordDefinition from '../features/word/WordDefinition.jsx';
import RelatedWords from '../features/word/RelatedWords.jsx';
import SaveToCategory from '../features/word/SaveToCategory.jsx';
import SearchBar from '../shared/SearchBar.jsx';
import PageLayout from '../shared/PageLayout.jsx';
import {
  isNetworkError,
  getNetworkErrorMessage,
  getGenericErrorMessage,
  getDictionaryErrorMessage,
} from '../utils/errors.js';
import { buildDictionaryUrl, normalizeDictionary } from '../utils/dictionary.js';
import {
  getCategories,
  getWord,
} from '../api/api.js';

function WordPage() {
  const { word } = useParams();
  const [card, setCard] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState(null);

  const [serverStatus, setServerStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [savedWordData, setSavedWord] = useState(null);
   
  useEffect(() => {
    if (!word) return;

    async function load() {
      try {
        setStatus('loading');
        setError(null);
        setCard(null);

        const res = await fetch(buildDictionaryUrl(word));
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
    async function loadWordData() {
      try {
        setServerStatus('loading');
        setServerError(null);
        setSavedWord(null);

        const [cats, data] = await Promise.all([
          getCategories(),
          getWord(word),
        ]);

        setCategories(cats);

        if (data) {
          setSavedWord(data);
        } else {
          setSavedWord(null);
        }

        setServerStatus('success');
      } catch (e) {
        setServerStatus('error');
        setServerError(
          isNetworkError(e)
            ? getNetworkErrorMessage()
            : e.message || getGenericErrorMessage()
        );
      }
    }
    loadWordData();
  }, [word]);
  
  return (
    <PageLayout>
      <div>
        <SearchBar />
      </div>
      {status === 'loading' && <p>Loading word…</p>}
      {status === 'error' && <p>{error}</p>}

      {status === 'success' && card && (
        <>
          <WordDefinition card={card} />
          <RelatedWords word={word} />
          {serverStatus === 'loading' && <p>Loading your word…</p>}
          {serverStatus === 'error' && (
            <p>Could not load your word: {serverError}</p>
          )}
          {serverStatus === 'success' && (
            <SaveToCategory
              word={word}
              categories={categories}
              savedWordData={savedWordData}
              onSave={setSavedWord}
            />
          )}
          {savedWordData && <Note wordId={savedWordData.id} />}
        </>
      )}
    </PageLayout>
  );
}

export default WordPage;