import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    createUnityInstance: any;
    unityInstance: any;
  }
}

export function UnityGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUnityGame = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      try {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        
        const updateCanvasSize = () => {
          const parentWidth = container.clientWidth;
          const parentHeight = container.clientHeight;
          
          canvas.style.width = `${parentWidth}px`;
          canvas.style.height = `${parentHeight}px`;
          canvas.width = parentWidth;
          canvas.height = parentHeight;
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        const loaderScript = document.createElement('script');
        loaderScript.src = '/Build/build-run.loader.js';
        loaderScript.async = true;
        loaderScript.onerror = (error) => {
          console.error('Error loading Unity loader script:', error);
          if (loadingBarRef.current) {
            loadingBarRef.current.innerHTML = `<div class="text-red-500 text-center p-4">Error al cargar el script de Unity</div>`;
          }
        };

        loaderScript.onload = async () => {
          try {
            const config = {
              dataUrl: "/Build/build-run.data.br",
              frameworkUrl: "/Build/build-run.framework.js.br",
              codeUrl: "/Build/build-run.wasm.br",
              streamingAssetsUrl: "/StreamingAssets",
              companyName: "Saritu.eth gaming",
              productName: "Rush racing",
              productVersion: "1.0",
<<<<<<< Updated upstream
              matchWebGLToCanvasSize: false,
=======
              matchWebGLToCanvasSize: true,
>>>>>>> Stashed changes
              devicePixelRatio: 1,
              preserveDrawingBuffer: true,
              powerPreference: "high-performance",
              failIfMajorPerformanceCaveat: false,
              showBanner: (msg: string, type: string) => {
                console.warn('Unity Banner:', msg, type);
<<<<<<< Updated upstream
                if (type === 'error' && loadingBarRef.current) {
                  loadingBarRef.current.innerHTML = `<div class="text-red-500 text-center p-4">${msg}</div>`;
=======
                if (loadingBarRef.current) {
                  const color = type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue';
                  loadingBarRef.current.innerHTML = `<div class="text-${color}-500 text-center p-4">${msg}</div>`;
>>>>>>> Stashed changes
                }
              },
              disableLocalStorage: false,
              enablePersistence: true,
              canvasId: "unity-canvas"
            };

            const checkFileExists = async (url: string) => {
              try {
                const response = await fetch(url, { method: 'HEAD' });
                return response.ok;
              } catch {
                return false;
              }
            };

            // Verificar si los archivos existen antes de intentar cargarlos
            const files = [
              config.dataUrl,
              config.frameworkUrl,
              config.codeUrl,
              '/Build/build-run.loader.js'
            ];

            const fileChecks = await Promise.all(files.map(checkFileExists));
            const missingFiles = files.filter((_, index) => !fileChecks[index]);

            if (missingFiles.length > 0) {
              throw new Error(`Archivos faltantes: ${missingFiles.join(', ')}`);
            }

            const unityInstance = await window.createUnityInstance(canvas, config, (progress: number) => {
              if (progressBarRef.current) {
                progressBarRef.current.style.width = `${progress * 100}%`;
              }
            });

            window.unityInstance = unityInstance;

            if (loadingBarRef.current) {
              loadingBarRef.current.style.display = 'none';
            }

            return () => {
              if (window.unityInstance) {
                window.unityInstance.Quit();
                delete window.unityInstance;
              }
              window.removeEventListener('resize', updateCanvasSize);
            };
          } catch (error) {
            console.error('Error initializing Unity:', error);
            if (loadingBarRef.current) {
              loadingBarRef.current.innerHTML = `<div class="text-red-500 text-center p-4">Error al cargar el juego: ${error}</div>`;
            }
          }
        };

        document.body.appendChild(loaderScript);

        return () => {
          if (document.body.contains(loaderScript)) {
            document.body.removeChild(loaderScript);
          }
        };
      } catch (error) {
        console.error('Error loading Unity script:', error);
        if (loadingBarRef.current) {
          loadingBarRef.current.innerHTML = `<div class="text-red-500 text-center p-4">Error al cargar el script de Unity: ${error}</div>`;
        }
      }
    };

    loadUnityGame();
  }, []);

  return (
    <div className="w-full">
      <div 
        ref={containerRef}
        className="relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl"
        style={{
          width: '100%',
          height: '90vh',
          maxHeight: '900px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <canvas 
          ref={canvasRef}
          id="unity-canvas"
          style={{ 
            background: '#231F20',
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        <div 
          ref={loadingBarRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <div className="w-96 h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              ref={progressBarRef}
              className="h-full bg-red-600 rounded-full transition-all duration-200"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 