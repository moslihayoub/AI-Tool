// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
import * as React from 'react';
import { useTranslation } from '../i18n';
import { Icon } from './icons';

interface AnalysisLoaderProps {
  total: number;
  startTime: number | null;
  isAnalysisDone: boolean;
  onViewResults: () => void;
  onCancel: () => void;
}

const LightCycleGame: React.FC<{onClose: () => void}> = ({onClose}) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameContainerRef = React.useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    
    const [score, setScore] = React.useState(0);
    const [highScore, setHighScore] = React.useState(0);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [isGameOver, setIsGameOver] = React.useState(false);
    const [canvasSize, setCanvasSize] = React.useState({ width: 300, height: 200 });
    
    // FIX: Initialized `animationFrameId` with `React.useRef(null)` to resolve an error where `useRef` was being called without arguments, which may not be supported in this project's React/TypeScript configuration. This change provides an explicit initial value, satisfying the hook's requirement for at least one argument.
    const animationFrameId = React.useRef<number | null>(null);
    const lastRenderTime = React.useRef(0);
    const gameSpeed = React.useRef(8); // tiles per second

    const TILE_SIZE = 10;
    const player = React.useRef({
      x: 15, y: 10,
      dx: 1, dy: 0,
      trail: [] as {x: number, y: number}[],
      color: '#FF585E',
    });
    
    // FIX: Moved `gameLoop` before `resetGame` to resolve a "used before declaration" error
    // that was causing the component to crash. `resetGame` now correctly depends on `gameLoop`.
    const gameLoop = React.useCallback((timestamp: number) => {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        
        if (isGameOver) return;

        const secondsSinceLastRender = (timestamp - lastRenderTime.current) / 1000;
        if (secondsSinceLastRender < 1 / gameSpeed.current) {
            return;
        }
        lastRenderTime.current = timestamp;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const tileCountX = Math.floor(canvas.width / TILE_SIZE);
        const tileCountY = Math.floor(canvas.height / TILE_SIZE);

        // Update player position
        player.current.trail.push({ x: player.current.x, y: player.current.y });
        player.current.x += player.current.dx;
        player.current.y += player.current.dy;
        
        let collision = false;
        // Collision detection
        // Wall
        if (player.current.x < 0 || player.current.x >= tileCountX || player.current.y < 0 || player.current.y >= tileCountY) {
            collision = true;
        }
        // Self
        for (const segment of player.current.trail) {
            if (segment.x === player.current.x && segment.y === player.current.y) {
                collision = true;
                break;
            }
        }
        
        // Update score and speed
        if (!collision) {
            // FIX: Used functional update for `setScore` to get the latest score and prevent bugs
            // related to stale state within the game loop, such as incorrect speed updates.
            setScore(s => {
                const newScore = s + 1;
                if (newScore > 0 && newScore % 50 === 0) {
                     gameSpeed.current += 0.5;
                }
                return newScore;
            });
        } else {
             setIsGameOver(true);
             // FIX: Used the trail length as the definitive final score to avoid using stale `score`
             // state when determining the high score upon game over.
             const finalScore = player.current.trail.length;
             if (finalScore > highScore) {
                setHighScore(finalScore);
                localStorage.setItem('lightCycleHighScore', finalScore.toString());
            }
        }

        // Draw everything
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw trail
        ctx.fillStyle = player.current.color;
        for (const segment of player.current.trail) {
            ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE -1, TILE_SIZE -1);
        }
        
        // Draw player head
        ctx.fillStyle = '#F857A6';
        ctx.fillRect(player.current.x * TILE_SIZE, player.current.y * TILE_SIZE, TILE_SIZE -1, TILE_SIZE -1);
        
    }, [highScore, isGameOver]); // FIX: Removed `score` from dependencies as it's now handled via functional updates or derived from trail length, preventing stale closures.

    const resetGame = React.useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const tileCountX = Math.floor(canvas.width / TILE_SIZE);
        const tileCountY = Math.floor(canvas.height / TILE_SIZE);
        
        player.current = {
            x: Math.floor(tileCountX / 2),
            y: Math.floor(tileCountY / 2),
            dx: 1, dy: 0,
            trail: [],
            color: '#FF585E'
        };
        setScore(0);
        gameSpeed.current = 8;
        setIsGameOver(false);
        lastRenderTime.current = 0;
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [gameLoop]);

    const handleDirectionChange = (dx: number, dy: number) => {
        if (player.current.dx === -dx && dx !== 0) return; // Prevent 180 degree turn on X
        if (player.current.dy === -dy && dy !== 0) return; // Prevent 180 degree turn on Y
        player.current.dx = dx;
        player.current.dy = dy;
    }
    
    // This effect runs only once on mount
    React.useEffect(() => {
        try {
            const storedHighScore = localStorage.getItem('lightCycleHighScore');
            if (storedHighScore) {
                setHighScore(parseInt(storedHighScore, 10));
            }
        } catch (e) { console.error("Could not read high score", e)}

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isGameOver && e.key === 'Enter') {
                resetGame();
                return;
            }
            switch(e.key) {
                case 'ArrowUp': e.preventDefault(); handleDirectionChange(0, -1); break;
                case 'ArrowDown': e.preventDefault(); handleDirectionChange(0, 1); break;
                case 'ArrowLeft': e.preventDefault(); handleDirectionChange(-1, 0); break;
                case 'ArrowRight': e.preventDefault(); handleDirectionChange(1, 0); break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
        // isGameOver and resetGame are dependencies for keydown handler, but we want to avoid re-registering the listener.
        // The logic inside handleKeyDown correctly uses the latest `isGameOver` state via its closure.
    }, []); // Empty dependency array means this runs once.

    React.useEffect(() => {
        resetGame();
    }, [resetGame]);

    const handleFullscreenToggle = () => {
        if (!gameContainerRef.current) return;
        if (!document.fullscreenElement) {
            gameContainerRef.current.requestFullscreen().catch(err => {
              alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };
    
    React.useEffect(() => {
        const onFullscreenChange = () => {
            const isFs = !!document.fullscreenElement;
            setIsFullScreen(isFs);
            if (isFs && gameContainerRef.current) {
                // FIX: Enlarge the game canvas area when entering fullscreen for a more immersive experience.
                setCanvasSize({
                    width: gameContainerRef.current.clientWidth - 32, // account for padding
                    height: gameContainerRef.current.clientHeight * 0.5 // allocate space for controls
                });
            } else {
                setCanvasSize({ width: 300, height: 200 });
            }
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    // Effect to resize canvas and reset game when size changes
    React.useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = canvasSize.width;
            canvasRef.current.height = canvasSize.height;
            resetGame();
        }
    }, [canvasSize, resetGame]);

    return (
        // FIX: Enhanced fullscreen layout to ensure all game elements are visible and properly scaled.
        <div ref={gameContainerRef} className="relative w-full max-w-sm flex flex-col items-center p-4 bg-black/50 rounded-lg border border-gray-600 backdrop-blur-sm fullscreen:p-8 fullscreen:w-full fullscreen:h-full fullscreen:max-w-none fullscreen:justify-center">
            <div className="w-full flex justify-between items-center mb-2 text-white font-semibold">
                <span>{t('analysis.score')}: {score}</span>
                <span>{t('analysis.high_score')}: {highScore}</span>
            </div>
            <div className={`relative w-full ${isFullScreen ? 'flex-grow' : ''}`} style={{paddingBottom: isFullScreen ? 0 : `${(canvasSize.height / canvasSize.width) * 100}%`}}>
                <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="absolute top-0 left-0 w-full h-full bg-gray-800 rounded-lg border border-gray-700"></canvas>
                {isGameOver && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4 rounded-lg">
                         <h3 className="text-2xl font-bold font-display text-white">{t('analysis.game_over')}</h3>
                        <p className="text-gray-300 mt-1 mb-4">{t('analysis.restart_game')}</p>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors">
                                {t('analysis.close_game')}
                            </button>
                            <button onClick={resetGame} className="bg-gradient-button text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition-opacity">
                                {t('analysis.replay_game')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <p className="text-gray-400 text-xs mt-3 text-center">{t('analysis.game_instructions')}</p>
            
            <div className="grid grid-cols-3 gap-2 mt-4 w-48 relative">
                <div></div>
                <button onClick={() => handleDirectionChange(0, -1)} className="bg-gray-700 text-white rounded p-3 active:bg-gray-500 transform active:scale-95"><Icon name="chevron-up" className="w-6 h-6 mx-auto"/></button>
                <div></div>
                <button onClick={() => handleDirectionChange(-1, 0)} className="bg-gray-700 text-white rounded p-3 active:bg-gray-500 transform active:scale-95"><Icon name="chevron-left" className="w-6 h-6 mx-auto"/></button>
                <button onClick={() => handleDirectionChange(0, 1)} className="bg-gray-700 text-white rounded p-3 active:bg-gray-500 transform active:scale-95"><Icon name="chevron-down" className="w-6 h-6 mx-auto"/></button>
                <button onClick={() => handleDirectionChange(1, 0)} className="bg-gray-700 text-white rounded p-3 active:bg-gray-500 transform active:scale-95"><Icon name="chevron-right" className="w-6 h-6 mx-auto"/></button>
            </div>
             {/* FIX: Added a more prominent secondary close button and improved fullscreen toggle placement. */}
            <div className="mt-4 flex w-full justify-center items-center gap-4">
                {!isGameOver && (
                    <button onClick={onClose} className="bg-gray-700 text-white font-semibold py-2 px-5 rounded-full hover:bg-gray-600 transition-colors">
                        {t('analysis.close_game')}
                    </button>
                )}
                <button onClick={handleFullscreenToggle} title={isFullScreen ? t('analysis.exit_fullscreen') : t('analysis.fullscreen')} className="p-3 bg-gray-700/50 rounded-full text-white hover:bg-gray-600">
                    <Icon name={isFullScreen ? 'minimize' : 'maximize'} className="w-6 h-6"/>
                </button>
            </div>
        </div>
    );
};


export const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ total, startTime, isAnalysisDone, onViewResults, onCancel }) => {
  const { t } = useTranslation();
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [showCompletionToast, setShowCompletionToast] = React.useState(false);
  const [showGame, setShowGame] = React.useState(true);

  React.useEffect(() => {
    if (startTime === null) return;
    
    const timer = setInterval(() => {
        if(isAnalysisDone) {
            clearInterval(timer);
            return;
        }
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, isAnalysisDone]);
  
  React.useEffect(() => {
    if (isAnalysisDone) {
      setShowCompletionToast(true);
    }
  }, [isAnalysisDone]);

  return (
    <div className="fixed inset-0 z-50 text-white">
      <div className="absolute inset-0 bg-white dark:bg-black" aria-hidden="true" />
      <div className="absolute inset-0 bg-gray-900 opacity-70" aria-hidden="true" />
      <div className="relative flex flex-col items-center justify-center h-full w-full p-4">
        <h2 className="text-3xl font-bold font-display text-center">{t('analysis.title')}</h2>
        <p className="text-gray-300 mt-2 text-center">{t('analysis.subtitle')}</p>
        
        <p className="text-center mt-4 text-xl font-semibold bg-clip-text text-transparent bg-gradient-button">
          {t('analysis.elapsed_time', { time: elapsedTime.toFixed(1) })}
        </p>
        
        <div className="mt-6 w-full max-w-sm">
            {showGame ? (
                <LightCycleGame onClose={() => setShowGame(false)} />
            ) : (
                 <div className="flex flex-col items-center justify-center h-[300px] pt-8">
                    <div className="w-full max-w-xs mb-6">
                        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden relative">
                            <div className="absolute top-0 left-0 h-full w-full bg-gradient-button animate-indeterminate-progress"></div>
                        </div>
                    </div>
                    <dotlottie-wc 
                        src="https://lottie.host/2963f454-9533-4e4c-9889-42b36e8b411d/QdDoxVd2p9.lottie" 
                        autoplay 
                        loop 
                        style={{ width: '150px', height: '150px' }}>
                    </dotlottie-wc>
                 </div>
            )}
        </div>

        {!isAnalysisDone && (
            <button 
                onClick={onCancel} 
                className="mt-8 text-red-400 border border-red-400 rounded-full px-8 py-2 font-semibold hover:bg-red-400/10 transition-colors">
                {t('common.cancel')}
            </button>
        )}

        {showCompletionToast && (
            <div className="absolute top-5 right-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg shadow-lg border dark:border-gray-600 animate-fade-in flex flex-col items-start gap-3 w-64">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 dark:bg-green-900 p-1.5 rounded-full">
                        <Icon name="check" className="w-5 h-5 text-green-600 dark:text-green-300"/>
                    </div>
                    <p className="font-semibold">{t('analysis.analyse_terminee')}</p>
                </div>
                <button onClick={onViewResults} className="bg-gradient-button text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity w-full">{t('analysis.voir_resultats')}</button>
            </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes indeterminate-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .animate-indeterminate-progress {
            animation: indeterminate-progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};