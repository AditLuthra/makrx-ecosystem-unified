'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Camera, 
  CameraOff,
  Check, 
  X, 
  Search,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface CheckInResult {
  success: boolean;
  message: string;
  registration?: {
    id: string;
    participantName: string;
    email: string;
    eventTitle: string;
    checkedInAt: string;
    status: 'checked_in' | 'already_checked_in';
  };
  error?: string;
}

export default function CheckInPage() {
  const params = useParams();
  const micrositeSlug = params.micrositeSlug as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const [checkInStats, setCheckInStats] = useState({
    totalScanned: 0,
    successful: 0,
    alreadyCheckedIn: 0,
    errors: 0
  });

  // Mock data - replace with real API calls
  const [recentCheckIns, setRecentCheckIns] = useState([
    {
      id: '1',
      participantName: 'Sarah Johnson',
      eventTitle: 'Arduino Workshop',
      checkedInAt: new Date().toISOString(),
      status: 'checked_in' as const
    },
    {
      id: '2',
      participantName: 'Mike Chen',
      eventTitle: '3D Printing Basics',
      checkedInAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      status: 'checked_in' as const
    }
  ]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        
        // Start scanning for QR codes
        scanForQRCode();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setLastResult({
        success: false,
        message: 'Failed to access camera. Please check permissions.',
        error: 'camera_error'
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const scanForQRCode = () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // In a real implementation, you would use a QR code library like jsQR here
      // For now, we'll simulate QR code detection
      
      // Simulate random QR code detection for demo
      if (Math.random() < 0.1) { // 10% chance of detecting a QR code
        processQRCode('mock-qr-data');
      }
    }

    // Continue scanning
    setTimeout(scanForQRCode, 500);
  };

  const processQRCode = async (qrData: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random results for demo
      const isSuccess = Math.random() > 0.3;
      const isAlreadyCheckedIn = Math.random() > 0.7;
      
      if (isSuccess && !isAlreadyCheckedIn) {
        const result: CheckInResult = {
          success: true,
          message: 'Check-in successful!',
          registration: {
            id: `reg_${Date.now()}`,
            participantName: 'Demo Participant',
            email: 'demo@example.com',
            eventTitle: 'Sample Event',
            checkedInAt: new Date().toISOString(),
            status: 'checked_in'
          }
        };
        
        setLastResult(result);
        setCheckInStats(prev => ({
          ...prev,
          totalScanned: prev.totalScanned + 1,
          successful: prev.successful + 1
        }));
        
        if (result.registration) {
          setRecentCheckIns(prev => [
            {
              id: result.registration!.id,
              participantName: result.registration!.participantName,
              eventTitle: result.registration!.eventTitle,
              checkedInAt: result.registration!.checkedInAt,
              status: result.registration!.status
            },
            ...prev.slice(0, 9)
          ]);
        }
      } else if (isAlreadyCheckedIn) {
        setLastResult({
          success: false,
          message: 'Participant already checked in',
          error: 'already_checked_in'
        });
        setCheckInStats(prev => ({
          ...prev,
          totalScanned: prev.totalScanned + 1,
          alreadyCheckedIn: prev.alreadyCheckedIn + 1
        }));
      } else {
        setLastResult({
          success: false,
          message: 'Invalid QR code or registration not found',
          error: 'invalid_qr'
        });
        setCheckInStats(prev => ({
          ...prev,
          totalScanned: prev.totalScanned + 1,
          errors: prev.errors + 1
        }));
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: 'Error processing check-in',
        error: 'processing_error'
      });
      setCheckInStats(prev => ({
        ...prev,
        totalScanned: prev.totalScanned + 1,
        errors: prev.errors + 1
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!manualEntry.trim()) return;
    
    setIsProcessing(true);
    try {
      // Mock manual check-in
      await processQRCode(manualEntry);
      setManualEntry('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href={`/m/${micrositeSlug}/admin`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Event Check-In</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Staff: Admin User
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Scanned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkInStats.totalScanned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{checkInStats.successful}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Already Checked In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{checkInStats.alreadyCheckedIn}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{checkInStats.errors}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Scan participant QR codes for quick check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Camera Controls */}
              <div className="flex gap-2">
                {!cameraActive ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="outline" className="flex-1">
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
              </div>

              {/* Camera Feed */}
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-64 bg-gray-900 rounded-lg ${cameraActive ? 'block' : 'hidden'}`}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!cameraActive && (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Camera not active</p>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4">
                      <div className="animate-spin h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm">Processing...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Entry */}
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="manual-entry">Manual Entry</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-entry"
                    placeholder="Enter registration ID or QR data"
                    value={manualEntry}
                    onChange={(e) => setManualEntry(e.target.value)}
                  />
                  <Button 
                    onClick={handleManualCheckIn}
                    disabled={!manualEntry.trim() || isProcessing}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Last Result */}
              {lastResult && (
                <Alert className={lastResult.success ? 'border-green-500' : 'border-red-500'}>
                  <div className="flex items-center">
                    {lastResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertDescription className="ml-2">
                      {lastResult.message}
                      {lastResult.registration && (
                        <div className="mt-1 text-sm">
                          <strong>{lastResult.registration.participantName}</strong> - {lastResult.registration.eventTitle}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Recent Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Recent Check-ins
              </CardTitle>
              <CardDescription>
                Latest participant check-ins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCheckIns.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No check-ins yet</p>
                  </div>
                ) : (
                  recentCheckIns.map((checkIn) => (
                    <div key={checkIn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{checkIn.participantName}</p>
                          <p className="text-xs text-gray-500">{checkIn.eventTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(checkIn.checkedInAt).toLocaleTimeString()}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {checkIn.status === 'checked_in' ? 'Checked In' : 'Already In'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}