'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Upload as UploadIcon,
  File,
  X,
  Check,
  AlertCircle,
  Info,
  Loader,
  Download,
  Eye,
  Calculator,
  Clock,
  DollarSign,
  Package,
  Zap,
} from 'lucide-react';
import { storeApi, QuoteSummary, Upload } from '@/services/storeApi';
import { useAuth } from '@/contexts/AuthContext';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  uploadId?: string;
  fileKey?: string;
  analysis?: Partial<Upload>;
  quote?: QuoteSummary;
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  const [processingCount, setProcessingCount] = useState(0);

  const materials = [
    {
      id: 'PLA',
      name: 'PLA',
      description: 'Biodegradable, easy to print',
      price_per_gram: 0.15,
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'ABS',
      name: 'ABS',
      description: 'Strong, heat resistant',
      price_per_gram: 0.18,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'PETG',
      name: 'PETG',
      description: 'Chemical resistant, clear',
      price_per_gram: 0.22,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'TPU',
      name: 'TPU',
      description: 'Flexible, rubber-like',
      price_per_gram: 0.35,
      color: 'bg-orange-100 text-orange-800',
    },
  ];

  const qualities = [
    {
      id: 'draft',
      name: 'Draft (0.3mm)',
      description: 'Fast, lower detail',
      time_multiplier: 0.7,
      price_multiplier: 0.8,
    },
    {
      id: 'standard',
      name: 'Standard (0.2mm)',
      description: 'Balanced quality and speed',
      time_multiplier: 1.0,
      price_multiplier: 1.0,
    },
    {
      id: 'fine',
      name: 'Fine (0.1mm)',
      description: 'High detail, slower',
      time_multiplier: 1.8,
      price_multiplier: 1.4,
    },
  ];

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const uploadToPresignedUrl = async (
    uploadUrl: string,
    fields: Record<string, string>,
    file: File,
    onProgress: (percent: number) => void,
  ) => {
    await new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          onProgress(Math.min(100, percent));
        }
      });

      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.send(formData);
    });
  };

  const pollForProcessing = async (remoteUploadId: string, localId: string) => {
    const maxAttempts = 30;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const details = await storeApi.getUpload(remoteUploadId);

      if (details.status === 'processed') {
        return details;
      }

      if (details.status === 'failed') {
        throw new Error(details.error_message || 'Processing failed');
      }

      const progressBump = 70 + Math.min(20, (attempt / maxAttempts) * 20);
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === localId
            ? {
                ...file,
                progress: Math.max(file.progress, Math.round(progressBump)),
              }
            : file,
        ),
      );

      await sleep(2000);
    }

    throw new Error('Processing timed out');
  };

  const formatCurrency = (amount: number, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDuration = (minutes?: number) => {
    if (minutes == null || Number.isNaN(minutes)) {
      return '—';
    }
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hrs}h ${mins}m`;
  };

  const formatVolume = (volume?: number) => {
    if (volume == null || Number.isNaN(volume)) {
      return '—';
    }
    return `${volume.toFixed(2)} cm³`;
  };

  const getMaterialLabel = (id?: string) => {
    if (!id) return '—';
    const match = materials.find((m) => m.id === id.toUpperCase());
    return match?.name ?? id;
  };

  const processFile = async (uploadFile: UploadedFile, materialId: string, qualityId: string) => {
      try {
        const contentType = uploadFile.file.type || 'application/octet-stream';
        const uploadResponse = await storeApi.createUploadUrl(
          uploadFile.file.name,
          contentType,
          uploadFile.file.size,
        );

        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === uploadFile.id
              ? {
                  ...file,
                  uploadId: uploadResponse.upload_id,
                  fileKey: uploadResponse.file_key,
                }
              : file,
          ),
        );

        await uploadToPresignedUrl(uploadResponse.upload_url, uploadResponse.fields, uploadFile.file, (percent) => {
          setUploadedFiles((prev) =>
            prev.map((file) =>
              file.id === uploadFile.id
                ? {
                    ...file,
                    progress: Math.max(file.progress, Math.round((percent / 100) * 60)),
                  }
                : file,
            ),
          );
        });

        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === uploadFile.id
              ? {
                  ...file,
                  status: 'processing',
                  progress: Math.max(file.progress, 70),
                }
              : file,
          ),
        );

        await storeApi.completeUpload(uploadResponse.upload_id, uploadResponse.file_key);

        const uploadDetails = await pollForProcessing(uploadResponse.upload_id, uploadFile.id);

        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === uploadFile.id
              ? {
                  ...file,
                  analysis: uploadDetails,
                  progress: Math.max(file.progress, 90),
                }
              : file,
          ),
        );

        const normalizedQuality = qualityId === 'fine' ? 'high' : qualityId;

        const quote = await storeApi.createQuote({
          upload_id: uploadResponse.upload_id,
          material: materialId,
          quality: normalizedQuality,
          infill_percentage: 20,
          supports: false,
          quantity: 1,
        });

        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === uploadFile.id
              ? {
                  ...file,
                  status: 'completed',
                  progress: 100,
                  quote,
                }
              : file,
          ),
        );
      } catch (error) {
        console.error('Failed to process upload', error);
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === uploadFile.id
              ? {
                  ...file,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'Failed to process file',
                }
              : file,
          ),
        );
      } finally {
        setProcessingCount((prev) => Math.max(0, prev - 1));
      }
    };

  const handleFileDrop = async (acceptedFiles: File[]) => {
    if (!isAuthenticated) {
      alert('Please sign in to upload files');
      login();
      return;
    }

    if (!acceptedFiles.length) {
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading',
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setProcessingCount((prev) => prev + newFiles.length);

    for (const uploadFile of newFiles) {
      await processFile(uploadFile, selectedMaterial, selectedQuality);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId);
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updatedFiles;
    });
  };

  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
  const MAX_FILES_ALLOWED = 10;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
      'model/3mf': ['.3mf'],
      'model/ply': ['.ply'],
    },
    maxSize: MAX_FILE_SIZE_BYTES,
    maxFiles: MAX_FILES_ALLOWED,
    multiple: true,
  });

  const handleOrderAll = () => {
    const completedFiles = uploadedFiles.filter((f) => f.status === 'completed');
    if (completedFiles.length > 0) {
      router.push('/checkout?source=3d-printing');
    }
  };

  const totalQuotePrice = uploadedFiles
    .filter((f) => f.status === 'completed' && f.quote)
    .reduce((sum, f) => sum + (f.quote?.price || 0), 0);
  const totalQuoteCurrency =
    uploadedFiles.find((f) => f.status === 'completed' && f.quote)?.quote?.currency ?? 'INR';
  const totalQuoteDisplay = formatCurrency(totalQuotePrice, totalQuoteCurrency);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">3D Printing Services</h1>
          <p className="text-lg text-gray-600">
            Upload your 3D models, get instant quotes, and place orders with professional printing
            services.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 border border-gray-200">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Dropzone */}
            <div className="md:col-span-2">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <input {...getInputProps()} />
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg font-medium text-gray-900">
                  Drag and drop 3D files here, or click to select
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Supported formats: STL, OBJ, 3MF, PLY (max 100MB)
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  {uploadedFiles.map((file) => {
                    const quote = file.quote;
                    const currency = quote?.currency ?? 'INR';
                    const priceLabel = quote ? formatCurrency(quote.price, currency) : undefined;
                    const materialLabel = getMaterialLabel(quote?.print_parameters?.material);
                    const timeLabel = formatDuration(quote?.estimated_time_minutes);
                    const volumeLabel = formatVolume(quote?.material_usage.volume_cm3);

                    return (
                      <div key={file.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <File className="h-6 w-6 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{file.file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label="Remove file"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                file.status === 'error'
                                  ? 'bg-red-500'
                                  : file.status === 'completed'
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                              }`}
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {file.status === 'uploading' && 'Uploading...'}
                            {file.status === 'processing' && 'Analyzing model...'}
                            {file.status === 'completed' && 'Quote generated'}
                            {file.status === 'error' && (
                              <span className="text-red-600">{file.error}</span>
                            )}
                          </div>
                        </div>

                        {file.status === 'completed' && quote && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <div>
                                  <div className="text-sm text-gray-500">Estimated Price</div>
                                  <div className="font-semibold text-gray-900">{priceLabel}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="text-sm text-gray-500">Material</div>
                                  <div className="font-semibold text-gray-900">{materialLabel}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-purple-600" />
                                <div>
                                  <div className="text-sm text-gray-500">Print Time</div>
                                  <div className="font-semibold text-gray-900">{timeLabel}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calculator className="h-5 w-5 text-orange-600" />
                                <div>
                                  <div className="text-sm text-gray-500">Volume</div>
                                  <div className="font-semibold text-gray-900">{volumeLabel}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Print Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700">Material</label>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 p-2"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Quality</label>
                    <select
                      value={selectedQuality}
                      onChange={(e) => setSelectedQuality(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 p-2"
                    >
                      {qualities.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Quote Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Files</span>
                    <span>{uploadedFiles.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span>{uploadedFiles.filter((f) => f.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated Total</span>
                    <span className="font-semibold">{totalQuoteDisplay}</span>
                  </div>
                </div>
                <button
                  onClick={handleOrderAll}
                  disabled={uploadedFiles.filter((f) => f.status === 'completed').length === 0}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Supported file formats</p>
                    <p>
                      STL is recommended for 3D printing. OBJ and 3MF are also supported. For best
                      results, ensure models are manifold and properly scaled.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-8 flex items-center justify-between">
            <button className="text-blue-600 hover:text-blue-700 flex items-center">
              <Download className="h-5 w-5 mr-2" /> Download Sample Files
            </button>
            <button
              onClick={() => window.open('/learn/3d-printing-guide', '_blank')}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <Eye className="h-5 w-5 mr-2" /> View Printing Guide
            </button>
          </div>
        </div>

        {/* Services Overview */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Loader className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Fast Turnaround</h3>
            </div>
            <p className="mt-2 text-gray-600">Most orders are completed within 48-72 hours.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Professional Quality</h3>
            </div>
            <p className="mt-2 text-gray-600">
              Industrial-grade printers and premium materials ensure excellent results.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Expert Support</h3>
            </div>
            <p className="mt-2 text-gray-600">
              Our team can help optimize your models for best performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
