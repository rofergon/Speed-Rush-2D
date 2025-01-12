import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { XionProvider } from './providers/XionProvider';
import { Background } from './components/Background';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Background />
      <XionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </XionProvider>
    </>
  );
}

export default App;