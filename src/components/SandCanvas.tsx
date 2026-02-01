import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { useSandSound } from '@/hooks/useSandSound';

interface SandCanvasProps {
  onClear: () => void;
  clearTrigger: number;
}

const SandCanvas: React.FC<SandCanvasProps> = ({ onClear, clearTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const { sandScratch } = useHaptics();
  const { startSound, stopSound } = useSandSound();
  const [isClearing, setIsClearing] = useState(false);

  // Generate sand texture
  const generateSandTexture = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Base sand color with variation
      const variation = Math.random() * 30 - 15;
      const r = 215 + variation;
      const g = 195 + variation;
      const b = 165 + variation;

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;

      // Add grain effect
      if (Math.random() > 0.97) {
        const grainIntensity = Math.random() * 20;
        data[i] -= grainIntensity;
        data[i + 1] -= grainIntensity;
        data[i + 2] -= grainIntensity;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    if (!canvas || !drawingCanvas) return;

    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      drawingCanvas.width = width * dpr;
      drawingCanvas.height = height * dpr;
      drawingCanvas.style.width = `${width}px`;
      drawingCanvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      const drawCtx = drawingCanvas.getContext('2d');
      if (ctx && drawCtx) {
        ctx.scale(dpr, dpr);
        drawCtx.scale(dpr, dpr);
        generateSandTexture(ctx, width * dpr, height * dpr);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, [generateSandTexture]);

  // Clear animation when triggered
  useEffect(() => {
    if (clearTrigger === 0) return;

    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    setIsClearing(true);
    
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const totalFrames = 60;
    const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);

    const animate = () => {
      if (frame >= totalFrames) {
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        setIsClearing(false);
        return;
      }

      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      ctx.globalAlpha = 1 - eased;
      ctx.putImageData(imageData, eased * 100, 0);
      ctx.globalAlpha = 1;

      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  }, [clearTrigger]);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  }, []);

  const drawLine = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Main stroke (depression in sand)
    ctx.beginPath();
    ctx.moveTo(from.x * dpr, from.y * dpr);
    ctx.lineTo(to.x * dpr, to.y * dpr);
    ctx.strokeStyle = 'rgba(139, 119, 101, 0.6)';
    ctx.lineWidth = 20 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Inner highlight (center of finger trail)
    ctx.beginPath();
    ctx.moveTo(from.x * dpr, from.y * dpr);
    ctx.lineTo(to.x * dpr, to.y * dpr);
    ctx.strokeStyle = 'rgba(180, 165, 145, 0.4)';
    ctx.lineWidth = 8 * dpr;
    ctx.stroke();

    // Shadow on one side
    ctx.beginPath();
    ctx.moveTo((from.x + 3) * dpr, (from.y + 3) * dpr);
    ctx.lineTo((to.x + 3) * dpr, (to.y + 3) * dpr);
    ctx.strokeStyle = 'rgba(100, 85, 70, 0.3)';
    ctx.lineWidth = 22 * dpr;
    ctx.stroke();

    // Displaced sand particles
    const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
    const particles = Math.floor(distance / 5);
    
    for (let i = 0; i < particles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 10;
      const px = to.x + Math.cos(angle) * radius;
      const py = to.y + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(px * dpr, py * dpr, (1 + Math.random()) * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${160 + Math.random() * 30}, ${145 + Math.random() * 25}, ${120 + Math.random() * 20}, ${0.3 + Math.random() * 0.3})`;
      ctx.fill();
    }
  }, []);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (isClearing) return;
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getPos(e);
    startSound();
  }, [getPos, startSound, isClearing]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawingRef.current || isClearing) return;
    e.preventDefault();

    const currentPos = getPos(e);
    drawLine(lastPosRef.current, currentPos);
    lastPosRef.current = currentPos;
    
    // Haptic feedback
    sandScratch();
  }, [getPos, drawLine, sandScratch, isClearing]);

  const handleEnd = useCallback(() => {
    isDrawingRef.current = false;
    stopSound();
  }, [stopSound]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base sand texture */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      
      {/* Drawing layer */}
      <canvas
        ref={drawingCanvasRef}
        className="absolute inset-0 touch-none"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
      />
    </div>
  );
};

export default SandCanvas;
