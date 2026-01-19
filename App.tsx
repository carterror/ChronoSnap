import React, { useState, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { Button } from './components/Button';
import { ERAS } from './constants';
import { Era, AppState } from './types';
import { generateTimeTravelImage } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('intro');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setAppState('select-era');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEraSelect = (era: Era) => {
    setSelectedEra(era);
  };

  const handleGenerate = async () => {
    if (!capturedImage || !selectedEra) return;

    setAppState('processing');
    setLoading(true);
    setError(null);

    try {
      const result = await generateTimeTravelImage(capturedImage, selectedEra.prompt);
      setResultImage(result);
      setAppState('result');
    } catch (err: any) {
      console.error(err);
      setError("The Time Machine malfunctioned! Please try again or select a different era.");
      setAppState('select-era');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAppState('intro');
    setCapturedImage(null);
    setSelectedEra(null);
    setResultImage(null);
    setError(null);
  };

  const tryAgain = () => {
      setAppState('select-era');
      setResultImage(null);
      setError(null);
  }

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `chrono-snap-${selectedEra?.id}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-chrono-500 selection:text-white pb-20 overflow-x-hidden">
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-chrono-900/10 rounded-full blur-[120px] animate-pulse-fast"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-glow/10 rounded-full blur-[120px] animate-pulse-fast" style={{animationDelay: '1s'}}></div>
        </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
          <div className="text-3xl">⏳</div>
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-chrono-400 to-accent bg-clip-text text-transparent">
            ChronoSnap
          </h1>
        </div>
        {appState !== 'intro' && (
            <button onClick={reset} className="text-sm text-gray-400 hover:text-white transition-colors">
                Start Over
            </button>
        )}
      </header>

      <main className="relative z-10 container mx-auto px-4 pt-10 max-w-5xl">
        
        {/* State: Intro */}
        {appState === 'intro' && (
          <div className="flex flex-col items-center text-center space-y-8 mt-12 animate-float">
            <div className="inline-flex items-center justify-center p-4 bg-chrono-500/10 rounded-full border border-chrono-500/20 mb-4">
                <span className="text-chrono-400 font-medium">✨ Powered by Gemini 2.5</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              Step into the <br />
              <span className="text-white">Time Machine</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Upload or capture a selfie, choose a historical era, and watch as AI reimagines your existence in a different timeline.
            </p>
            <div className="pt-8">
                <Button onClick={() => setAppState('capture')} className="text-xl px-10 py-5 shadow-chrono-500/50">
                    Enter Booth
                </Button>
            </div>

            {/* Visual Teaser */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                {ERAS.slice(0, 4).map(era => (
                    <div key={era.id} className={`aspect-square rounded-xl bg-gradient-to-br ${era.gradient} flex items-center justify-center text-4xl`}>
                        {era.icon}
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* State: Capture */}
        {appState === 'capture' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Take your ID Photo</h2>
            <CameraCapture onCapture={handleCapture} />
          </div>
        )}

        {/* State: Select Era */}
        {appState === 'select-era' && capturedImage && (
          <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                 {/* Preview of captured image */}
                 <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-chrono-500/30">
                        <img src={capturedImage} alt="You" className="w-full h-auto object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center text-xs backdrop-blur-sm">
                            Subject: You
                        </div>
                    </div>
                    <button onClick={() => setAppState('capture')} className="mt-4 text-sm text-chrono-400 hover:text-chrono-300 underline">
                        Retake Photo
                    </button>
                 </div>

                 {/* Selection Grid */}
                 <div className="w-full md:w-2/3">
                    <h2 className="text-3xl font-display font-bold mb-2">Select Destination</h2>
                    <p className="text-gray-400 mb-6">Where in time would you like to go?</p>
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ERAS.map((era) => (
                            <button
                                key={era.id}
                                onClick={() => handleEraSelect(era)}
                                className={`group relative p-4 rounded-xl text-left transition-all duration-300 border ${
                                    selectedEra?.id === era.id 
                                    ? 'bg-white/10 border-chrono-500 ring-1 ring-chrono-500' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${era.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-3xl mb-2 block">{era.icon}</span>
                                        <h3 className="font-bold text-lg">{era.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{era.description}</p>
                                    </div>
                                    {selectedEra?.id === era.id && (
                                        <span className="text-chrono-400">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Button 
                            onClick={handleGenerate} 
                            disabled={!selectedEra}
                            className="w-full sm:w-auto text-lg px-8"
                        >
                            Start Time Travel Sequence
                        </Button>
                    </div>
                 </div>
            </div>
          </div>
        )}

        {/* State: Processing */}
        {appState === 'processing' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8">
            <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-chrono-900 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-chrono-400 rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-4 border-accent-DEFAULT/20 rounded-full"></div>
                <div className="absolute inset-4 border-b-4 border-accent-DEFAULT rounded-full animate-spin-slow"></div>
            </div>
            <div>
                <h2 className="text-3xl font-display font-bold animate-pulse">Warping Spacetime...</h2>
                <p className="text-gray-400 mt-2">Constructing reality for {selectedEra?.name}</p>
            </div>
            
            <div className="max-w-md w-full bg-white/5 rounded-full h-2 overflow-hidden mt-8">
                <div className="h-full bg-gradient-to-r from-chrono-500 to-accent-DEFAULT animate-[progress_2s_ease-in-out_infinite] w-full origin-left"></div>
            </div>
          </div>
        )}

        {/* State: Result */}
        {appState === 'result' && resultImage && (
          <div className="flex flex-col items-center space-y-8 animate-[fadeIn_0.5s_ease-out]">
             <div className="text-center">
                <h2 className="text-4xl font-display font-bold mb-2">Arrival Confirmed</h2>
                <p className="text-xl text-chrono-300">Welcome to the {selectedEra?.name}</p>
             </div>

             <div className="relative group max-w-2xl w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-chrono-500 to-accent rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
                    <img src={resultImage} alt="Time Travel Result" className="w-full h-auto" />
                </div>
             </div>

             <div className="flex flex-wrap gap-4 justify-center w-full max-w-2xl">
                <Button onClick={downloadImage} className="flex-1 min-w-[150px]">
                    Download Photo
                </Button>
                <Button variant="outline" onClick={tryAgain} className="flex-1 min-w-[150px]">
                    Try Another Era
                </Button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
