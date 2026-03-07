import { useState, useEffect } from 'react';
import { saveWord, updateWordCategory } from '../../api/api.js';

function SaveToCategory({ word, categories, savedWordData, onSave }) {
  const [selectedCategory, setSelectedCategory] = useState(
    savedWordData?.categoryId || ''
  );
  const [saveMessage, setSaveMessage] = useState('');

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
      setSaveMessage(`✓ Saved to : ${categoryName}`);
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (e) {
      setSaveMessage('Failed to save word.');
    }
  }

  const savedCategoryName = categories.find(
    (cat) => cat.id === savedWordData?.categoryId
  )?.name;
  const isCategoryChanged = savedWordData
    ? !!selectedCategory && selectedCategory !== savedWordData.categoryId
    : !!selectedCategory;

    console.log('savedWordData:', savedWordData, 'word:', word);
  return (
    <section>
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
          <strong>{!savedWordData ? 'Save' : 'Update'} category</strong> to
          save.
        </p>
      )}
      {saveMessage && <p>{saveMessage}</p>}
    </section>
  );
}

export default SaveToCategory;
