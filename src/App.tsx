import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { Web3Provider } from './providers/Web3Provider';
import { Background } from './components/Background';

function App() {
  return (
    <>
      <Background />
      <Web3Provider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
          </Routes>
        </Router>
      </Web3Provider>
    </>
  );
}

export default App;