"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNotifications } from "@/contexts/NotificationContext";
import { useServiceOrders } from "@/contexts/ServiceOrderContext";
import {
  calculateEstimatedPrice,
  formatFileSize,
  validateSTLFile,
} from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Info,
  Package,
  Printer,
  Settings,
  Shield,
  Upload,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";

const materials = [
  {
    id: "pla",
    name: "PLA",
    description: "Easy to print, biodegradable, good for prototypes",
    price: 150, // per kg
    colors: [
      "Black",
      "White",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Orange",
      "Purple",
    ],
    properties: {
      strength: "Medium",
      flexibility: "Low",
      temperature: "Up to 60°C",
      food_safe: "Yes (food grade available)",
    },
  },
  {
    id: "abs",
    name: "ABS",
    description: "Strong, impact resistant, good for functional parts",
    price: 180, // per kg
    colors: ["Black", "White", "Red", "Blue", "Gray"],
    properties: {
      strength: "High",
      flexibility: "Medium",
      temperature: "Up to 100°C",
      food_safe: "No",
    },
  },
  {
    id: "petg",
    name: "PETG",
    description: "Crystal clear, chemical resistant, easy to print",
    price: 220, // per kg
    colors: ["Clear", "Black", "White", "Blue", "Green"],
    properties: {
      strength: "High",
      flexibility: "Medium",
      temperature: "Up to 85°C",
      food_safe: "Yes",
    },
  },
  {
    id: "tpu",
    name: "TPU (Flexible)",
    description: "Rubber-like flexibility, perfect for gaskets and phone cases",
    price: 350, // per kg
    colors: ["Black", "White", "Red", "Blue", "Clear"],
    properties: {
      strength: "Medium",
      flexibility: "Very High",
      temperature: "Up to 80°C",
      food_safe: "Yes",
    },
  },
  {
    id: "resin",
    name: "Resin (SLA)",
    description: "Ultra high detail, smooth surface finish",
    price: 2500, // per liter
    colors: ["Clear", "Gray", "Black", "White", "Castable"],
    properties: {
      strength: "Medium",
      flexibility: "Low",
      temperature: "Up to 60°C",
      food_safe: "No",
    },
    unit: "liter",
  },
];

const qualityOptions = [
  {
    id: "draft",
    name: "Draft",
    description: "0.3mm layer height, fast printing",
    multiplier: 0.7,
  },
  {
    id: "standard",
    name: "Standard",
    description: "0.2mm layer height, balanced",
    multiplier: 1.0,
  },
  {
    id: "high",
    name: "High Quality",
    description: "0.15mm layer height, detailed",
    multiplier: 1.4,
  },
  {
    id: "ultra",
    name: "Ultra Fine",
    description: "0.1mm layer height, maximum detail",
    multiplier: 2.0,
  },
];

export default function ThreeDPrintingPage() {
  const { createOrder, uploadFile } = useServiceOrders();
  const { success, error: showError, info } = useNotifications();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [selectedColor, setSelectedColor] = useState(materials[0].colors[0]);
  const [selectedQuality, setSelectedQuality] = useState(qualityOptions[1]);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<"normal" | "rush">("normal");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileAnalysis, setFileAnalysis] = useState<any>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    previewUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    const validation = validateSTLFile(file);
    if (!validation.isValid) {
      showError(
        "Invalid File",
        validation.error || "Please select a valid STL file"
      );
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const uploadResult = await uploadFile(file, "printing");
      setUploadedFile(uploadResult);

      // Mock file analysis - in production this would be real analysis
      const mockAnalysis = {
        volume: Math.random() * 100 + 10, // cm³
        surface_area: Math.random() * 500 + 50, // cm²
        dimensions: {
          x: Math.random() * 100 + 20,
          y: Math.random() * 100 + 20,
          z: Math.random() * 50 + 10,
        },
        complexity_score: Math.random() * 10 + 1,
      };

      setFileAnalysis(mockAnalysis);

      // Calculate estimated price
      const price = calculateEstimatedPrice(
        "printing",
        selectedMaterial.name,
        quantity,
        mockAnalysis.volume
      );
      setEstimatedPrice(price);

      success("File Uploaded", "Your file has been analyzed successfully");
    } catch (error) {
      showError("Upload Failed", "Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleMaterialChange = (material: (typeof materials)[0]) => {
    setSelectedMaterial(material);
    setSelectedColor(material.colors[0]);

    if (fileAnalysis) {
      const price = calculateEstimatedPrice(
        "printing",
        material.name,
        quantity,
        fileAnalysis.volume
      );
      setEstimatedPrice(price);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));

    if (fileAnalysis) {
      const price = calculateEstimatedPrice(
        "printing",
        selectedMaterial.name,
        newQuantity,
        fileAnalysis.volume
      );
      setEstimatedPrice(price);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedFile || !fileAnalysis || !estimatedPrice || !uploadedFile) {
      showError(
        "Missing Information",
        "Please upload a file and wait for analysis"
      );
      return;
    }

    try {
      const order = await createOrder({
        service_type: "printing",
        file_url: uploadedFile.url,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        preview_url: uploadedFile.previewUrl,
        material: selectedMaterial.name,
        color_finish: selectedColor,
        quantity: quantity,
        priority: priority,
        dimensions: {
          x: fileAnalysis.dimensions.x,
          y: fileAnalysis.dimensions.y,
          z: fileAnalysis.dimensions.z,
        },
        base_price: estimatedPrice,
        material_cost: fileAnalysis.volume * (selectedMaterial.price / 1000),
        labor_cost: estimatedPrice * 0.3,
        setup_fee: 100,
        rush_fee: priority === "rush" ? estimatedPrice * 0.5 : 0,
        total_price:
          estimatedPrice + (priority === "rush" ? estimatedPrice * 0.5 : 0),
        customer_notes: customerNotes,
        user_id: "current-user", // This would come from auth context
        status: "pending",
      });

      success(
        "Order Placed",
        "Your 3D printing order has been submitted successfully!"
      );

      // Reset form
      setSelectedFile(null);
      setFileAnalysis(null);
      setEstimatedPrice(null);
      setUploadedFile(null);
      setCustomerNotes("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      showError("Order Failed", "Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
                <Wrench className="h-6 w-6 text-makrx-teal" />
                <span className="text-xl font-bold text-gray-900">
                  MakrX Services
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/orders"
                className="text-gray-600 hover:text-gray-900"
              >
                My Orders
              </Link>
              <Link
                href="/provider-dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Providers
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Printer className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            3D Printing Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your 3D model and get professional 3D printing with fast
            turnaround times
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Your 3D Model
                </CardTitle>
                <CardDescription>
                  Supported formats: STL, OBJ, 3MF (Max 100MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`file-upload-area ${isUploading ? "dragging" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="font-medium text-gray-900 mb-2">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Size: {formatFileSize(selectedFile.size)}
                      </p>
                      {fileAnalysis && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Volume</p>
                            <p>{fileAnalysis.volume.toFixed(2)} cm³</p>
                          </div>
                          <div>
                            <p className="font-medium">Dimensions</p>
                            <p>
                              {fileAnalysis.dimensions.x.toFixed(1)} ×{" "}
                              {fileAnalysis.dimensions.y.toFixed(1)} ×{" "}
                              {fileAnalysis.dimensions.z.toFixed(1)} mm
                            </p>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4"
                      >
                        Upload Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {isUploading
                          ? "Analyzing your file..."
                          : "Drop your 3D model here"}
                      </p>
                      <p className="text-gray-600 mb-6">
                        or click to browse your computer
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? "Processing..." : "Choose File"}
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stl,.obj,.3mf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Material Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Material & Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Material Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Material
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {materials.map((material) => (
                        <div
                          key={material.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedMaterial.id === material.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleMaterialChange(material)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900">
                              {material.name}
                            </h3>
                            <span className="text-sm font-medium text-green-600">
                              ₹{material.price}/{material.unit || "kg"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {material.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            Strength: {material.properties.strength} •
                            Flexibility: {material.properties.flexibility}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Color/Finish
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMaterial.colors.map((color) => (
                        <button
                          key={color}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            selectedColor === color
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Print Quality
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {qualityOptions.map((quality) => (
                        <div
                          key={quality.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedQuality.id === quality.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedQuality(quality)}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-medium text-gray-900">
                              {quality.name}
                            </h4>
                            {quality.multiplier !== 1.0 && (
                              <span className="text-sm text-gray-600">
                                {quality.multiplier < 1 ? "-" : "+"}
                                {Math.abs(
                                  (quality.multiplier - 1) * 100
                                ).toFixed(0)}
                                %
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {quality.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity and Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(parseInt(e.target.value) || 1)
                          }
                          className="w-20 text-center border border-gray-300 rounded-lg py-2"
                          min="1"
                        />
                        <button
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          onClick={() => handleQuantityChange(quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) =>
                          setPriority(e.target.value as "normal" | "rush")
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="normal">Standard (2-3 days)</option>
                        <option value="rush">Rush (+50% - next day)</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Any special requirements or notes for the provider..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">File</span>
                        <span
                          className="text-sm font-medium text-gray-900 truncate ml-2 max-w-32"
                          title={selectedFile.name}
                        >
                          {selectedFile.name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Material</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedMaterial.name} ({selectedColor})
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Quality</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedQuality.name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Quantity</span>
                        <span className="text-sm font-medium text-gray-900">
                          {quantity}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm text-gray-600">Priority</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {priority}
                        </span>
                      </div>

                      {fileAnalysis && (
                        <>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">
                              Volume
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {fileAnalysis.volume.toFixed(2)} cm³
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">
                              Est. Material
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {((fileAnalysis.volume * 1.24) / 1000).toFixed(3)}{" "}
                              kg
                            </span>
                          </div>
                        </>
                      )}

                      {estimatedPrice && (
                        <>
                          {priority === "rush" && (
                            <div className="flex justify-between items-center py-2 text-orange-600">
                              <span className="text-sm">Rush Fee (50%)</span>
                              <span className="text-sm font-medium">
                                +₹{(estimatedPrice * 0.5).toFixed(2)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center py-3 border-t border-gray-200">
                            <span className="font-medium text-gray-900">
                              Total Estimate
                            </span>
                            <span className="text-xl font-bold text-makrx-teal">
                              ₹
                              {(
                                estimatedPrice +
                                (priority === "rush" ? estimatedPrice * 0.5 : 0)
                              ).toFixed(2)}
                            </span>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Info className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-blue-900">
                                Estimated Timeline
                              </span>
                            </div>
                            <p className="text-sm text-blue-800">
                              {priority === "rush"
                                ? "24 hours"
                                : "2-3 business days"}
                            </p>
                          </div>

                          <Button
                            className="w-full services-button-primary text-white"
                            onClick={handlePlaceOrder}
                          >
                            Place Order
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Upload a file to see pricing
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Shield className="h-5 w-5 mr-2" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Free quotes and analysis</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Quality guarantee</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Expert provider network</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href="/help"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View printing guidelines →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
