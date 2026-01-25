import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScreenCaptureOptions {
  sessionId: string;
  teamMemberId: string;
  minInterval?: number; // minimum seconds between captures
  maxInterval?: number; // maximum seconds between captures
}

export const useScreenCapture = (options: ScreenCaptureOptions | null) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const minInterval = options?.minInterval ?? 180; // 3 minutes default
  const maxInterval = options?.maxInterval ?? 600; // 10 minutes default

  const getRandomInterval = useCallback(() => {
    return Math.floor(Math.random() * (maxInterval - minInterval + 1) + minInterval) * 1000;
  }, [minInterval, maxInterval]);

  const captureScreenshot = useCallback(async () => {
    if (!stream || !options) return;

    try {
      const video = videoRef.current || document.createElement('video');
      videoRef.current = video;
      video.srcObject = stream;
      video.muted = true;
      
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.7);
      });

      if (!blob) return;

      // Upload to Supabase Storage
      const fileName = `${options.teamMemberId}/${options.sessionId}/${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('activity-screenshots')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Failed to upload screenshot:', uploadError);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('activity-screenshots')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('activity_screenshots')
        .insert({
          session_id: options.sessionId,
          team_member_id: options.teamMemberId,
          screenshot_url: urlData.publicUrl,
          captured_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Failed to save screenshot record:', dbError);
        return;
      }

      setScreenshotCount((prev) => prev + 1);
      setLastCaptureTime(new Date());
      console.log('Screenshot captured successfully');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  }, [stream, options]);

  const scheduleNextCapture = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }

    const nextInterval = getRandomInterval();
    console.log(`Next screenshot in ${Math.round(nextInterval / 1000)} seconds`);
    
    intervalRef.current = setTimeout(async () => {
      await captureScreenshot();
      scheduleNextCapture();
    }, nextInterval);
  }, [captureScreenshot, getRandomInterval]);

  const startCapture = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCapturing(true);
      
      // Handle when user stops sharing
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopCapture();
        toast.info('Screen sharing stopped');
      });

      toast.success('Screen capture started - screenshots will be taken at random intervals');
      
      // Take first screenshot after a short delay
      setTimeout(async () => {
        await captureScreenshot();
        scheduleNextCapture();
      }, 5000);

      return true;
    } catch (error) {
      console.error('Failed to start screen capture:', error);
      if ((error as Error).name === 'NotAllowedError') {
        toast.error('Screen sharing permission denied');
      } else {
        toast.error('Failed to start screen capture');
      }
      return false;
    }
  }, [captureScreenshot, scheduleNextCapture]);

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  // Update stream reference for capture function
  useEffect(() => {
    if (stream && isCapturing) {
      // Re-setup video element when stream changes
      const video = videoRef.current || document.createElement('video');
      videoRef.current = video;
      video.srcObject = stream;
    }
  }, [stream, isCapturing]);

  return {
    isCapturing,
    startCapture,
    stopCapture,
    screenshotCount,
    lastCaptureTime,
    stream,
  };
};

export const useSessionScreenshots = (sessionId?: string) => {
  const [screenshots, setScreenshots] = useState<Array<{
    id: string;
    screenshot_url: string;
    captured_at: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setScreenshots([]);
      return;
    }

    const fetchScreenshots = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activity_screenshots')
        .select('id, screenshot_url, captured_at')
        .eq('session_id', sessionId)
        .order('captured_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch screenshots:', error);
      } else {
        setScreenshots(data || []);
      }
      setIsLoading(false);
    };

    fetchScreenshots();
  }, [sessionId]);

  return { screenshots, isLoading };
};
