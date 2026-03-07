import { useParams, Link} from "react-router";
import { useEffect, useState, useRef} from 'react';
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
  saveWord,
  updatedWordCategory,
} from '../api/api.js';

import Note from '../features/word/Note.jsx'
import WordDefinition from '../features/word/WordDefinition.jsx';
import RelatedWords from "../features/word/RelatedWords.jsx";

function WordPage() {
  const { word } = useParams();
  const [card, setCard] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState(null);

  
  const [serverStatus, setServerStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [savedWordData, setSavedWord] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

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

        const [cats, data] = await Promise.all([
          getCategories(),
          getWord(word),
        ]);

        setCategories(cats);

        if (data) {
          setSavedWord(data);
          setSelectedCategory(data.categoryId || '');
        } else {
          setSavedWord(null);
          setSelectedCategory('');
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

  async function handleSaveWord() {
    if (!selectedCategory) return; 
    try {
      let data;
      if (!savedWordData) {
        data = await saveWord(word, selectedCategory);
      } else {
        data = await updatedWordCategory(word, selectedCategory);
      }
      setSavedWord(data);

      const categoryName = categories.find((cat) => cat.id === selectedCategory)?.name || '';
      setSaveMessage(`✓ Saved to : ${categoryName}`);
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (e) {
       setSaveMessage("Failed to save word.");
    }
  }

  const savedCategoryName = categories.find((cat) => cat.id === savedWordData?.categoryId)?.name;
  const isCategoryChanged = savedWordData
    ? !!selectedCategory && selectedCategory !== savedWordData.categoryId
    : !!selectedCategory; 
  return (
    <main>
      <div>
        <Link to="/">Home</Link>
      </div>

      {status === 'loading' && <p>Loading word…</p>}
      {status === 'error' && <p>{error}</p>}

      {status === 'success' && card && (
        <>
          <WordDefinition card={card} />
          <RelatedWords word={word} />
          <section>
            {serverStatus === 'loading' && <p>Loading your word…</p>}
            {serverStatus === 'error' && (
              <p>Could not load your word: {serverError}</p>
            )}
            {serverStatus === 'success' && (
              <>
                {!savedWordData && (
                  <>
                    <h2>Save the word into your list</h2>
                    <p>Select a category to save this word.</p>
                  </>
                )}
                {savedWordData && (
                  <>
                    <h2>Saved in your list</h2>
                    <p>
                      This word is saved in <strong>{savedCategoryName}</strong>
                    </p>
                  </>
                )}
                <p>Category:</p>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSaveWord}
                  disabled={!selectedCategory || !isCategoryChanged}
                  title={!selectedCategory ? 'Select a category first' : ''}
                >
                  {!savedWordData ? 'Save category' : 'Update category'}
                </button>
                {isCategoryChanged && (
                  <p>
                    Category changed. Click{' '}
                    <strong>
                      {!savedWordData ? 'Save' : 'Update'} category
                    </strong>{' '}
                    to save.
                  </p>
                )}
                {saveMessage && <p>{saveMessage}</p>}
              </>
            )}
          </section>
          {savedWordData && <Note word={word} savedWordData={savedWordData} />}
        </>
      )}
    </main>
  );
}

export default WordPage;