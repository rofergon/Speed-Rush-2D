import React from 'react';
import { Gamepad2, Car, Trophy, Users, ChevronRight, Github, Wrench } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import { XionConnectButton } from '../components/XionConnectButton';
import { GameInfo } from '../components/GameInfo';
import { MintCarButton } from '../components/MintCarButton';
import { GetMintPriceButton } from '../components/GetMintPriceButton';

export function HomePage() {
  const navigate = useNavigate();
  const { data: account } = useAbstraxionAccount();

  const goToGame = () => {
    navigate('/game');
  };

  const goToGarage = () => {
    navigate('/profile');
  };

  const goToMarketplace = () => {
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-[98%] mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold">Speed Rush 2D</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/game" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                <Gamepad2 className="inline-block w-5 h-5 mr-1" />
                Play
              </Link>
              <Link to="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                <Wrench className="inline-block w-5 h-5 mr-1" />
                Garage
              </Link>
              <Link to="/marketplace" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                <Car className="inline-block w-5 h-5 mr-1" />
                Market
              </Link>
              <XionConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/backgroun1.png"
            alt="Racing background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/90"></div>
        </div>
        
        <div className="relative max-w-[98%] mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 relative">
              <span className="absolute inset-0 text-white [text-shadow:_6px_6px_0_rgb(255_255_255),_-6px_-6px_0_rgb(255_255_255),_6px_-6px_0_rgb(255_255_255),_-6px_6px_0_rgb(255_255_255),_6px_0_0_rgb(255_255_255),_-6px_0_0_rgb(255_255_255),_0_6px_0_rgb(255_255_255),_0_-6px_0_rgb(255_255_255),_4px_4px_0_rgb(255_255_255),_-4px_-4px_0_rgb(255_255_255),_4px_-4px_0_rgb(255_255_255),_-4px_4px_0_rgb(255_255_255)]">
                Speed Rush 2D
              </span>
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-pulse drop-shadow-[0_0_25px_rgba(234,179,8,0.3)]">
                Speed Rush 2D
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Experience the thrill of high-speed racing in this action-packed 2D adventure
            </p>
            <div className="flex flex-col items-center space-y-4">
              <XionConnectButton />
              {account.bech32Address && (
                <>
                  <GameInfo />
                  <div className="flex space-x-4">
                    <button 
                      onClick={goToGame}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105"
                    >
                      <Gamepad2 className="w-5 h-5" />
                      <span>Play Now</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={goToGarage}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105"
                    >
                      <Wrench className="w-5 h-5" />
                      <span>My Garage</span>
                    </button>
                    <button 
                      onClick={goToMarketplace}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105"
                    >
                      <Car className="w-5 h-5" />
                      <span>Marketplace</span>
                    </button>
                    <div className="flex space-x-2">
                      <GetMintPriceButton />
                      <MintCarButton />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-[98%] mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Game Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Car />}
              title="NFT Cars"
              description="Each car is a unique NFT with special characteristics and customizable parts"
            />
            <FeatureCard 
              icon={<Trophy />}
              title="Blockchain Competition"
              description="Your race results are recorded on the Lens network as NFTs with seasonal rewards"
            />
            <FeatureCard 
              icon={<Users />}
              title="Repair System"
              description="Keep your car in optimal condition at the workshop using GRASS tokens"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8">
        <div className="max-w-[98%] mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">© 2024 Speed Rush 2D. All rights reserved.</p>
            <a href="https://github.com" className="text-gray-400 hover:text-white">
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-gray-700 p-6 rounded-lg text-center hover:bg-gray-600 transition-colors">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
} 