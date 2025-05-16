import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, Heart, Activity, ArrowRight } from "lucide-react";
import { axiosInstance } from "@/lib/auth-service";

export default function BiometricHRVCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heartRateData, setHeartRateData] = useState<any[]>([]);
  const [hrvScore, setHrvScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingMeasurement, setExistingMeasurement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Capture duration in seconds
  const captureDuration = 30;
  
  // Fetch existing HRV measurements on component mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would call your API
        // const response = await axiosInstance.get('/api/v1/biometrics/hrv');
        
        // Mock data for demonstration
        setTimeout(() => {
          const hasMeasurement = Math.random() > 0.5;
          if (hasMeasurement) {
            const mockData = {
              sdnn: Math.floor(Math.random() * 60) + 30,
              rmssd: Math.floor(Math.random() * 40) + 20,
              lf_hf_ratio: (Math.random() * 2) + 0.5,
              created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              hrvScore: Math.floor(Math.random() * 40) + 60
            };
            setExistingMeasurement(mockData);
            setHrvScore(mockData.hrvScore);
          }
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Failed to fetch existing HRV data:", err);
        setIsLoading(false);
      }
    };
    
    fetchExistingData();
  }, []);
  
  // Start the HRV measurement
  const startCapture = async () => {
    try {
      setError(null);
      setHeartRateData([]);
      setHrvScore(null);
      setProgress(0);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setIsCapturing(true);
        
        // Start measuring heart rate
        const startTime = Date.now();
        
        // Track raw RGB values over time
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
          
          // Get image data from center of frame (focusing on forehead area with better signal)
          const centerX = canvasRef.current!.width / 2;
          const centerY = canvasRef.current!.height / 3; // Upper third - forehead area
          const imageData = ctx.getImageData(
            centerX - 50, centerY - 50, 
            100, 100
          );
          
          // Calculate average green value (best channel for PPG)
          let greenSum = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            greenSum += imageData.data[i + 1]; // Green channel
          }
          const avgGreen = greenSum / (imageData.data.length / 4);
          
          // Store value
          rgbValues.push(avgGreen);
          
          // Update chart data every few frames
          if (frameCount % 5 === 0) {
            setHeartRateData(prev => [
              ...prev, 
              { time: elapsed.toFixed(1), value: avgGreen }
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
        
        animationRef.current = requestAnimationFrame(processFrame);
      }
    } catch (err: any) {
      setError(err.message || "Failed to access camera. Please check camera permissions.");
      setIsCapturing(false);
    }
  };
  
  const finishCapture = (rgbValues: number[], stream: MediaStream) => {
    // Stop all tracks from the stream
    stream.getTracks().forEach(track => track.stop());
    
    setIsCapturing(false);
    setProgress(100);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Calculate HRV (simplified algorithm)
    calculateHRV(rgbValues);
  };
  
  const calculateHRV = (rgbValues: number[]) => {
    try {
      // Apply bandpass filter to isolate heart rate frequency range (0.75-2.5Hz)
      const filteredValues = bandpassFilter(rgbValues);
      
      // Detrend the signal to remove slow drifts
      const detrendedValues = detrendSignal(filteredValues);
      
      // Find peaks (representing heartbeats)
      const peaks = findPeaks(detrendedValues);
      
      // Calculate time between peaks (RR intervals in samples)
      const rrIntervals = [];
      for (let i = 1; i < peaks.length; i++) {
        rrIntervals.push(peaks[i] - peaks[i-1]);
      }
      
      if (rrIntervals.length < 10) {
        throw new Error("Not enough heartbeats detected. Please try again in better lighting.");
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
      // This is a simplification - real calculation requires frequency domain analysis
      const lfHfRatio = sdnn / (rmssd + 0.01); // Avoid division by zero
      
      // Normalize to a 0-100 score
      // SDNN typically ranges from 20-150ms in healthy adults
      const sdnnContribution = Math.min(100, Math.max(0, (sdnn / 1.5) * 50));
      const rmssdContribution = Math.min(100, Math.max(0, (rmssd / 1.0) * 30));
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
      setError(err.message || "Could not calculate HRV. Please try again in better lighting.");
    }
  };
  
  // Signal processing functions
  
  // Bandpass filter to isolate heart rate frequency range
  const bandpassFilter = (values: number[]) => {
    // Simple moving average filter as a basic lowpass
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
    
    // High-pass filter by subtracting a more aggressive low-pass filter
    const highPassFilter = (data: number[], windowSize: number) => {
      const lowPass = lowPassFilter(data, windowSize);
      return data.map((val, i) => val - lowPass[i]);
    };
    
    // Apply low-pass to remove high-frequency noise
    const lowPassed = lowPassFilter(values, 3);
    
    // Apply high-pass to remove very low frequency trends
    return highPassFilter(lowPassed, 15);
  };
  
  // Detrend signal to remove slow drifts
  const detrendSignal = (values: number[]) => {
    // Linear detrending - remove the best-fit line
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    // Calculate sums for linear regression
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    
    // Calculate slope and intercept
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Subtract trend line from values
    return values.map((val, i) => val - (slope * i + intercept));
  };
  
  // Find peaks in the signal (heartbeats)
  const findPeaks = (values: number[]) => {
    const peaks = [];
    const windowSize = 10; // Look for local maxima in this window
    const threshold = calculateAdaptiveThreshold(values); // Dynamic threshold based on signal
    
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
  
  // Calculate adaptive threshold based on signal characteristics
  const calculateAdaptiveThreshold = (values: number[]) => {
    // Find signal statistics
    const max = Math.max(...values);
    const min = Math.min(...values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Threshold at 60% between mean and max
    return mean + (max - mean) * 0.6;
  };
  
  // Save HRV score to the user's profile
  const saveHrvScore = async (data: any) => {
    try {
      // In the actual implementation, this would call your API
      console.log("Saving HRV data:", data);
      // await axiosInstance.post('/api/v1/biometrics/hrv', data);
    } catch (err) {
      console.error("Failed to save HRV data:", err);
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
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Heart Rate Variability (HRV) Analysis
        </CardTitle>
        <CardDescription>
          Measure your heart rate variability to enhance compatibility matching
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
          <h3 className="font-medium mb-2">What is HRV?</h3>
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
          
          {/* Display area when not capturing */}
          {!isCapturing && !hrvScore && !existingMeasurement && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <Activity className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p className="mb-4 max-w-md">To measure your HRV, we need your camera to detect subtle changes 
                in facial blood flow. The process takes about 30 seconds.</p>
                <Button onClick={startCapture}>Start Measurement</Button>
              </div>
            </div>
          )}
          
          {/* Measurement button if we already have data */}
          {!isCapturing && existingMeasurement && !hrvScore && (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="text-center text-white">
                <Activity className="h-12 w-12 mx-auto mb-2 text-primary" />
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
                  Please remain still and face the camera
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