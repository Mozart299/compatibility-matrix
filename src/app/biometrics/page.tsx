"use client";

import React, { useState } from 'react';
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BiometricHRVCapture from '@/components/biometrics/biometric-hrv-capture';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, Activity, Brain, Wand2 } from "lucide-react";
import Link from "next/link";

export default function BiometricsPage() {
  const [activeTab, setActiveTab] = useState('hrv');

  return (
    <AppLayout>
      <div className="container py-6 sm:py-8 md:py-10">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Biometric Analysis</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Add objective physiological data to enhance your compatibility matches
              </p>
            </div>
          </div>
        </div>

        <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Objective Compatibility Dimension</AlertTitle>
          <AlertDescription>
            Unlike other dimensions that rely on self-reporting, biometric data provides an objective 
            measure of compatibility based on your physiological responses. Research suggests that 
            compatible autonomic nervous system patterns between partners can lead to more satisfying 
            relationships.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="hrv" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="hrv" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>Heart Rate Variability</span>
            </TabsTrigger>
            <TabsTrigger value="future" className="flex items-center gap-1" disabled>
              <Brain className="h-4 w-4" />
              <span>Future Metrics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hrv">
            <BiometricHRVCapture />
          </TabsContent>

          <TabsContent value="future">
            <Card>
              <CardHeader>
                <CardTitle>Future Biometric Measurements</CardTitle>
                <CardDescription>
                  Additional physiological measurements coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                This feature is currently in development. Stay tuned for more biometric compatibility dimensions.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-500" />
                How Biometric Compatibility Works
              </CardTitle>
              <CardDescription>
                Understanding the science behind physiological compatibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                While traditional compatibility assessments rely on self-reported preferences and 
                behaviors, biometric compatibility analyzes physiological patterns that you may 
                not even be consciously aware of.
              </p>
              
              <h3 className="font-medium text-lg mt-2">The Science</h3>
              <p>
                Research in relationship psychology has shown that partners with compatible or 
                complementary autonomic nervous system patterns often experience:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>More effective emotional co-regulation during stress</li>
                <li>Improved conflict resolution through physiological synchronization</li>
                <li>Higher relationship satisfaction and longevity</li>
                <li>Enhanced emotional intimacy and understanding</li>
              </ul>
              
              <h3 className="font-medium text-lg mt-4">How We Measure Compatibility</h3>
              <p>
                Our biometric compatibility algorithm analyzes several key aspects of HRV:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>SDNN Complementarity (40%):</strong> How well your autonomic flexibility patterns balance each other</li>
                <li><strong>LF/HF Ratio Compatibility (40%):</strong> How your sympathetic/parasympathetic nervous system balance complements your partner's</li>
                <li><strong>Overall HRV Profile (20%):</strong> The general adaptability and resilience of your combined autonomic profiles</li>
              </ul>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium text-lg">Privacy & Accuracy</h3>
                <p className="text-sm text-muted-foreground">
                  All biometric processing happens locally on your device. Only the calculated metrics are 
                  transmitted to our servers - never your raw video data. While webcam-based HRV measurement 
                  is not as accurate as medical-grade devices, it provides a useful approximation for 
                  compatibility purposes.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>
                Why biometric compatibility matters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Objective Measurement</h4>
                    <p className="text-xs text-muted-foreground">Not influenced by self-perception biases or social desirability</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Unconscious Patterns</h4>
                    <p className="text-xs text-muted-foreground">Reveals compatibility factors you might not consciously recognize</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Improved Predictions</h4>
                    <p className="text-xs text-muted-foreground">Enhances overall compatibility assessment accuracy by 15-20%</p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Personalized Insights</h4>
                    <p className="text-xs text-muted-foreground">Receive advice on relationship dynamics based on your physiological patterns</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-6 pt-4 border-t">
                <Button className="w-full" asChild>
                  <Link href="/matrix">View Compatibility Matrix</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Is my biometric data private?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. All video processing happens locally on your device. Only the calculated 
                    HRV metrics are sent to our servers, never the raw video data. You can delete 
                    your biometric data at any time.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">How accurate is webcam-based HRV measurement?</h3>
                  <p className="text-sm text-muted-foreground">
                    While not as precise as medical-grade devices, studies show that webcam 
                    photoplethysmography (PPG) can detect HRV with approximately 80-85% accuracy 
                    compared to standard ECG measurements, which is sufficient for compatibility 
                    assessment purposes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Can I improve the accuracy of my measurement?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. For best results, ensure good lighting on your face, remain still during 
                    the measurement, and sit in a quiet, relaxed state. Measurements taken during 
                    high stress or after physical exertion will reflect those temporary states.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">How often should I update my HRV measurement?</h3>
                  <p className="text-sm text-muted-foreground">
                    While HRV has both trait-like stable components and state-based variations,
                    we recommend taking a new measurement every 4-8 weeks for the most accurate 
                    compatibility matching, or after significant lifestyle changes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">What if my camera doesn't work?</h3>
                  <p className="text-sm text-muted-foreground">
                    If you encounter technical issues, ensure your browser has camera permissions 
                    enabled and try in good lighting conditions. If problems persist, you can still 
                    benefit from the other compatibility dimensions while we work on alternative 
                    biometric measurement methods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}