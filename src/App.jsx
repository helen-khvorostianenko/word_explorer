import { Route, Routes, NavLink } from 'react-router';
import { useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import WordPage from './pages/WordPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import './App.css';

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/word/:word" element={<WordPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/categories/:id" element={<CategoryPage />} />
    </Routes>
  );
}

export default App;
