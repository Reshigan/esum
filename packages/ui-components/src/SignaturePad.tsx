"use client";

import { useRef, useEffect } from "react";

interface SignaturePadProps {
  onEnd?: () => void;
  onBegin?: () => void;
}

export function SignaturePad({ onEnd, onBegin }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Configure canvas context
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#374151"; // gray-700

    // Set up touch events for mobile
    const disableScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("touchstart", disableScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", disableScroll);
    };
  }, []);

  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPointRef.current = getEventPos(e);
    if (onBegin) onBegin();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const currentPoint = getEventPos(e);

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }

    lastPointRef.current = currentPoint;
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = false;
    lastPointRef.current = null;
    if (onEnd) onEnd();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Expose methods to parent via ref
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // @ts-ignore - attaching to canvas for parent access
    canvas.clear = clear;
  }, []);

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      <canvas
        ref={canvasRef}
        className="w-full h-32 touch-none cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex justify-between px-3 py-2 text-xs text-gray-500">
        <span>Draw your signature above</span>
        <button
          type="button"
          onClick={clear}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// Add type declaration for the clear method
declare global {
  interface HTMLCanvasElement {
    clear?: () => void;
  }
}