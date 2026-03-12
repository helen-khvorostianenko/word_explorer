# Word Explorer

A vocabulary learning app for English learners. Search any word to get its definition, IPA transcription, audio pronunciation, and related words — synonyms, rhymes, and more. Save words to personal lists, add notes, and come back to review them whenever you're ready.

Built as a final project for the [Code the Dream](https://codethedream.org) curriculum.

---

## Features

- Word search with autocomplete (debounced, cached, cancellable)
- Word definitions with IPA transcription and audio pronunciation
- Related words — synonyms, rhymes, means like, spelled like, sounds like
- Personal word lists (create, rename, delete)
- Save words to lists, move between lists
- Notes per word with autosave

---

## Tech Stack

- [React](https://react.dev) — UI library
- [React Router](https://reactrouter.com) — client-side routing
- [Vite](https://vitejs.dev) — build tool
- [styled-components](https://styled-components.com) — component-level styling
- [json-server](https://github.com/typicode/json-server) — local REST API for persisting words, lists, and notes
- [nanoid](https://github.com/ai/nanoid) — unique ID generation
- [react-icons](https://react-icons.github.io/react-icons/) — icon library

---

## APIs

- [Datamuse API](https://www.datamuse.com/api/) — word search autocomplete and related words. No API key required, open for anonymous use.
- [Free Dictionary API](https://dictionaryapi.dev/) — word definitions, IPA transcription, and audio pronunciation. No API key required.

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd word_explorer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Initialize the database

```bash
npm run db:reset
```

This copies `db.seed.json` into `db.json` which is used by json-server.

### 5. Start the local API server

```bash
npm run server
```

The API will be available at `http://localhost:3001`.

### 6. Start the development server

In a separate terminal:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run server` | Start json-server on port 3001 |
| `npm run db:reset` | Reset database to seed data |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |