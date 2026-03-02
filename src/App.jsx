import { Route, Routes, NavLink } from 'react-router';
import { useState } from 'react';
import HomePage from './pages/HomePage.jsx';
import WordPage from './pages/WordPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import './App.css';

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/word/:term" element={<WordPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
