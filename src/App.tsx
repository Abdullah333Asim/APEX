import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CarDetailPage } from './pages/CarDetailPage';
import { BracketSetupPage } from './pages/BracketSetupPage';
import { BracketPlayPage } from './pages/BracketPlayPage';
import { BracketResultPage } from './pages/BracketResultPage';
import { GaragePage } from './pages/GaragePage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="car/:id" element={<CarDetailPage />} />
            <Route path="bracket" element={<BracketSetupPage />} />
            <Route path="bracket/play" element={<BracketPlayPage />} />
            {/* :championId enables shareable links */}
            <Route path="bracket/result/:championId" element={<BracketResultPage />} />
            {/* Legacy no-param route — redirects to setup */}
            <Route path="bracket/result" element={<BracketResultPage />} />
            <Route path="garage" element={<GaragePage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  );
};

export default App;
