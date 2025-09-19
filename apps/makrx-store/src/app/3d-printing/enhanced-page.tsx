'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  Printer,
  Zap,
  Clock,
  Star,
  Check,
  ChevronRight,
  Package,
  Shield,
  AlertCircle,
  RefreshCw,
  Eye,
  ShoppingCart,
  Layers,
  Scissors,
  Target,
  MapPin,
  Truck,
} from 'lucide-react';
import { storeApi, formatPrice, QuoteSummary, QuoteBreakdownSummary } from '@/services/storeApi';
import { useAuth } from '@/contexts/AuthContext';
import { STLPreview } from '@/components/STLPreview';
import { SVGPreview } from '@/components/SVGPreview';

// Enhanced supported formats for both 3D printing and engraving
const SUPPORTED_3D_FORMATS = ['.stl', '.obj', '.3mf', '.step', '.stp'];
const SUPPORTED_2D_FORMATS = ['.svg', '.dxf', '.ai', '.eps'];
const ALL_SUPPORTED_FORMATS = [...SUPPORTED_3D_FORMATS, ...SUPPORTED_2D_FORMATS];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const PRINTING_MATERIALS = [
  {
    id: 'pla',
    name: 'PLA',
    description: 'Easy to print, biodegradable',
    price: 120, // ₹/kg
    colors: ['Natural', 'White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple'],
    density: 1.25, // g/cm³
  },
  {
    id: 'pla+',
    name: 'PLA+',
    description: 'Enhanced PLA with better strength',
    price: 144,
    colors: ['Natural', 'White', 'Black', 'Red', 'Blue', 'Green'],
    density: 1.25,
  },
  {
    id: 'abs',
    name: 'ABS',
    description: 'Durable, heat resistant',
    price: 144,
    colors: ['Natural', 'White', 'Black', 'Red', 'Blue'],
    density: 1.04,
  },
  {
    id: 'petg',
    name: 'PETG',
    description: 'Chemical resistant, food safe',
    price: 160,
    colors: ['Natural', 'Clear', 'White', 'Black'],
    density: 1.27,
  },
  {
    id: 'tpu',
    name: 'TPU',
    description: 'Flexible, rubber-like',
    price: 240,
    colors: ['Natural', 'Black', 'Red', 'Blue'],
    density: 1.2,
  },
  {
    id: 'resin',
    name: 'Resin',
    description: 'High detail, smooth finish',
    price: 280,
    colors: ['Clear', 'White', 'Black', 'Grey'],
    density: 1.05,
  },
];

const ENGRAVING_MATERIALS = [
  {
    id: 'wood-mdf',
    name: 'MDF Wood',
    description: '3mm Medium Density Fiberboard',
    price: 5, // ₹/cm²
    finishes: ['Natural', 'Stained', 'Painted'],
  },
  {
    id: 'wood-plywood',
    name: 'Plywood',
    description: '3mm Baltic Birch Plywood',
    price: 8,
    finishes: ['Natural', 'Stained'],
  },
  {
    id: 'acrylic',
    name: 'Acrylic',
    description: '3mm Cast Acrylic Sheet',
    price: 12,
    finishes: ['Clear', 'White', 'Black', 'Colored'],
  },
  {
    id: 'leather',
    name: 'Leather',
    description: '2mm Genuine Leather',
    price: 20,
    finishes: ['Natural', 'Brown', 'Black'],
  },
  {
    id: 'cardboard',
    name: 'Cardboard',
    description: '2mm Corrugated Cardboard',
    price: 2,
    finishes: ['Natural', 'White'],
  },
];

const QUALITIES = [
  {
    id: 'draft',
    name: 'Draft',
    description: '0.3mm layers, fast printing',
    multiplier: 0.7,
  },
  {
    id: 'standard',
    name: 'Standard',
    description: '0.2mm layers, balanced',
    multiplier: 1.0,
  },
  {
    id: 'high',
    name: 'High',
    description: '0.15mm layers, fine details',
    multiplier: 1.4,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    description: '0.1mm layers, premium quality',
    multiplier: 2.0,
  },
];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: '3d' | '2d';
  file: File;
  status: 'uploading' | 'processing' | 'processed' | 'failed';
  volume_mm3?: number;
  area_mm2?: number;
  dimensions?: { x: number; y: number; z?: number };
  preview_url?: string;
  error?: string;
}

// Updated Quote interface to match QuoteSummary from storeApi.ts
interface Quote extends QuoteSummary {}

export default function Enhanced3DPrintingPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [activeService, setActiveService] = useState<'printing' | 'engraving'>('printing');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState('pla');
  const [selectedFinish, setSelectedFinish] = useState('Natural');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  const [quantity, setQuantity] = useState(1);
  const [infillPercentage, setInfillPercentage] = useState(20);
  const [supports, setSupports] = useState(false);
  const [rushOrder, setRushOrder] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const currentMaterials = activeService === 'printing' ? PRINTING_MATERIALS : ENGRAVING_MATERIALS;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const determineFileType = (file: File): '3d' | '2d' => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (SUPPORTED_3D_FORMATS.includes(extension)) {
      return '3d';
    } else if (SUPPORTED_2D_FORMATS.includes(extension)) {
      return '2d';
    }
    return '3d'; // default
  };

  const handleFiles = async (files: File[]) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    for (const file of files) {
      if (!validateFile(file)) {
        continue;
      }

      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileType = determineFileType(file);

      // Set active service based on file type
      if (fileType === '2d') {
        setActiveService('engraving');
      } else {
        setActiveService('printing');
      }

      const uploadedFile: UploadedFile = {
        id: uploadId,
        name: file.name,
        size: file.size,
        type: fileType,
        file,
        status: 'uploading',
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);

      try {
        // Get upload URL
        const uploadResponse = await storeApi.createUploadUrl(
          file.name,
          file.type as string || 'application/octet-stream',
          file.size,
        );

        // Upload file to S3/MinIO
        const formData = new FormData();
        Object.entries(uploadResponse.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append('file', file);

        const uploadResult = await fetch(uploadResponse.upload_url, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResult.ok) {
          throw new Error('Upload failed');
        }

        // Mark upload as complete
        await storeApi.completeUpload(uploadResponse.upload_id, uploadResponse.file_key);

        // Update status to processing
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, status: 'processing' } : f)),
        );

        // Poll for processing completion
        pollUploadStatus(uploadResponse.upload_id, uploadId);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId ? { ...f, status: 'failed', error: 'Upload failed' } : f,
          ),
        );
      }
    }
  };

  const pollUploadStatus = async (uploadId: string, localId: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      try {
        const upload = await storeApi.getUpload(uploadId);

        if (upload.status === 'processed') {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === localId
                ? {
                    ...f,
                    status: 'processed',
                    volume_mm3: upload.volume_mm3 ? Number(upload.volume_mm3) : undefined,
                    area_mm2: upload.surface_area_mm2 ? Number(upload.surface_area_mm2) : undefined,
                    dimensions: upload.dimensions ? { x: upload.dimensions.x, y: upload.dimensions.y, z: upload.dimensions.z } : undefined,
                  }
                : f,
            ),
          );
          return;
        } else if (upload.status === 'failed') {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === localId
                ? {
                    ...f,
                    status: 'failed',
                    error: upload.error_message || 'Processing failed',
                  }
                : f,
            ),
          );
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === localId
                ? {
                    ...f,
                    status: 'failed',
                    error: 'Processing timeout',
                  }
                : f,
            ),
          );
        }
      } catch (error) {
        console.error('Failed to check upload status:', error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === localId
              ? {
                  ...f,
                  status: 'failed',
                  error: 'Failed to check status',
                }
              : f,
          ),
        );
      }
    };

    poll();
  };

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALL_SUPPORTED_FORMATS.includes(extension)) {
      alert(`Unsupported file format. Please use: ${ALL_SUPPORTED_FORMATS.join(', ')}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return false;
    }

    return true;
  };

  const generateQuote = async () => {
    const processedFiles = uploadedFiles.filter((f) => f.status === 'processed');
    if (processedFiles.length === 0) {
      alert('Please upload and process at least one file');
      return;
    }

    setQuoteLoading(true);
    try {
      const file = processedFiles[0];

      const quoteData = await storeApi.createQuote({
        upload_id: file.id as string,
        material: selectedMaterial,
        quality: activeService === 'printing' ? (selectedQuality || '') : '',
        infill_percentage: activeService === 'printing' ? infillPercentage : undefined,
        supports: activeService === 'printing' ? supports : undefined,
        quantity,
        rush_order: rushOrder,
      });

      setQuote(quoteData);
    } catch (error) {
      console.error('Failed to generate quote:', error);
      alert('Failed to generate quote. Please try again.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const addToCart = async () => {
    if (!quote) return;

    try {
      // Create service order
      const order = await storeApi.createServiceOrder(quote.quote_id, {
        delivery_method: 'pickup', // This would be user-selected
        notes: '',
      });

      // Add to cart (integrate with existing cart system)
      // This would typically use the existing cart API
      alert('Added to cart! Redirecting to checkout...');
      router.push('/checkout');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setQuote(null);
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileAnalysis = useCallback((fileId: string, analysis: any) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              volume_mm3: analysis.volume_mm3,
              area_mm2: analysis.area_mm2 as number | undefined,
              dimensions: analysis.dimensions,
            }
          : f,
      ),
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            3D Printing & Laser Engraving Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your 3D models or 2D designs and get instant quotes from our network of verified
            service providers.
          </p>
        </div>

        {/* Service Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveService('printing')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeService === 'printing'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Printer className="inline-block w-5 h-5 mr-2" />
              3D Printing
            </button>
            <button
              onClick={() => setActiveService('engraving')}
              className={`px-6 py-3 rounded-md transition-all ${
                activeService === 'engraving'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Scissors className="inline-block w-5 h-5 mr-2" />
              Laser Engraving
            </button>
          </div>
        </div>

        {/* Service Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Quotes</h3>
            <p className="text-gray-600">
              Upload your file and get pricing instantly. No waiting, no hidden fees.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Fair Provider Matching</h3>
            <p className="text-gray-600">
              First available provider gets your job. Fair for everyone, fast for you.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Tracking</h3>
            <p className="text-gray-600">
              Track your job from creation to delivery with live updates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:col-span-3 gap-8">
          {/* File Upload and Preview Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Area */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload Your Files</h2>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-gray-600 mb-2">3D Printing: {SUPPORTED_3D_FORMATS.join(', ')}</p>
                <p className="text-gray-600 mb-4">
                  Laser Engraving: {SUPPORTED_2D_FORMATS.join(', ')}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALL_SUPPORTED_FORMATS.join(',')}
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedFile?.id === file.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-medium text-sm truncate">{file.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>

                        <div className="text-xs text-gray-600 mb-2">
                          {formatFileSize(file.size)} • {file.type.toUpperCase()}
                        </div>

                        {/* Status */}
                        <div className="flex items-center text-sm">
                          {file.status === 'uploading' && (
                            <div className="flex items-center text-blue-600">
                              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                              <span>Uploading...</span>
                            </div>
                          )}
                          {file.status === 'processing' && (
                            <div className="flex items-center text-yellow-600">
                              <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                              <span>Processing...</span>
                            </div>
                          )}
                          {file.status === 'processed' && (
                            <div className="flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              <span>Ready</span>
                            </div>
                          )}
                          {file.status === 'failed' && (
                            <div className="flex items-center text-red-600">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span>{file.error || 'Failed'}</span>
                            </div>
                          )}
                        </div>

                        {/* File Analysis */}
                        {file.status === 'processed' && (
                          <div className="mt-2 text-xs text-gray-600">
                            {file.type === '3d' && file.volume_mm3 && (
                              <div>Volume: {(file.volume_mm3 / 1000).toFixed(2)} cm³</div>
                            )}
                            {file.type === '2d' && file.area_mm2 && (
                              <div>Area: {(file.area_mm2 / 100).toFixed(2)} cm²</div>
                            )}
                            {file.dimensions && (
                              <div>
                                Size: {file.dimensions.x.toFixed(1)} ×{' '}
                                {file.dimensions.y.toFixed(1)}
                                {file.dimensions.z && ` × ${file.dimensions.z.toFixed(1)}`} mm
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview */}
            {selectedFile && selectedFile.status === 'processed' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Live Preview</h2>

                {selectedFile.type === '3d' ? (
                  <STLPreview
                    file={selectedFile.file}
                    onAnalysis={(analysis) => handleFileAnalysis(selectedFile.id, analysis)}
                  />
                ) : (
                  <SVGPreview
                    file={selectedFile.file}
                    onAnalysis={(analysis) => handleFileAnalysis(selectedFile.id, analysis)}
                  />
                )}
              </div>
            )}

            {/* Material and Settings Selection */}
            {uploadedFiles.some((f) => f.status === 'processed') && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {activeService === 'printing' ? 'Print' : 'Engraving'} Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Material Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Material</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {currentMaterials.map((material) => (
                        <label
                          key={material.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="material"
                            value={material.id}
                            checked={selectedMaterial === material.id}
                            onChange={(e) => setSelectedMaterial(e.target.value)}
                            className="mr-3"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{material.name}</div>
                            <div className="text-sm text-gray-600">{material.description}</div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ₹{material.price}
                            {activeService === 'printing' ? '/kg' : '/cm²'}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Finish/Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {activeService === 'printing' ? 'Color' : 'Finish'}
                    </label>
                    <select
                      value={selectedFinish}
                      onChange={(e) => setSelectedFinish(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {(activeService === 'printing'
                        ? PRINTING_MATERIALS.find((m) => m.id === selectedMaterial)?.colors || []
                        : ENGRAVING_MATERIALS.find((m) => m.id === selectedMaterial)?.finishes || []
                      ).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quality and Advanced Settings for 3D Printing */}
                {activeService === 'printing' && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quality
                        </label>
                        <select
                          value={selectedQuality}
                          onChange={(e) => setSelectedQuality(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {QUALITIES.map((quality) => (
                            <option key={quality.id} value={quality.id}>
                              {quality.name} - {quality.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Infill %
                        </label>
                        <select
                          value={infillPercentage}
                          onChange={(e) => setInfillPercentage(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={10}>10% - Lightweight</option>
                          <option value={20}>20% - Standard</option>
                          <option value={50}>50% - Strong</option>
                          <option value={100}>100% - Solid</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={supports}
                          onChange={(e) => setSupports(e.target.checked)}
                          className="rounded border-gray-300 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Add supports (recommended for overhangs)
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={rushOrder}
                          onChange={(e) => setRushOrder(e.target.checked)}
                          className="rounded border-gray-300 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Rush order (+50% fee, 24-hour delivery)
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Quantity for Engraving */}
                {activeService === 'engraving' && (
                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={rushOrder}
                          onChange={(e) => setRushOrder(e.target.checked)}
                          className="rounded border-gray-300 mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Rush order (+50% fee)
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quote and Checkout Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Instant Quote</h2>

              {!isAuthenticated ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Sign in to upload files and get instant quotes
                  </p>
                  <button
                    onClick={login}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={generateQuote}
                    disabled={
                      uploadedFiles.filter((f) => f.status === 'processed').length === 0 ||
                      quoteLoading
                    }
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
                  >
                    {quoteLoading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        Calculating...
                      </div>
                    ) : (
                      'Get Instant Quote'
                    )}
                  </button>

                  {quote && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Total Price</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {formatPrice(quote.price, quote.currency)}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Estimated Time:</span>
                            <span>{quote.estimated_time_hours}h</span>
                          </div>
                          {quote.estimated_weight_g && (
                            <div className="flex justify-between">
                              <span>Weight:</span>
                              <span>{quote.estimated_weight_g}g</span>
                            </div>
                          )}
                          {quote.file_analysis?.area_mm2 && (
                            <div className="flex justify-between">
                              <span>Area:</span>
                              <span>{(quote.file_analysis.area_mm2 / 100).toFixed(2)}cm²</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Material Cost:</span>
                          <span>{formatPrice(quote.breakdown.material_cost, quote.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Machine Time:</span>
                          <span>{formatPrice(quote.breakdown.machine_cost, quote.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Labor:</span>
                          <span>{formatPrice(quote.breakdown.labor_cost, quote.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Setup Fee:</span>
                          <span>{formatPrice(quote.breakdown.setup_fee ?? 0, quote.currency)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{formatPrice(quote.price, quote.currency)}</span>
                        </div>
                      </div>

                      <button
                        onClick={addToCart}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </button>

                      <div className="text-xs text-gray-600 text-center">
                        Job will be dispatched to available providers after payment
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Trust Signals */}
              <div className="mt-8 space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Secure file handling
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  Quality guaranteed
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="h-4 w-4 mr-2" />
                  Fast delivery network
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="h-4 w-4 mr-2" />
                  Fair provider matching
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}