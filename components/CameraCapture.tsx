import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from './Button';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions or use file upload.");
    }
  }, [facingMode]); // Removed 'stream' from dependency to avoid infinite loop logic issues, handled inside

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip horizontally if using user facing camera for mirror effect
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        
        // Stop camera stream after capture to save battery/resources
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        onCapture(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Optional: Resize user uploaded image if it's too huge
        onCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto space-y-6 animate-float">
      <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl shadow-chrono-500/20 border border-white/10">
        {!error ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 flex-col p-6 text-center">
            <svg className="w-12 h-12 mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        )}
        
        {/* Overlay grid for composition */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-1/3 border-b border-white"></div>
            <div className="w-full h-1/3 border-b border-white top-1/3 absolute"></div>
            <div className="h-full w-1/3 border-r border-white absolute top-0 left-0"></div>
            <div className="h-full w-1/3 border-r border-white absolute top-0 left-1/3"></div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
        {!error && (
          <Button onClick={capturePhoto} className="w-full sm:w-auto min-w-[200px] text-lg py-4">
            <span className="mr-2">📸</span> Snap Photo
          </Button>
        )}
        
        <div className="flex gap-3 w-full sm:w-auto justify-center">
            <Button variant="secondary" onClick={toggleCamera} className="px-4" aria-label="Flip Camera">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </Button>
            
            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="file-upload"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Upload
                </Button>
            </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Best results with good lighting and facing the camera directly.</p>
    </div>
  );
};
