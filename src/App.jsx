import { Route, Routes} from 'react-router';
import HomePage from './pages/HomePage.jsx';
import WordPage from './pages/WordPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

import './App.css';

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categories/:id" element={<CategoryPage />} />
      <Route path="/word/:word" element={<WordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
