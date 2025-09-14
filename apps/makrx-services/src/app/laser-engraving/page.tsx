"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Scissors,
  Upload,
  FileText,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  AlertCircle,
  ArrowLeft,
  Wrench,
  Settings,
  Package,
  DollarSign,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useServiceOrders } from "@/contexts/ServiceOrderContext";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  validateSVGFile,
  formatFileSize,
  calculateEstimatedPrice,
} from "@/lib/utils";

const materials = [
  {
    id: "wood",
    name: "Wood",
    description: "Natural wood with beautiful grain patterns",
    price: 50, // per cm²
    thickness: ["3mm", "5mm", "10mm"],
    properties: {
      strength: "Medium",
      finish: "Natural grain",
      applications: "Signs, decorative items, jewelry",
    },
  },
  {
    id: "acrylic",
    name: "Acrylic",
    description: "Crystal clear or colored plastic sheets",
    price: 30, // per cm²
    thickness: ["3mm", "5mm", "8mm", "10mm"],
    properties: {
      strength: "High",
      finish: "Glossy, smooth",
      applications: "Display stands, covers, awards",
    },
  },
  {
    id: "metal",
    name: "Stainless Steel",
    description: "Durable metal for permanent marking",
    price: 80, // per cm²
    thickness: ["1mm", "2mm", "3mm"],
    properties: {
      strength: "Very High",
      finish: "Brushed or mirror",
      applications: "Industrial tags, nameplates, jewelry",
    },
  },
  {
    id: "leather",
    name: "Leather",
    description: "Premium leather for custom products",
    price: 40, // per cm²
    thickness: ["2mm", "3mm", "4mm"],
    properties: {
      strength: "Medium",
      finish: "Natural texture",
      applications: "Wallets, bags, decorative items",
    },
  },
];

const serviceTypes = [
  {
    id: "cutting",
    name: "Laser Cutting",
    description: "Cut precise shapes and patterns",
    icon: "✂️",
  },
  {
    id: "engraving",
    name: "Laser Engraving",
    description: "Engrave text, logos, and designs",
    icon: "🔥",
  },
  {
    id: "both",
    name: "Cut & Engrave",
    description: "Combined cutting and engraving",
    icon: "⚡",
  },
];

export default function LaserEngravingPage() {
  const { createOrder, uploadFile } = useServiceOrders();
  const { success, error: showError, info } = useNotifications();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [selectedThickness, setSelectedThickness] = useState(
    materials[0].thickness[0],
  );
  const [selectedServiceType, setSelectedServiceType] = useState(
    serviceTypes[1],
  );
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<"normal" | "rush">("normal");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileAnalysis, setFileAnalysis] = useState<any>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    const validation = validateSVGFile(file);
    if (!validation.isValid) {
      showError(
        "Invalid File",
        validation.error || "Please select a valid SVG file",
      );
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const uploadResult = await uploadFile(file, "engraving");

      // Mock file analysis - in production this would be real SVG analysis
      const mockAnalysis = {
        area: Math.random() * 200 + 20, // cm²
        dimensions: {
          width: Math.random() * 200 + 50,
          height: Math.random() * 150 + 30,
        },
        path_length: Math.random() * 1000 + 100, // cm
        complexity_score: Math.random() * 10 + 1,
      };

      setFileAnalysis(mockAnalysis);

      // Calculate estimated price
      const price = calculateEstimatedPrice(
        "engraving",
        selectedMaterial.name,
        quantity,
        undefined,
        mockAnalysis.area,
      );
      setEstimatedPrice(price);

      success("File Uploaded", "Your design has been analyzed successfully");
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
    setSelectedThickness(material.thickness[0]);

    if (fileAnalysis) {
      const price = calculateEstimatedPrice(
        "engraving",
        material.name,
        quantity,
        undefined,
        fileAnalysis.area,
      );
      setEstimatedPrice(price);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));

    if (fileAnalysis) {
      const price = calculateEstimatedPrice(
        "engraving",
        selectedMaterial.name,
        newQuantity,
        undefined,
        fileAnalysis.area,
      );
      setEstimatedPrice(price);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedFile || !fileAnalysis || !estimatedPrice) {
      showError(
        "Missing Information",
        "Please upload a design and wait for analysis",
      );
      return;
    }

    try {
      const order = await createOrder({
        service_type: "engraving",
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        material: selectedMaterial.name,
        color_finish: selectedThickness,
        quantity: quantity,
        priority: priority,
        dimensions_x: fileAnalysis.dimensions.width,
        dimensions_y: fileAnalysis.dimensions.height,
        dimensions_z: parseFloat(selectedThickness.replace("mm", "")),
        base_price: estimatedPrice,
        material_cost: fileAnalysis.area * (selectedMaterial.price / 100),
        labor_cost: estimatedPrice * 0.4,
        setup_fee: 50,
        rush_fee: priority === "rush" ? estimatedPrice * 0.5 : 0,
        total_price:
          estimatedPrice + (priority === "rush" ? estimatedPrice * 0.5 : 0),
        customer_notes: customerNotes,
        user_id: "current-user", // This would come from auth context
        status: "pending",
      });

      success(
        "Order Placed",
        "Your laser engraving order has been submitted successfully!",
      );

      // Reset form
      setSelectedFile(null);
      setFileAnalysis(null);
      setEstimatedPrice(null);
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
            <Scissors className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Laser Engraving & Cutting
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your vector design and get precise laser cutting or engraving
            on premium materials
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Service Type
                </CardTitle>
                <CardDescription>
                  Choose the type of laser service you need
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {serviceTypes.map((serviceType) => (
                    <div
                      key={serviceType.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedServiceType.id === serviceType.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedServiceType(serviceType)}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{serviceType.icon}</div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {serviceType.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {serviceType.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Your Design
                </CardTitle>
                <CardDescription>
                  Supported formats: SVG, DXF, AI (Max 10MB)
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
                            <p className="font-medium">Area</p>
                            <p>{fileAnalysis.area.toFixed(2)} cm²</p>
                          </div>
                          <div>
                            <p className="font-medium">Dimensions</p>
                            <p>
                              {fileAnalysis.dimensions.width.toFixed(1)} ×{" "}
                              {fileAnalysis.dimensions.height.toFixed(1)} mm
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
                          ? "Analyzing your design..."
                          : "Drop your design here"}
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
                  accept=".svg,.dxf,.ai"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Material Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Material & Specifications
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
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleMaterialChange(material)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900">
                              {material.name}
                            </h3>
                            <span className="text-sm font-medium text-green-600">
                              ₹{material.price}/cm²
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {material.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            {material.properties.applications}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thickness Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Material Thickness
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedMaterial.thickness.map((thickness) => (
                        <button
                          key={thickness}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            selectedThickness === thickness
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedThickness(thickness)}
                        >
                          {thickness}
                        </button>
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
                        <option value="normal">Standard (1-2 days)</option>
                        <option value="rush">Rush (+50% - same day)</option>
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
                      placeholder="Any special requirements or finishing notes..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        <span className="text-sm text-gray-600">Service</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedServiceType.name}
                        </span>
                      </div>

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
                          {selectedMaterial.name} ({selectedThickness})
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
                            <span className="text-sm text-gray-600">Area</span>
                            <span className="text-sm font-medium text-gray-900">
                              {fileAnalysis.area.toFixed(2)} cm²
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-gray-600">
                              Path Length
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {(fileAnalysis.path_length / 10).toFixed(1)} cm
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
                            <span className="text-xl font-bold text-purple-600">
                              ₹
                              {(
                                estimatedPrice +
                                (priority === "rush" ? estimatedPrice * 0.5 : 0)
                              ).toFixed(2)}
                            </span>
                          </div>

                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Info className="h-4 w-4 text-purple-600 mr-2" />
                              <span className="text-sm font-medium text-purple-900">
                                Estimated Timeline
                              </span>
                            </div>
                            <p className="text-sm text-purple-800">
                              {priority === "rush"
                                ? "Same day"
                                : "1-2 business days"}
                            </p>
                          </div>

                          <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
                        Upload a design to see pricing
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
                    Design Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Vector formats work best</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Minimum line width: 0.1mm</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>High contrast designs preferred</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href="/help/laser-guidelines"
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      View design guidelines →
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
