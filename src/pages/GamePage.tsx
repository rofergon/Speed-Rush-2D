import React, { useEffect, useState } from 'react';
import { Leaderboard } from '../components/Leaderboard';
import { Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/unity.css';
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { web3Service } from '../services/web3Service';
import { activeCarService } from '../services/activeCarService';
import { Car } from '../types/car';

// Declare window type
declare global {
  interface Window {
    onLapTimesMinted: (lapTimesData: string) => void;
    RequestCarNFTImage: () => void;
  }
}

interface UnityInstance {
  SetFullscreen: (value: number) => void;
  SendMessage: (objectName: string, methodName: string, value: string) => void;
}

export function GamePage() {
  const { address, isConnected } = useAccount();
  const [unityInstance, setUnityInstance] = useState<UnityInstance | null>(null);
  const [unityLoaded, setUnityLoaded] = useState(false);
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [randomCars, setRandomCars] = useState<Car[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const navigate = useNavigate();

  // Función para cargar los carros del usuario
  const loadUserCars = async () => {
    try {
      if (!address) return;
      const cars = await web3Service.getUserCars(address);
      setUserCars(cars);
      // Seleccionar 7 carros aleatorios
      const shuffled = [...cars].sort(() => 0.5 - Math.random());
      setRandomCars(shuffled.slice(0, 7));
    } catch (error) {
      console.error('Error al cargar los carros:', error);
    }
  };

  // Cargar carros cuando el usuario se conecta
  useEffect(() => {
    if (isConnected && address) {
      loadUserCars();
    }
  }, [isConnected, address]);

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  useEffect(() => {
    if (!isConnected || !isGameStarted) {
      return; // Don't load Unity if not connected or game not started
    }

    // Verificar si hay un carro seleccionado
    const activeCar = activeCarService.getActiveCar();
    if (!activeCar) {
      navigate('/profile');
      return;
    }

    // Function that receives data from Unity
    window.onLapTimesMinted = (lapTimesData: string) => {
      // Split lap times
      const laps = lapTimesData.split('|').filter(lap => lap !== '');
      
      // Show in console
      console.log('Successful minting!');
      console.log('Lap times:');
      laps.forEach(lap => console.log(lap));

      alert('Successful minting!\n' + laps.join('\n'));
    };

    // Función para enviar la imagen del NFT a Unity
    const loadCarImage = async (instance: UnityInstance) => {
      try {
        const activeCar = activeCarService.getActiveCar();
        if (activeCar) {
          console.log("[Frontend] Enviando imagen del carro a Unity:", activeCar.carImageURI);
          try {
            const response = await fetch(activeCar.carImageURI);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const reader = new FileReader();
            
            reader.onloadend = () => {
              const base64data = (reader.result as string).split(',')[1];
              console.log("[Frontend] Imagen cargada, enviando a Unity, longitud:", base64data.length);
              instance.SendMessage('Car', 'OnImageReceived', base64data);

              // Enviar las estadísticas
              const stats = {
                speed: activeCar.combinedStats.speed,
                acceleration: activeCar.combinedStats.acceleration,
                handling: activeCar.combinedStats.handling,
                drift: activeCar.combinedStats.driftFactor,
                turn: activeCar.combinedStats.turnFactor,
                maxSpeed: activeCar.combinedStats.maxSpeed
              };
              instance.SendMessage('PreRaceCanvas', 'OnStatsReceived', JSON.stringify(stats));
            };
            
            reader.readAsDataURL(blob);
          } catch (error) {
            console.error('[Frontend] Error al cargar la imagen:', error);
          }
        } else {
          console.error("[Frontend] No hay carro activo");
        }
      } catch (error) {
        console.error('[Frontend] Error en loadCarImage:', error);
      }
    };

    window.RequestCarNFTImage = async () => {
      if (!unityInstance) {
        console.error("[Frontend] La instancia de Unity no está disponible");
        return;
      }
      await loadCarImage(unityInstance);
    };

    const loadUnityGame = async () => {
      const buildUrl = "Build";
      const loaderUrl = buildUrl + "/build.loader.js";
      const config = {
        dataUrl: buildUrl + "/build.data.br",
        frameworkUrl: buildUrl + "/build.framework.js.br",
        codeUrl: buildUrl + "/build.wasm.br",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "Saritu.eth gaming",
        productName: "Rush racing",
        productVersion: "1.0",
      };

      const script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = () => {
        // @ts-ignore
        createUnityInstance(document.querySelector("#unity-canvas"), config, (progress) => {
          const progressBar = document.querySelector("#unity-progress-bar-full");
          if (progressBar) {
            // @ts-ignore
            progressBar.style.width = 100 * progress + "%";
          }
        })
          .then((instance: UnityInstance) => {
            console.log("[Frontend] Unity inicializado correctamente");
            setUnityInstance(instance);
            setUnityLoaded(true);

            const loadingBar = document.querySelector("#unity-loading-bar") as HTMLElement;
            if (loadingBar) {
              loadingBar.style.display = "none";
            }
            const fullscreenButton = document.querySelector("#unity-fullscreen-button");
            if (fullscreenButton) {
              // @ts-ignore
              fullscreenButton.onclick = () => {
                instance.SetFullscreen(1);
              };
            }

            // Cargar la imagen después de que Unity esté completamente inicializado
            setTimeout(async () => {
              await loadCarImage(instance);
            }, 2000);
          })
          .catch((message: string) => {
            console.error("[Frontend] Error inicializando Unity:", message);
          });
      };

      document.body.appendChild(script);
    };

    loadUnityGame();

    return () => {
      const unityScript = document.querySelector('script[src*="build.loader.js"]');
      if (unityScript) {
        document.body.removeChild(unityScript);
      }
    };
  }, [isConnected, address, navigate, isGameStarted]);

  // Efecto para cargar la imagen cuando Unity esté listo
  useEffect(() => {
    if (unityLoaded && unityInstance) {
      window.RequestCarNFTImage();
    }
  }, [unityLoaded]);

  const handleCarLoaded = (car: Car) => {
    console.log('Car loaded:', car);
    if (unityInstance) {
      unityInstance.SendMessage(
        'Car',
        'SetCarStats',
        JSON.stringify({
          id: car.id,
          carImageURI: car.carImageURI,
          speed: car.combinedStats.speed,
          acceleration: car.combinedStats.acceleration,
          handling: car.combinedStats.handling
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-[95%] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <ConnectKitButton />
        </div>
        
        {!isConnected ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Conecta tu Wallet para Jugar</h2>
            <p className="text-gray-400 mb-8">Necesitas conectar tu wallet para acceder al juego</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="w-full bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4">Carro Seleccionado</h3>
              {activeCarService.getActiveCar() ? (
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden">
                    <img 
                      src={activeCarService.getActiveCar()?.carImageURI} 
                      alt="Carro seleccionado" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">ID: #{activeCarService.getActiveCar()?.id}</p>
                    <p className="text-gray-400">
                      Velocidad: {activeCarService.getActiveCar()?.combinedStats.speed || 0}
                    </p>
                    <p className="text-gray-400">
                      Aceleración: {activeCarService.getActiveCar()?.combinedStats.acceleration || 0}
                    </p>
                    <p className="text-gray-400">
                      Manejo: {activeCarService.getActiveCar()?.combinedStats.handling || 0}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No hay carro seleccionado</p>
              )}
            </div>

            <div className="w-full bg-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-4">Speed Rush 2D</h2>
              
              {!isGameStarted ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {randomCars.map((car) => (
                      <div 
                        key={car.id}
                        onClick={() => {
                          activeCarService.setActiveCar(car);
                          loadUserCars(); // Recargar los carros para actualizar la selección
                        }}
                        className={`cursor-pointer p-4 rounded-lg transition-all ${
                          activeCarService.getActiveCar()?.id === car.id 
                            ? 'bg-red-600' 
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <img 
                          src={car.carImageURI} 
                          alt={`Car ${car.id}`} 
                          className="w-full h-32 object-contain mb-2"
                        />
                        <div className="text-sm">
                          <p className="font-bold">Car #{car.id}</p>
                          <p>Velocidad: {car.combinedStats.speed}</p>
                          <p>Aceleración: {car.combinedStats.acceleration}</p>
                          <p>Manejo: {car.combinedStats.handling}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {activeCarService.getActiveCar() && (
                    <div className="text-center">
                      <button
                        onClick={handleStartGame}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                      >
                        Iniciar Carrera
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="unity-game-container">
                  <div id="unity-container" className="unity-desktop">
                    <canvas id="unity-canvas" width={1440} height={810} tabIndex={-1}></canvas>
                    <div id="unity-loading-bar">
                      <div id="unity-logo"></div>
                      <div id="unity-progress-bar-empty">
                        <div id="unity-progress-bar-full"></div>
                      </div>
                    </div>
                    <div id="unity-warning"> </div>
                    <div id="unity-footer">
                      <div id="unity-fullscreen-button"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="max-w-2xl mx-auto w-full">
              <Leaderboard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 