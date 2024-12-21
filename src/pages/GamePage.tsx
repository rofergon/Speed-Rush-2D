import React, { useEffect } from 'react';
import { Leaderboard } from '../components/Leaderboard';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/unity.css';

interface UnityInstance {
  SetFullscreen: (value: number) => void;
}

export function GamePage() {
  useEffect(() => {
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

      // Cargar el script de Unity
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
          .then((unityInstance: UnityInstance) => {
            const loadingBar = document.querySelector("#unity-loading-bar") as HTMLElement;
            if (loadingBar) {
              loadingBar.style.display = "none";
            }
            const fullscreenButton = document.querySelector("#unity-fullscreen-button");
            if (fullscreenButton) {
              // @ts-ignore
              fullscreenButton.onclick = () => {
                unityInstance.SetFullscreen(1);
              };
            }
          })
          .catch((message: string) => {
            alert(message);
          });
      };
      document.body.appendChild(script);
    };

    loadUnityGame();

    return () => {
      // Limpiar scripts y elementos de Unity al desmontar
      const unityScript = document.querySelector('script[src*="build.loader.js"]');
      if (unityScript) {
        document.body.removeChild(unityScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-[95%] mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white mb-8"
        >
          <Home className="w-5 h-5" />
          <span>Volver al Inicio</span>
        </Link>
        
        <div className="flex flex-col gap-8">
          <div className="w-full bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-4">Speed Rush 2D</h2>
            <div id="unity-container" className="unity-desktop">
              <canvas id="unity-canvas" width={960} height={600} tabIndex={-1}></canvas>
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
          <div className="max-w-2xl mx-auto w-full">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
} 