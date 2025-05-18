// src/components/biometrics/biometric-finger-hrv-capture.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Heart, Activity, ArrowRight, Smartphone } from "lucide-react";
import { BiometricsService, CompatibilityService } from '@/lib/api-services';

export default function BiometricHRVCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heartRateData, setHeartRateData] = useState<any[]>([]);
  const [hrvScore, setHrvScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingMeasurement, setExistingMeasurement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');
  const [showInstructions, setShowInstructions] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Capture duration in seconds
  const captureDuration = 30;
  
  // Detect device type on mount
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setDeviceType(isMobile ? 'mobile' : 'desktop');
  }, []);
  
  // Fetch existing HRV measurements on component mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        const response = await BiometricsService.getHrvData();
        
        if (response.measurements && response.measurements.length > 0) {
          const latestMeasurement = response.measurements[0];
          const hrvData = latestMeasurement.measurement_value;
          
          setExistingMeasurement({
            sdnn: hrvData.sdnn,
            rmssd: hrvData.rmssd,
            lf_hf_ratio: hrvData.lf_hf_ratio,
            hrvScore: hrvData.hrv_score,
            created_at: latestMeasurement.created_at
          });
          
          setHrvScore(hrvData.hrv_score);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch existing HRV data:", err);
        setIsLoading(false);
      }
    };
    
    fetchExistingData();
  }, []);
  
  // Start the HRV measurement with finger on camera
  const startCapture = async () => {
    try {
      setError(null);
      setHeartRateData([]);
      setHrvScore(null);
      setProgress(0);
      setShowInstructions(false);
      
      // Request camera access with flash enabled for mobile
      const constraints = {
        video: {
          facingMode: deviceType === 'mobile' ? 'environment' : 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setIsCapturing(true);
        
        // Start measuring heart rate
        const startTime = Date.now();
        
        // Track raw RGB values over time - focusing on red channel for finger PPG
        const rgbValues: number[] = [];
        let frameCount = 0;
        
        const processFrame = () => {
          const ctx = canvasRef.current?.getContext('2d');
          if (!ctx || !videoRef.current) return;
          
          // Calculate elapsed time
          const elapsed = (Date.now() - startTime) / 1000;
          const newProgress = Math.min(100, (elapsed / captureDuration) * 100);
          setProgress(newProgress);
          
          // Draw current video frame to canvas
          ctx.drawImage(
            videoRef.current, 
            0, 0, 
            canvasRef.current!.width, 
            canvasRef.current!.height
          );
          
          // Get image data from center of frame (focusing on the red channel for finger PPG)
          const centerX = canvasRef.current!.width / 2;
          const centerY = canvasRef.current!.height / 2;
          const imageData = ctx.getImageData(
            centerX - 50, centerY - 50, 
            100, 100
          );
          
          // Calculate average red value (best channel for finger PPG)
          let redSum = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            redSum += imageData.data[i]; // Red channel
          }
          const avgRed = redSum / (imageData.data.length / 4);
          
          // Store value
          rgbValues.push(avgRed);
          
          // Update chart data every few frames
          if (frameCount % 5 === 0) {
            setHeartRateData(prev => [
              ...prev, 
              { time: elapsed.toFixed(1), value: avgRed }
            ].slice(-20)); // Keep only recent data for visualization
          }
          
          frameCount++;
          
          // Continue or finish
          if (elapsed < captureDuration) {
            animationRef.current = requestAnimationFrame(processFrame);
          } else {
            finishCapture(rgbValues, stream);
          }
        };
        
        // Allow time for user to place finger on camera
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(processFrame);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to access camera. Please check camera permissions.");
      setIsCapturing(false);
      setShowInstructions(true);
    }
  };
  
  const finishCapture = (rgbValues: number[], stream: MediaStream) => {
    // Stop all tracks from the stream
    stream.getTracks().forEach(track => track.stop());
    
    setIsCapturing(false);
    setProgress(100);
    setShowInstructions(true);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Calculate HRV (optimized for finger PPG)
    calculateHRV(rgbValues);
  };
  
  const calculateHRV = (rgbValues: number[]) => {
    try {
      // Apply stronger bandpass filter for finger PPG (more robust against movement)
      const filteredValues = bandpassFilter(rgbValues, 5, 30); // Wider window for finger PPG
      
      // Detrend the signal with improved algorithm for finger measurements
      const detrendedValues = detrendSignal(filteredValues);
      
      // Find peaks with lower threshold (finger PPG typically has stronger signal)
      const peaks = findPeaks(detrendedValues, 0.4); // Lower threshold ratio
      
      // Calculate time between peaks (RR intervals in samples)
      const rrIntervals = [];
      for (let i = 1; i < peaks.length; i++) {
        rrIntervals.push(peaks[i] - peaks[i-1]);
      }
      
      if (rrIntervals.length < 10) {
        throw new Error("Not enough heartbeats detected. Make sure your finger is covering the camera lens and flash.");
      }
      
      // Calculate SDNN - Standard Deviation of NN intervals
      const mean = rrIntervals.reduce((sum, val) => sum + val, 0) / rrIntervals.length;
      const variance = rrIntervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / rrIntervals.length;
      const sdnn = Math.sqrt(variance);
      
      // Calculate RMSSD - Root Mean Square of Successive Differences
      let sumSquaredDifferences = 0;
      for (let i = 1; i < rrIntervals.length; i++) {
        const diff = rrIntervals[i] - rrIntervals[i-1];
        sumSquaredDifferences += diff * diff;
      }
      const rmssd = Math.sqrt(sumSquaredDifferences / (rrIntervals.length - 1));
      
      // Calculate approximate LF/HF ratio from time domain measures
      const lfHfRatio = sdnn / (rmssd + 0.01); // Avoid division by zero
      
      // Normalize to a 0-100 score with calibration for finger PPG
      // Finger PPG typically gives stronger signals, so we adjust the scaling factors
      const sdnnContribution = Math.min(100, Math.max(0, (sdnn / 2.0) * 50));
      const rmssdContribution = Math.min(100, Math.max(0, (rmssd / 1.5) * 30));
      const ratioContribution = Math.min(100, Math.max(0, (1 / (Math.abs(lfHfRatio - 1.5) + 0.5)) * 20));
      
      const normalizedScore = Math.round(sdnnContribution + rmssdContribution + ratioContribution);
      
      setHrvScore(normalizedScore);
      
      // Create measurement data object
      const measurementData = {
        sdnn: Math.round(sdnn * 10) / 10, // Convert to milliseconds and round to 1 decimal
        rmssd: Math.round(rmssd * 10) / 10,
        lf_hf_ratio: Math.round(lfHfRatio * 100) / 100,
        hrvScore: normalizedScore
      };
      
      // Save the HRV score to the user's profile
      saveHrvScore(measurementData);
      
      // Update existing measurement
      setExistingMeasurement({
        ...measurementData,
        created_at: new Date().toISOString()
      });
      
    } catch (err: any) {
      setError(err.message || "Could not calculate HRV. Please try again and make sure your finger fully covers the camera.");
    }
  };
  
  // Improved signal processing functions optimized for finger PPG
  
  // Bandpass filter with configurable window sizes for better finger PPG detection
  const bandpassFilter = (values: number[], lowPassWindow: number = 3, highPassWindow: number = 15) => {
    // Enhanced moving average filter with adjustable window size
    const lowPassFilter = (data: number[], windowSize: number) => {
      return data.map((val, i, arr) => {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - windowSize); j <= Math.min(arr.length - 1, i + windowSize); j++) {
          sum += arr[j];
          count++;
        }
        return sum / count;
      });
    };
    
    // Improved high-pass filter with adjustable window
    const highPassFilter = (data: number[], windowSize: number) => {
      const lowPass = lowPassFilter(data, windowSize);
      return data.map((val, i) => val - lowPass[i]);
    };
    
    // Apply low-pass to remove high-frequency noise (finger movement artifacts)
    const lowPassed = lowPassFilter(values, lowPassWindow);
    
    // Apply high-pass to remove very low frequency trends (lighting changes, pressure changes)
    return highPassFilter(lowPassed, highPassWindow);
  };
  
  // Enhanced detrending specifically calibrated for finger PPG signals
  const detrendSignal = (values: number[]) => {
    // Polynomial detrending for better handling of finger pressure changes
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    
    // Calculate polynomial coefficients (quadratic fit works better for finger PPG)
    const xSum = x.reduce((sum, val) => sum + val, 0);
    const x2Sum = x.reduce((sum, val) => sum + val * val, 0);
    const x3Sum = x.reduce((sum, val) => sum + val * val * val, 0);
    const x4Sum = x.reduce((sum, val) => sum + val * val * val * val, 0);
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xySum = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const x2ySum = x.reduce((sum, val, i) => sum + val * val * values[i], 0);
    
    // Matrix determinant
    const det = x4Sum * (x2Sum * n - xSum * xSum) - 
                x3Sum * (x3Sum * n - xSum * x2Sum) + 
                x2Sum * (x3Sum * xSum - x2Sum * x2Sum);
    
    // Calculate coefficients
    const a = (x2ySum * (x2Sum * n - xSum * xSum) - 
              xySum * (x3Sum * n - xSum * x2Sum) + 
              ySum * (x3Sum * xSum - x2Sum * x2Sum)) / det;
              
    const b = (x4Sum * (xySum * n - ySum * xSum) - 
              x3Sum * (x2ySum * n - ySum * x2Sum) + 
              x2Sum * (x2ySum * xSum - xySum * x2Sum)) / det;
              
    const c = (x4Sum * (x2Sum * ySum - xSum * xySum) - 
              x3Sum * (x3Sum * ySum - xSum * x2ySum) + 
              x2Sum * (x3Sum * xySum - x2Sum * x2ySum)) / det;
    
    // Remove quadratic trend
    return values.map((val, i) => val - (a * i * i + b * i + c));
  };
  
  // Improved peak detection for finger PPG with adaptive thresholding
  const findPeaks = (values: number[], thresholdRatio: number = 0.6) => {
    const peaks = [];
    const windowSize = 10; // Look for local maxima in this window
    const threshold = calculateAdaptiveThreshold(values, thresholdRatio);
    
    for (let i = windowSize; i < values.length - windowSize; i++) {
      let isLocalMax = true;
      
      // Check if current point is higher than all points in window
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        if (j !== i && values[j] >= values[i]) {
          isLocalMax = false;
          break;
        }
      }
      
      // Add as peak if it's a local maximum and above threshold
      if (isLocalMax && values[i] > threshold) {
        peaks.push(i);
        
        // Skip ahead to avoid detecting the same peak twice
        i += Math.floor(windowSize / 2);
      }
    }
    
    return peaks;
  };
  
  // Improved adaptive threshold calculation for finger PPG
  const calculateAdaptiveThreshold = (values: number[], ratio: number = 0.6) => {
    // Find signal statistics with outlier removal for more robust threshold
    const sortedValues = [...values].sort((a, b) => a - b);
    const lowerIdx = Math.floor(sortedValues.length * 0.1); // Remove bottom 10%
    const upperIdx = Math.floor(sortedValues.length * 0.9); // Remove top 10%
    const filteredValues = sortedValues.slice(lowerIdx, upperIdx);
    
    const min = Math.min(...filteredValues);
    const max = Math.max(...filteredValues);
    const mean = filteredValues.reduce((sum, val) => sum + val, 0) / filteredValues.length;
    
    // Calculate threshold between mean and max, adjusted by ratio parameter
    return mean + (max - mean) * ratio;
  };
  
  // Save HRV score to the user's profile
  const saveHrvScore = async (data: any) => {
    try {
      // Add more detailed logging
      console.log("Saving HRV measurement data:", data);
      
      // Make the API call
      await BiometricsService.saveHrvMeasurement(data);
      
      // Update existing measurement state
      setExistingMeasurement({
        ...data,
        created_at: new Date().toISOString()
      });
      
      // Force refresh of compatibility data by triggering a compatibility matrix refresh
      // This helps ensure the UI shows updated compatibility with the new biometric data
      try {
        // Refresh compatibility matrix to reflect new biometric dimension
        const refreshedMatrix = await CompatibilityService.getMatrix();
        console.log("Updated compatibility matrix with new biometric data:", refreshedMatrix);
        
        // You could dispatch an event or use a shared state management system
        // to notify other components about the updated compatibility
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('biometric-compatibility-updated', {
            detail: { timestamp: new Date().getTime() }
          }));
        }
      } catch (refreshErr) {
        console.error("Error refreshing compatibility after biometric update:", refreshErr);
      }
      
      toast.success("HRV measurement saved successfully!");
    } catch (err) {
      console.error("Failed to save HRV data:", err);
      toast.error("Failed to save measurement. Please try again.");
    }
  };
  
  // Cancel capture
  const cancelCapture = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setIsCapturing(false);
    setProgress(0);
    setShowInstructions(true);
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Interpret HRV score
  const getHrvInterpretation = (score: number) => {
    if (score >= 85) return "Excellent HRV indicates strong emotional resilience and stress recovery";
    if (score >= 70) return "Good HRV suggests healthy autonomic balance and effective stress adaptation";
    if (score >= 50) return "Moderate HRV indicates adequate stress response and recovery capacity";
    return "Lower HRV may indicate higher stress levels or reduced autonomic flexibility";
  };
  
  // Get biometric compatibility insight
  const getCompatibilityInsight = (score: number) => {
    if (score >= 85) {
      return "Your excellent HRV pattern suggests you may be compatible with partners who have complementary stress response styles, creating a balanced relationship dynamic.";
    }
    if (score >= 70) {
      return "Your good HRV balance indicates potential compatibility with both similar and complementary autonomic patterns in relationships.";
    }
    if (score >= 50) {
      return "Your moderate HRV suggests you may benefit from partners with calming autonomic patterns that help regulate shared stress responses.";
    }
    return "Your current HRV pattern indicates you may find most compatibility with partners who have stabilizing autonomic patterns, helping create mutual regulation.";
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Heart Rate Variability (HRV) Analysis
          </CardTitle>
          <CardDescription>
            Measuring your heart rate variability to enhance compatibility matching
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-t-primary border-muted rounded-full animate-spin"></div>
            <p className="text-muted-foreground text-sm">Loading your biometric data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render instructions based on device type
  const renderInstructions = () => {
    if (deviceType === 'mobile') {
      return (
        <div className="space-y-3">
          <h3 className="font-medium">How to Take a Measurement on Mobile</h3>
          <ol className="space-y-2 ml-5 list-decimal">
            <li className="text-sm">Allow camera access when prompted</li>
            <li className="text-sm">When the camera opens, <strong>gently place your fingertip over both the camera lens and flash</strong></li>
            <li className="text-sm">Apply light pressure - enough to cover the lens but not too hard</li>
            <li className="text-sm">Keep your finger still for the entire 30-second measurement</li>
            <li className="text-sm">Make sure your finger isn't blocking the entire camera view</li>
          </ol>
          <div className="bg-amber-50 p-3 rounded-md border border-amber-100 mt-3">
            <p className="text-sm text-amber-800 flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              For best results, use in a well-lit area, but don't allow direct sunlight to hit your finger or camera.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <h3 className="font-medium">How to Take a Measurement on Desktop</h3>
          <ol className="space-y-2 ml-5 list-decimal">
            <li className="text-sm">Allow camera access when prompted</li>
            <li className="text-sm">When the camera opens, <strong>place your fingertip directly on your webcam lens</strong></li>
            <li className="text-sm">Apply gentle pressure to cover the lens completely</li>
            <li className="text-sm">If your webcam has a light, make sure your finger covers both the lens and light</li>
            <li className="text-sm">Keep your finger still for the entire 30-second measurement</li>
          </ol>
          <div className="bg-amber-50 p-3 rounded-md border border-amber-100 mt-3">
            <p className="text-sm text-amber-800 flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              Desktop measurements may require a few attempts to get right. For best results, try using a mobile device instead.
            </p>
          </div>
        </div>
      );
    }
  };
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Heart Rate Variability (HRV) Analysis
        </CardTitle>
        <CardDescription>
          Measure your heart rate variability with your {deviceType === 'mobile' ? 'phone camera' : 'webcam'} to enhance compatibility matching
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="border rounded-md p-4 bg-muted/30">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            What is HRV?
          </h3>
          <p className="text-sm text-muted-foreground">
            Heart Rate Variability (HRV) is the variation in time between heartbeats. 
            It reflects how your autonomic nervous system responds to stress and emotions.
            Partners with compatible HRV patterns often experience better emotional synchronization
            and relationship satisfaction.
          </p>
        </div>
        
        {/* Existing measurement display */}
        {existingMeasurement && !isCapturing && (
          <div className="border rounded-md p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-medium">Your Current HRV Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Last measured on {formatDate(existingMeasurement.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16">
                  <svg className="w-16 h-16">
                    <circle
                      className="text-muted-foreground/20"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="25"
                      cx="32"
                      cy="32"
                    />
                    <circle
                      className="text-primary"
                      strokeWidth="6"
                      strokeDasharray={157}
                      strokeDashoffset={157 - (157 * existingMeasurement.hrvScore) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="25"
                      cx="32"
                      cy="32"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{existingMeasurement.hrvScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">HRV Score</p>
                  <p className="text-xs text-muted-foreground">{getHrvInterpretation(existingMeasurement.hrvScore)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Compatibility Insight</h4>
              <p className="text-sm text-muted-foreground">
                {getCompatibilityInsight(existingMeasurement.hrvScore)}
              </p>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">SDNN</p>
                <p className="font-medium">{existingMeasurement.sdnn} ms</p>
              </div>
              <div className="p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">RMSSD</p>
                <p className="font-medium">{existingMeasurement.rmssd} ms</p>
              </div>
              <div className="p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">LF/HF</p>
                <p className="font-medium">{existingMeasurement.lf_hf_ratio}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="aspect-video relative bg-black rounded-md overflow-hidden">
          {/* Hidden video element used for capture */}
          <video 
            ref={videoRef} 
            className={`absolute inset-0 w-full h-full object-cover ${isCapturing ? 'block' : 'hidden'}`} 
            muted 
            playsInline
          />
          
          {/* Canvas for processing */}
          <canvas 
            ref={canvasRef} 
            width={640} 
            height={360} 
            className="hidden" 
          />
          
          {/* Instructions when not measuring */}
          {!isCapturing && !hrvScore && showInstructions && (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800 p-6">
              <div className="text-center text-white max-w-md">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-3">
                  Finger PPG Heart Rate Measurement
                </h3>
                {renderInstructions()}
                <Button onClick={startCapture} className="mt-5">
                  Start Measurement
                </Button>
              </div>
            </div>
          )}
          
          {/* Start button if we already have data and not showing instructions */}
          {!isCapturing && existingMeasurement && !hrvScore && !showInstructions && (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="text-center text-white">
                <Smartphone className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p className="mb-4 max-w-md">You already have HRV data, but you can take a new measurement to update your biometric profile.</p>
                <Button onClick={startCapture}>New Measurement</Button>
              </div>
            </div>
          )}
          
          {/* Capturing state */}
          {isCapturing && (
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <div>
                <span className="bg-white/10 text-white px-2 py-1 rounded-md text-xs backdrop-blur-sm">
                  <span className="animate-pulse mr-1 inline-block h-2 w-2 rounded-full bg-red-500"></span>
                  Recording
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-white text-center">
                  {deviceType === 'mobile' 
                    ? "Keep your finger gently covering the camera and flash" 
                    : "Keep your finger gently covering the webcam lens"}
                </p>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-center">
                  <Button variant="destructive" size="sm" onClick={cancelCapture}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Results visualization for new measurement */}
          {!isCapturing && hrvScore !== null && (
            <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-4">
              <div className="relative h-32 w-32 mb-4">
                <svg className="w-32 h-32">
                  <circle
                    className="text-muted-foreground/20"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="8"
                    strokeDasharray={350}
                    strokeDashoffset={350 - (350 * hrvScore) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">{hrvScore}</span>
                  <span className="text-sm text-muted-foreground">HRV Score</span>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <h3 className="font-medium">New Measurement Results</h3>
                <p className="text-sm text-muted-foreground">
                  {getHrvInterpretation(hrvScore)}
                </p>
              </div>
              
              {heartRateData.length > 0 && (
                <div className="w-full h-32 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heartRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ef4444" 
                        dot={false} 
                        name="Blood Flow Signal" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Compatibility section */}
        <div className="border rounded-md p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <h3 className="font-medium flex items-center mb-2">
            <ArrowRight className="h-4 w-4 mr-1" />
            Biometric Compatibility
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your HRV data is used to calculate physiological compatibility with potential connections.
            This adds an objective dimension to your compatibility profile that isn't based on self-reporting.
          </p>
          <p className="text-sm">
            <strong>Benefits:</strong> Research suggests that compatible autonomic nervous system patterns 
            between partners are associated with better emotional co-regulation, conflict resolution,
            and relationship satisfaction.
          </p>
        </div>
        
        {/* Tips for better measurement */}
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Tips for Better Measurements</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Take measurements when relaxed, not immediately after exercise or stress</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <span>For mobile devices, ensure your battery is charged (flash uses significant power)</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Try to breathe normally during measurement; avoid holding your breath</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <span>If measurement fails, try adjusting finger pressure or position</span>
            </li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isCapturing && (
          <Button 
            onClick={startCapture}
            variant={existingMeasurement || hrvScore ? "outline" : "default"}
          >
            {existingMeasurement || hrvScore ? "Take New Measurement" : "Start Measurement"}
          </Button>
        )}
        <div className="text-xs text-muted-foreground">
          Your privacy is protected. All processing happens locally on your device.
        </div>
      </CardFooter>
    </Card>
  );
}