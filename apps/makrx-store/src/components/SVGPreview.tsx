"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, RotateCcw, ZoomIn, ZoomOut, Ruler, AlertCircle } from 'lucide-react';

interface SVGPreviewProps {
  file: File;
  className?: string;
  onAnalysis?: (analysis: {
    area_mm2: number;
    dimensions: { x: number; y: number };
    path_length_mm: number;
  }) => void;
}

export const SVGPreview: React.FC<SVGPreviewProps> = ({ file, className = "", onAnalysis }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [showDimensions, setShowDimensions] = useState(true);

  useEffect(() => {
    loadSVGFile();
  }, [file]);

  const loadSVGFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const text = await file.text();
      setSvgContent(text);

      // Parse SVG to calculate dimensions and area
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(text, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');

      if (!svgElement) {
        throw new Error('Invalid SVG file');
      }

      // Extract dimensions
      let width = 100, height = 100; // defaults
      const viewBox = svgElement.getAttribute('viewBox');
      
      if (viewBox) {
        const [x, y, w, h] = viewBox.split(' ').map(Number);
        width = w;
        height = h;
      } else {
        width = parseFloat(svgElement.getAttribute('width') || '100');
        height = parseFloat(svgElement.getAttribute('height') || '100');
      }

      // Calculate approximate area and path length
      const paths = svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, polyline, line');
      let totalPathLength = 0;
      let estimatedArea = 0;

      paths.forEach((path) => {
        if (path.tagName === 'path') {
          // Approximate path length calculation
          const d = path.getAttribute('d') || '';
          const pathCommands = d.match(/[MmLlHhVvCcSsQqTtAaZz]/g) || [];
          totalPathLength += pathCommands.length * 2; // rough estimate
        } else if (path.tagName === 'rect') {
          const w = parseFloat(path.getAttribute('width') || '0');
          const h = parseFloat(path.getAttribute('height') || '0');
          totalPathLength += 2 * (w + h);
          estimatedArea += w * h;
        } else if (path.tagName === 'circle') {
          const r = parseFloat(path.getAttribute('r') || '0');
          totalPathLength += 2 * Math.PI * r;
          estimatedArea += Math.PI * r * r;
        }
      });

      // Convert to mm (assuming SVG units are in pixels, 1px = 0.264583mm)
      const pxToMm = 0.264583;
      const analysisData = {
        area_mm2: Math.round(estimatedArea * pxToMm * pxToMm),
        dimensions: {
          x: Math.round(width * pxToMm * 100) / 100,
          y: Math.round(height * pxToMm * 100) / 100,
        },
        path_length_mm: Math.round(totalPathLength * pxToMm),
      };

      setAnalysis(analysisData);
      onAnalysis?.(analysisData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading SVG file:', err);
      setError('Failed to load SVG file');
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`relative bg-white rounded-lg border ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setShowDimensions(!showDimensions)}
          className={`p-2 rounded-lg shadow-sm border ${showDimensions ? 'bg-blue-100 text-blue-600' : 'bg-white/90 hover:bg-white'}`}
          title="Toggle Dimensions"
        >
          <Ruler className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border"
          title="Reset Zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Loading/Error States */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading SVG file...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* SVG Viewport */}
      <div 
        ref={containerRef}
        className="w-full h-96 flex items-center justify-center overflow-hidden p-4"
        style={{ background: 'repeating-conic-gradient(#f8f9fa 0% 25%, transparent 0% 50%) 50% / 20px 20px' }}
      >
        {svgContent && (
          <div 
            style={{ transform: `scale(${zoom})` }}
            className="transition-transform duration-200"
          >
            <div
              dangerouslySetInnerHTML={{ __html: svgContent }}
              className="max-w-full max-h-full"
            />
          </div>
        )}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-2 py-1 rounded text-sm font-mono">
        {Math.round(zoom * 100)}%
      </div>

      {/* Analysis Info */}
      {analysis && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Design Analysis</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Dimensions:</span>
              <p className="font-mono">{analysis.dimensions.x} × {analysis.dimensions.y} mm</p>
            </div>
            <div>
              <span className="text-gray-600">Est. Area:</span>
              <p className="font-mono">{(analysis.area_mm2 / 100).toFixed(2)} cm²</p>
            </div>
            <div>
              <span className="text-gray-600">Path Length:</span>
              <p className="font-mono">{(analysis.path_length_mm / 10).toFixed(1)} cm</p>
            </div>
          </div>
          
          {showDimensions && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
              <p>💡 Dimensions shown assume 96 DPI. For precise sizing, include dimensions in your SVG file.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
