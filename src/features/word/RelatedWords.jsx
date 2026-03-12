import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
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

const Section = styled.section``;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--navy);
  border-left: 3px solid var(--gold);
  padding-left: 0.6rem;
  margin-bottom: 1rem;
`;

const TabRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const TabButton = styled.button`
  padding: 0.35rem 0.9rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;

  background: ${({ $active }) => ($active ? 'var(--navy)' : 'var(--surface)')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--text-muted)')};
  border: 1px solid
    ${({ $active }) => ($active ? 'var(--navy)' : 'var(--border)')};

  &:hover:not(:disabled) {
    border-color: var(--blue);
    color: ${({ $active }) => ($active ? '#fff' : 'var(--text)')};
  }

  &:disabled {
    cursor: default;
  }
`;

const WordCloud = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
`;

const WordPill = styled.li`
  a {
    display: inline-block;
    padding: 0.3rem 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    font-size: 0.9rem;
    color: var(--navy);
    box-shadow: var(--shadow);
    transition:
      border-color 0.2s,
      color 0.2s,
      background 0.2s;

    &:hover {
      border-color: var(--blue);
      color: var(--blue);
      background: color-mix(in srgb, var(--blue) 6%, var(--surface));
    }
  }
`;

const StatusText = styled.p`
  color: var(--text-muted);
  font-size: 0.95rem;
`;

const ErrorText = styled.p`
  color: var(--red, #c0392b);
  font-size: 0.95rem;
`;

function RelatedWords({ word }) {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [relatedStatus, setRelatedStatus] = useState('idle');
  const [relatedError, setRelatedError] = useState(null);
  const [relatedWords, setRelatedWords] = useState([]);

  const tabsControllerRef = useRef(null);
  const tabsCacheRef = useRef({});
  const autoSwitchAttemptsRef = useRef(0);

  useEffect(() => {
    setActiveTab(TABS[0].key);
    autoSwitchAttemptsRef.current = 0;
  }, [word]);

  useEffect(() => {
    if (
      relatedStatus === 'success' &&
      relatedWords.length === 0 &&
      autoSwitchAttemptsRef.current < TABS.length - 1
    ) {
      const currentIndex = TABS.findIndex((tab) => tab.key === activeTab);
      const nextIndex = (currentIndex + 1) % TABS.length;
      autoSwitchAttemptsRef.current += 1;
      setActiveTab(TABS[nextIndex].key);
    }
  }, [relatedStatus, relatedWords, activeTab]);

  useEffect(() => {
    if (!word) return;

    const cacheKey = `${activeTab}-${word}`.toLowerCase();
    if (tabsCacheRef.current[cacheKey]) {
      setRelatedWords(tabsCacheRef.current[cacheKey]);
      setRelatedStatus('success');
      setRelatedError(null);
      return;
    }

    if (tabsControllerRef.current) tabsControllerRef.current.abort();
    const controller = new AbortController();
    tabsControllerRef.current = controller;

    async function loadRelated() {
      try {
        setRelatedStatus('loading');
        setRelatedError(null);
        if (!tabsCacheRef.current[cacheKey]) setRelatedWords([]);

        const res = await fetch(buildDatamuseWordsUrl(activeTab, word), {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(getDatamuseErrorMessage(res.status));

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
    return () => controller.abort();
  }, [word, activeTab]);

  function handleTabClick(key) {
    autoSwitchAttemptsRef.current = TABS.length;
    setActiveTab(key);
  }

  return (
    <Section>
      <SectionTitle>Explore</SectionTitle>

      <TabRow>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            type="button"
            $active={activeTab === tab.key}
            onClick={() => handleTabClick(tab.key)}
            disabled={activeTab === tab.key}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabRow>

      {relatedStatus === 'loading' && <StatusText>Loading…</StatusText>}
      {relatedStatus === 'error' && <ErrorText>{relatedError}</ErrorText>}
      {relatedStatus === 'success' && relatedWords.length === 0 && (
        <StatusText>No results.</StatusText>
      )}
      {relatedWords.length > 0 && (
        <WordCloud>
          {relatedWords.map((item) => (
            <WordPill key={`${item.word}-${activeTab}`}>
              <Link to={`/word/${encodeURIComponent(item.word)}`}>
                {item.word}
              </Link>
            </WordPill>
          ))}
        </WordCloud>
      )}
    </Section>
  );
}

export default RelatedWords;
