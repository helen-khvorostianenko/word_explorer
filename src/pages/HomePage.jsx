import { useEffect, useState, useCallback} from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import PageLayout from '../shared/PageLayout.jsx';
import SearchBar from '../shared/SearchBar.jsx';
import CategoryForm from '../features/categories/CategoryForm.jsx';
import { createCategory, getAllWords, getCategories } from '../api/api.js';
import { getGenericErrorMessage, getNetworkErrorMessage, isNetworkError } from '../utils/errors.js';
import { PiBooks, PiPlusBold } from 'react-icons/pi';

const PREVIEW_WORDS_COUNT = 3;
const PAGE_SIZE = 8;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: var(--navy);
  margin-bottom: 1.5rem;
`;

const Section = styled.section`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--navy);
  border-left: 3px solid var(--gold);
  padding-left: 0.6rem;
  margin-bottom: 1.25rem;
`;

const StatusMessage = styled.p`
  color: var(--text-muted);
  font-size: 0.95rem;
`;

const ErrorMessage = styled.p`
  color: var(--red, #c0392b);
  font-size: 0.95rem;
`;

const CategoryGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
  align-items: start;
`;

const CategoryGridItem = styled.li`
  list-style: none;
`;

const CategoryCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: var(--blue);
    box-shadow: var(--shadow-md);
  }
`;

const CardTitle = styled(Link)`
  font-size: 1rem;
  font-weight: bold;
  color: var(--navy);
  margin-bottom: 0.75rem;
  transition: color 0.2s;

  &:hover {
    color: var(--blue);
  }
`;

const CardWordList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem;
`;

const CardWordItem = styled.li`
  font-size: 0.88rem;
  color: var(--text-muted);
  padding: 0.1rem 0;

  a {
    color: inherit;
    transition: color 0.2s;

    &:hover {
      color: var(--blue);
    }
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
`;

const CardMoreLink = styled(Link)`
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: color 0.2s;

  &:hover {
    color: var(--blue);
  }
`;

const CardWordCount = styled(Link)`
  font-size: 0.85rem;
  color: var(--gold);
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  &:hover {
    color: var(--blue);
  }
`;

const CardEmptyText = styled.p`
  font-size: 0.88rem;
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 0.75rem;
  opacity: 0.7;
`;

const CardMoreText = styled.p`
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PaginationInfo = styled.span`
  font-size: 0.9rem;
  color: var(--text-muted);
`;

const PaginationButton = styled.button`
  padding: 0.35rem 0.9rem;
  background: var(--surface);
  color: var(--navy);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;

  &:hover:not(:disabled) {
    border-color: var(--blue);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const AddListButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.25rem;
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;

  &:hover {
    background: var(--navy-light);
  }
`;


function HomePage() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState(null);

  const [allWords, setAllWords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function load() {
      try{
        setStatus('loading');
        setError(null);
        const [cats, words] = await Promise.all([getCategories(), getAllWords()]);
        setCategories(cats);
        setAllWords(words);
        setStatus('success');
      } catch (e) {
        setStatus('error');
        setError(isNetworkError(e) 
          ? getNetworkErrorMessage() 
          : e.message || getGenericErrorMessage()
        );
      }
      
    }
    load();
  }, []);

  function handleChange(e) {
    setNewName(e.target.value);
  }
  
  function handleCancel(){
    setIsCreating(false);
    setNewName('');
    setCreateError(null);
  }
  
  async function handleCreate(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setCreateError('Name cannot be empty.');
      return;
    }
    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setCreateError('A list with this name already exists.');
      return;
    }

    try {
      setCreateError(null);
      const created = await createCategory(trimmed);
      setCategories((prev) => [...prev, created]);
      setNewName('');
      setIsCreating(false);
    } catch (e) {
      setCreateError(
        isNetworkError(e)
          ? getNetworkErrorMessage()
          : e.message || getGenericErrorMessage()
      );
    }
  }

  function getPreviewWords(catId) {
    return allWords
      .filter((word) => word.categoryId === catId)
      .slice(0, PREVIEW_WORDS_COUNT);
  }

  const totalPages = Math.ceil(categories.length / PAGE_SIZE);
  
  const getPagedCategories = useCallback(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, currentPage]);

  const handlePrev = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }, [totalPages]);

  return (
    <PageLayout>
      <PageTitle>Word Explorer</PageTitle>
      <SearchBar savedWords={allWords} categories={categories} />
      <Section>
        <SectionTitle>Your lists</SectionTitle>
        {status === 'loading' && <StatusMessage>Loading...</StatusMessage>}
        {status === 'error' && <ErrorMessage>{error}</ErrorMessage>}
        {status === 'success' && (
          <>
            {categories.length === 0 && !isCreating && (
              <StatusMessage>
                No lists yet. Create your first one!
              </StatusMessage>
            )}
            <CategoryGrid>
              {getPagedCategories().map((cat) => {
                const preview = getPreviewWords(cat.id);
                const wordCount = allWords.filter(
                  (w) => w.categoryId === cat.id
                ).length;

                return (
                  <CategoryGridItem key={cat.id}>
                    <CategoryCard>
                      <CardTitle to={`/categories/${cat.id}`}>
                        {cat.name}
                      </CardTitle>

                      {preview.length > 0 ? (
                        <CardWordList>
                          {preview.map((word) => (
                            <CardWordItem key={word.id}>
                              <Link
                                to={`/word/${encodeURIComponent(word.text)}`}
                              >
                                {word.text}
                              </Link>
                            </CardWordItem>
                          ))}
                        </CardWordList>
                      ) : (
                        <CardEmptyText>No words yet</CardEmptyText>
                      )}

                      <CardFooter>
                        <CardMoreLink to={`/categories/${cat.id}`}>
                          {wordCount > PREVIEW_WORDS_COUNT
                            ? `+${wordCount - PREVIEW_WORDS_COUNT} more`
                            : null}
                        </CardMoreLink>
                        {wordCount > 0 && (
                          <CardWordCount to={`/categories/${cat.id}`}>
                            <PiBooks size={15} />
                            {wordCount}
                          </CardWordCount>
                        )}
                      </CardFooter>
                    </CategoryCard>
                  </CategoryGridItem>
                );
              })}
            </CategoryGrid>

            {totalPages > 1 && (
              <Pagination>
                <PaginationButton
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  Prev
                </PaginationButton>
                <PaginationInfo>
                  {currentPage} / {totalPages}
                </PaginationInfo>
                <PaginationButton
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </PaginationButton>
              </Pagination>
            )}

            {isCreating ? (
              <CategoryForm
                value={newName}
                error={createError}
                onSubmit={handleCreate}
                onChange={handleChange}
                onCancel={handleCancel}
              />
            ) : (
              <AddListButton onClick={() => setIsCreating(true)}>
                <PiPlusBold size={15} />
                New List
              </AddListButton>
            )}
          </>
        )}
      </Section>
    </PageLayout>
  );
}
export default HomePage;