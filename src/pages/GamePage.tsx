import React, { useEffect, useState } from 'react';
import { Leaderboard } from '../components/Leaderboard';
import { Home, Gamepad2, Car as CarIcon, Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/unity.css';
import { useAbstraxionAccount, useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { XionConnectButton } from '../components/XionConnectButton';
import { web3Service } from '../services/web3Service';
import { activeCarService } from '../services/activeCarService';
import type { Car } from '../types/car';
import { ethers } from 'ethers';

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
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const [unityInstance, setUnityInstance] = useState<UnityInstance | null>(null);
  const [unityLoaded, setUnityLoaded] = useState(false);
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [randomCars, setRandomCars] = useState<Car[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isAlternativeSkin, setIsAlternativeSkin] = useState(false);
  const navigate = useNavigate();

  // Función para cargar los carros del usuario
  const loadUserCars = async () => {
    try {
      if (!account.bech32Address) return;
      const cars = await web3Service.getUserCars(account.bech32Address);
      setUserCars(cars);
      // Seleccionar 7 carros aleatorios
      const shuffled = [...cars].sort(() => 0.5 - Math.random());
      setRandomCars(shuffled.slice(0, 7));
    } catch (error) {
      console.error('Error al cargar los carros:', error);
    }
  };

  // Función para enviar la imagen del NFT a Unity
  const loadCarImage = async (instance: UnityInstance) => {
    try {
      const activeCar = activeCarService.getActiveCar();
      if (activeCar) {
        // Usar displayImageURI si existe, de lo contrario usar la lógica de skin
        const imageUrl = activeCar.displayImageURI || (isAlternativeSkin ? activeCar.parts[2]?.imageURI : activeCar.carImageURI);
        console.log("[Frontend] Enviando imagen del carro a Unity:", imageUrl);
        try {
          const response = await fetch(imageUrl);
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

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  // Cargar carros cuando el usuario se conecta
  useEffect(() => {
    if (client && account.bech32Address) {
      loadUserCars();
    }
  }, [client, account.bech32Address]);

  // Efecto para recargar la imagen cuando cambie la skin
  useEffect(() => {
    if (unityLoaded && unityInstance) {
      loadCarImage(unityInstance);
    }
  }, [isAlternativeSkin, unityLoaded]);

  useEffect(() => {
    if (!client || !isGameStarted) {
      return; // Don't load Unity if not connected or game not started
    }

    // Verificar si hay un carro seleccionado
    const activeCar = activeCarService.getActiveCar();
    if (!activeCar) {
      navigate('/profile');
      return;
    }

    // Function that receives data from Unity
    window.onLapTimesMinted = async (lapTimesData: string) => {
      try {
        // Split lap times
        const laps = lapTimesData.split('|').filter(lap => lap !== '');
        
        // Get active car
        const activeCar = activeCarService.getActiveCar();
        if (!activeCar) {
          console.error('No active car found');
          return;
        }

        // Get the best lap time in milliseconds
        const bestLapTimeMs = laps.reduce((best, lap) => {
          const timeMatch = lap.match(/Lap \d+: (\d+):(\d+):(\d+)/);
          if (timeMatch) {
            const [, minutes, seconds, milliseconds] = timeMatch;
            const totalMs = (parseInt(minutes) * 60000) + (parseInt(seconds) * 1000) + parseInt(milliseconds) * 10;
            return best === 0 ? totalMs : Math.min(best, totalMs);
          }
          return best;
        }, 0);

        // Get contract instance
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const leaderboardContract = new ethers.Contract(
          import.meta.env.VITE_RACE_LEADERBOARD_ADDRESS,
          [
            "function mintRaceResult(uint256 carId, uint256 time) external returns (uint256)"
          ],
          signer
        );

        // Mint the race result
        const tx = await leaderboardContract.mintRaceResult(activeCar.id, bestLapTimeMs);
        await tx.wait();
        
        console.log('Successfully minted race result to leaderboard!');
        console.log('Lap times:');
        laps.forEach(lap => console.log(lap));

        alert('Successfully minted race result to leaderboard!\n' + laps.join('\n'));
      } catch (error) {
        console.error('Error minting race result:', error);
        alert('Error minting race result. Please try again.');
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
  }, [client, account.bech32Address, navigate, isGameStarted]);

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
                <CarIcon className="inline-block w-5 h-5 mr-1" />
                Market
              </Link>
              <XionConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[98%] mx-auto px-4 py-8">
        {!client ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet to Play</h2>
            <p className="text-gray-400 mb-8">You need to connect your wallet to access the game</p>
            <XionConnectButton />
          </div>
        ) : !isGameStarted ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Ready to Race?</h2>
            <p className="text-gray-400 mb-8">Make sure you have a car selected before starting</p>
            
            {/* Skin change button */}
            <button
              onClick={() => setIsAlternativeSkin(!isAlternativeSkin)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mb-4 flex items-center justify-center mx-auto gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v4a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>{isAlternativeSkin ? 'Use Main Skin' : 'Use Core Skin'}</span>
            </button>

            <button
              onClick={handleStartGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full inline-flex items-center space-x-2 transform transition hover:scale-105"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Start Race</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Unity Game Container */}
            <div className="relative">
              <div id="unity-container" className="unity-desktop">
                <canvas id="unity-canvas" width={960} height={600} tabIndex={-1} />
                <div id="unity-loading-bar">
                  <div id="unity-logo"></div>
                  <div id="unity-progress-bar-empty">
                    <div id="unity-progress-bar-full"></div>
                  </div>
                </div>
                <div id="unity-warning"> </div>
                <div id="unity-footer">
                  <div id="unity-logo-title-footer"></div>
                  <div id="unity-fullscreen-button"></div>
                  <div id="unity-build-title">Rush racing</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard - Always visible */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
} 