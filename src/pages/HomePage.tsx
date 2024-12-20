import React from 'react';
import { Gamepad2, Car, Trophy, Users, ChevronRight, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  const goToGame = () => {
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&q=80"
            alt="Racing background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-600">
              Speed Rush 2D
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Experience the thrill of high-speed racing in this action-packed 2D adventure
            </p>
            <button 
              onClick={goToGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Jugar Ahora</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Características del Juego</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Car />}
              title="Múltiples Autos"
              description="Elige entre una variedad de vehículos únicos, cada uno con sus propias características"
            />
            <FeatureCard 
              icon={<Trophy />}
              title="Carreras Competitivas"
              description="Compite en carreras intensas y sube en las tablas de clasificación globales"
            />
            <FeatureCard 
              icon={<Users />}
              title="Multijugador"
              description="Compite contra amigos o desafía a jugadores de todo el mundo"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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