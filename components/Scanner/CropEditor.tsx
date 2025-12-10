import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { RotateCw, Check, X } from 'lucide-react';

interface CropEditorProps {
  imageSrc: string;
  onConfirm: (croppedImageBase64: string) => void;
  onCancel: () => void;
  initialCrop?: { x: number, y: number, w: number, h: number };
}

export const CropEditor: React.FC<CropEditorProps> = ({ imageSrc, onConfirm, onCancel, initialCrop }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  // Selection state (relative to the displayed image size)
  const [selection, setSelection] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);

  // Load image
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImgElement(img);
      // Initialize selection to center if no initialCrop
      if (!initialCrop) {
        setSelection({
          x: img.width * 0.1,
          y: img.height * 0.1,
          w: img.width * 0.8,
          h: img.height * 0.8
        });
      } else {
        setSelection({
          x: initialCrop.x,
          y: initialCrop.y,
          w: initialCrop.w,
          h: initialCrop.h
        })
      }
    };
  }, [imageSrc, initialCrop]);

  useEffect(() => {
    if (!imgElement || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate aspect ratio to fit in container
    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;

    // For simplicity in this editor, we will draw the image scaled to fit the canvas width
    // In a full prod app, handling zoom/pan is better. 
    // Here we map canvas coordinates to image coordinates.

    // We will render the image at full resolution on the canvas, but style the canvas to fit CSS
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);
    ctx.restore();

    // Draw dimming overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (selection) {
      // Clear selection area
      ctx.clearRect(selection.x, selection.y, selection.w, selection.h);

      // Redraw image inside selection
      ctx.save();
      ctx.beginPath();
      ctx.rect(selection.x, selection.y, selection.w, selection.h);
      ctx.clip();

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);
      ctx.restore();

      // Draw border
      ctx.strokeStyle = '#f59e0b'; // Amber-500
      ctx.lineWidth = 4;
      ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
    }

  }, [imgElement, rotation, selection]);

  // Handle Touch/Mouse logic for creating selection
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const coords = getCanvasCoords(e);
    setStartPos(coords);
    setSelection({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !startPos) return;
    e.preventDefault(); // Prevent scrolling on mobile
    const current = getCanvasCoords(e);

    const newW = current.x - startPos.x;
    const newH = current.y - startPos.y;

    setSelection({
      x: newW > 0 ? startPos.x : current.x,
      y: newH > 0 ? startPos.y : current.y,
      w: Math.abs(newW),
      h: Math.abs(newH)
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleCropConfirm = () => {
    if (!imgElement || !selection) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = selection.w;
    canvas.height = selection.h;

    // Draw the portion of the original canvas that is selected
    // We need to replicate the rotation logic here to crop what is actually visible

    // Create a temp canvas to hold the full rotated image first
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgElement.width;
    tempCanvas.height = imgElement.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2);

    // Now draw the slice from tempCanvas to result canvas
    ctx.drawImage(
      tempCanvas,
      selection.x, selection.y, selection.w, selection.h, // Source
      0, 0, selection.w, selection.h // Dest
    );

    onConfirm(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="p-4 bg-slate-800 flex justify-between items-center z-10 shadow-md">
        <span className="text-white font-bold">Ajustar Recorte</span>
        <Button variant="ghost" onClick={onCancel}><X /></Button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain touch-none shadow-2xl border border-slate-700"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 px-4 py-2 rounded-full text-xs text-slate-300 pointer-events-none">
          Dibuja un recuadro sobre la pieza
        </div>
      </div>

      <div className="p-4 bg-slate-800 flex gap-4 z-10">
        <Button variant="secondary" onClick={() => setRotation(r => (r + 90) % 360)}>
          <RotateCw className="mr-2" size={20} /> Rotar
        </Button>
        <Button className="flex-1" onClick={handleCropConfirm}>
          <Check className="mr-2" size={20} /> Confirmar
        </Button>
      </div>
    </div>
  );
};