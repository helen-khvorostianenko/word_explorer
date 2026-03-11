import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  color: var(--text-muted);
  white-space: nowrap;
`;

const FormInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
  min-width: 220px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--blue);
  }
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
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

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 0.95rem;
  transition:
    border-color 0.2s,
    color 0.2s;

  &:hover {
    border-color: var(--blue);
    color: var(--text);
  }
`;

const FormError = styled.p`
  width: 100%;
  font-size: 0.85rem;
  color: var(--red, #c0392b);
  margin-top: 0.25rem;
`;

function CategoryForm({
  value,
  error,
  onSubmit,
  onChange,
  onCancel,
  submitLabel = 'Create',
}) {
  function handleKeyDown(e) {
    if (e.key === 'Escape') onCancel();
  }

  return (
    <Form onSubmit={onSubmit}>
      <FormLabel htmlFor="category-name">List name</FormLabel>
      <FormInput
        id="category-name"
        name="category-name"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Business English"
        autoFocus
      />
      <SubmitButton type="submit">{submitLabel}</SubmitButton>
      <CancelButton type="button" onClick={onCancel}>
        Cancel
      </CancelButton>
      {error && <FormError>{error}</FormError>}
    </Form>
  );
}

export default CategoryForm;
