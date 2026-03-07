import { useParams, Link} from "react-router";
import { useEffect, useState, useRef} from 'react';
import {
  isNetworkError,
  getNetworkErrorMessage,
  getGenericErrorMessage,
  getDictionaryErrorMessage,
  getDatamuseErrorMessage,
} from '../utils/errors.js';
import { buildDictionaryUrl, normalizeDictionary } from '../utils/dictionary.js';
import { buildDatamuseWordsUrl } from '../utils/datamuse.js';
import {
  getCategories,
  getWord,
  saveWord,
  updatedWordCategory,
  saveNote,
  getNote,
  updateNote,
  deleteNote,
} from '../api/api.js';

const TABS = [
  { key:'rel_syn', label: 'Synonyms' },
  { key:'rel_rhy', label: 'Rhymes' },
  { key:'ml', label: 'Means Like' },
  { key:'sp', label: 'Spelled Like' },
  { key:'sl', label: 'Sounds Like' },
];   

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

  const [serverStatus, setServerStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [savedWordData, setSavedWord] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [note, setNote] = useState('');
  const [noteStatus, setNoteStatus] = useState('idle'); 
  const [noteId, setNoteId] = useState(null);
  const noteTimeoutRef = useRef(null);
  const isNoteInitialLoad = useRef(true);

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
    setActiveTab(TABS[0].key);

    setNote('');
    setNoteId(null);
    setNoteStatus('idle');
    isNoteInitialLoad.current = true;
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

  useEffect(() => {
    if (!savedWordData) return;

    async function loadNote() {
      try {
        const data = await getNote(word);
        if (data) {
          setNote(data.text);
          setNoteId(data.id);
        }
      } catch {
      } finally {
        isNoteInitialLoad.current = false;
      }
    }
    loadNote();
  }, [savedWordData]);

  useEffect(() => {
    if ( isNoteInitialLoad.current) return;
    if (!noteId && !note.trim()) return;

    clearTimeout(noteTimeoutRef.current);
    setNoteStatus("saving");

    noteTimeoutRef.current = setTimeout(async () => {
      try {
        let data;
        if (!noteId) {
          data = await saveNote(word, note);
          setNoteId(data.id);
        } else {
          await updateNote(noteId, note);
        }
        setNoteStatus('saved');
      } catch {
        setNoteStatus('error');
      }
    }, 800);

    return () => clearTimeout(noteTimeoutRef.current);
  }, [note]);

  async function handleDeleteNote() {
    if (!noteId) return;

    await deleteNote(noteId);

    setNote('');
    setNoteId(null);
    setNoteStatus('idle');
  }

  function renderNoteStatus(status) {
    switch (status) {
      case 'saving':
        return <p>Saving…</p>;
      case 'saved':
        return <p>✓ Saved</p>;
      case 'error':
        return <p>Failed to save note</p>;
      default:
        return null;
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
                  <li key={`${item.word}-${activeTab}`}>
                    <Link to={`/word/${encodeURIComponent(item.word)}`}>
                      {item.word}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
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
          {savedWordData && (
            <section>
              <h2>Notes</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your note..."
                rows={4}
              />
              {noteId && (
                <button onClick={handleDeleteNote}>Delete note</button>
              )}
              {renderNoteStatus(noteStatus)}
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default WordPage