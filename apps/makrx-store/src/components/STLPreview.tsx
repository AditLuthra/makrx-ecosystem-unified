'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2, Eye, AlertCircle } from 'lucide-react';

interface STLPreviewProps {
  file: File;
  className?: string;
  onAnalysis?: (analysis: {
    volume_mm3: number;
    dimensions: { x: number; y: number; z: number };
    surface_area_mm2: number;
  }) => void;
}

export const STLPreview: React.FC<STLPreviewProps> = ({ file, className = '', onAnalysis }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const meshRef = useRef<THREE.Mesh>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(200, 50, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    // Load STL file
    loadSTLFile();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const loadSTLFile = async () => {
    if (!sceneRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const loader = new STLLoader();
      const arrayBuffer = await file.arrayBuffer();
      const geometry = loader.parse(arrayBuffer);

      // Calculate analysis data
      geometry.computeBoundingBox();
      geometry.computeVertexNormals();

      const boundingBox = geometry.boundingBox!;
      const dimensions = {
        x: Math.round((boundingBox.max.x - boundingBox.min.x) * 100) / 100,
        y: Math.round((boundingBox.max.y - boundingBox.min.y) * 100) / 100,
        z: Math.round((boundingBox.max.z - boundingBox.min.z) * 100) / 100,
      };

      // Calculate volume (approximation using bounding box)
      const volume_mm3 = Math.round(dimensions.x * dimensions.y * dimensions.z);

      // Calculate surface area (approximation)
      const surface_area_mm2 = Math.round(
        2 *
          (dimensions.x * dimensions.y + dimensions.y * dimensions.z + dimensions.z * dimensions.x),
      );

      const analysisData = {
        volume_mm3,
        dimensions,
        surface_area_mm2,
      };

      setAnalysis(analysisData);
      onAnalysis?.(analysisData);

      // Create material and mesh
      const material = new THREE.MeshLambertMaterial({
        color: 0x0099ff,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Center the model
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      mesh.position.sub(center);

      // Remove previous mesh
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
      }

      sceneRef.current.add(mesh);
      meshRef.current = mesh;

      // Fit camera to object
      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = cameraRef.current!.fov * (Math.PI / 180);
      const cameraDistance = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.5;

      cameraRef.current!.position.set(cameraDistance, cameraDistance, cameraDistance);
      cameraRef.current!.lookAt(0, 0, 0);
      controlsRef.current!.target.set(0, 0, 0);
      controlsRef.current!.update();

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading STL file:', err);
      setError('Failed to load STL file');
      setIsLoading(false);
    }
  };

  const resetView = () => {
    if (!cameraRef.current || !controlsRef.current || !analysis) return;
    const maxDim = Math.max(analysis.dimensions.x, analysis.dimensions.y, analysis.dimensions.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.5;

    cameraRef.current.position.set(cameraDistance, cameraDistance, cameraDistance);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const changeColor = (color: string) => {
    if (!meshRef.current) return;
    (meshRef.current.material as THREE.MeshLambertMaterial).color.setHex(
      parseInt(color.replace('#', '0x')),
    );
  };

  return (
    <div className={`relative bg-white rounded-lg border ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={resetView}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm border"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Loading/Error States */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading 3D model...</p>
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

      {/* 3D Viewport */}
      <div ref={mountRef} className="w-full h-96" />

      {/* Analysis Info */}
      {analysis && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Model Analysis</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Dimensions:</span>
              <p className="font-mono">
                {analysis.dimensions.x} × {analysis.dimensions.y} × {analysis.dimensions.z} mm
              </p>
            </div>
            <div>
              <span className="text-gray-600">Volume:</span>
              <p className="font-mono">{(analysis.volume_mm3 / 1000).toFixed(2)} cm³</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
