function CategoryForm({
  value,
  error,
  onSubmit,
  onChange,
  onCancel,
  submitLabel = 'Create'
}) {
  function handleKeyDown(e) {
    if (e.key === 'Escape') onCancel();
  }
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="category-name">List name</label>
      <input
        id="category-name"
        name="category-name"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Business English"
        autoFocus
      />
      <button type="submit">{submitLabel}</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}

export default CategoryForm;