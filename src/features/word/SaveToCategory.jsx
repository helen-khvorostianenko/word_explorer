import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { saveWord, updateWordCategory } from '../../api/api.js';

const Section = styled.section``;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--navy);
  border-left: 3px solid var(--gold);
  padding-left: 0.6rem;
  margin-bottom: 0.5rem;
`;

const SubText = styled.p`
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;

  strong {
    color: var(--navy);
  }
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--blue);
  }
`;

const SaveButton = styled.button`
  padding: 0.5rem 1.1rem;
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.95rem;
  transition:
    background 0.2s,
    opacity 0.2s;

  &:hover:not(:disabled) {
    background: var(--navy-light);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const HintText = styled.p`
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.6rem;
`;

const SuccessText = styled.p`
  font-size: 0.85rem;
  color: var(--blue);
  margin-top: 0.6rem;
`;

const ErrorText = styled.p`
  font-size: 0.85rem;
  color: var(--red, #c0392b);
  margin-top: 0.6rem;
`;

function SaveToCategory({ word, categories, savedWordData, onSave }) {
  const [selectedCategory, setSelectedCategory] = useState(
    savedWordData?.categoryId || ''
  );
  const [saveMessage, setSaveMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setSelectedCategory(savedWordData?.categoryId || '');
  }, [savedWordData, word]);

  async function handleSaveWord() {
    if (!selectedCategory) return;

    try {
      let data;
      if (!savedWordData) {
        data = await saveWord(word, selectedCategory);
      } else {
        data = await updateWordCategory(savedWordData.id, selectedCategory);
      }
      onSave(data);

      const categoryName =
        categories.find((cat) => cat.id === selectedCategory)?.name || '';
      setIsError(false);
      setSaveMessage(`✓ Saved to: ${categoryName}`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setIsError(true);
      setSaveMessage('Failed to save word.');
    }
  }

  const savedCategoryName = categories.find(
    (cat) => cat.id === savedWordData?.categoryId
  )?.name;

  const isCategoryChanged = savedWordData
    ? !!selectedCategory && selectedCategory !== savedWordData.categoryId
    : !!selectedCategory;

  return (
    <Section>
      <SectionTitle>
        {savedWordData ? 'Saved in your list' : 'Save to your list'}
      </SectionTitle>

      <SubText>
        {savedWordData ? (
          <>
            This word is saved in <strong>{savedCategoryName}</strong>. You can
            move it to a different list below.
          </>
        ) : (
          'Select a list to save this word.'
        )}
      </SubText>

      <ControlRow>
        <Select
          id="category"
          name="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select a list</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <SaveButton
          onClick={handleSaveWord}
          disabled={!selectedCategory || !isCategoryChanged}
          title={!selectedCategory ? 'Select a list first' : ''}
        >
          {savedWordData ? 'Move to list' : 'Save word'}
        </SaveButton>
      </ControlRow>

      {isCategoryChanged && !saveMessage && (
        <HintText>
          Click <strong>{savedWordData ? 'Move to list' : 'Save word'}</strong>{' '}
          to confirm.
        </HintText>
      )}
      {saveMessage &&
        (isError ? (
          <ErrorText>{saveMessage}</ErrorText>
        ) : (
          <SuccessText>{saveMessage}</SuccessText>
        ))}
    </Section>
  );
}

export default SaveToCategory;
