import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CarDetailPage } from './pages/CarDetailPage';
import { BracketSetupPage } from './pages/BracketSetupPage';
import { BracketPlayPage } from './pages/BracketPlayPage';
import { BracketResultPage } from './pages/BracketResultPage';
import { GaragePage } from './pages/GaragePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="car/:id" element={<CarDetailPage />} />
          <Route path="bracket" element={<BracketSetupPage />} />
          <Route path="bracket/play" element={<BracketPlayPage />} />
          <Route path="bracket/result" element={<BracketResultPage />} />
          <Route path="garage" element={<GaragePage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
