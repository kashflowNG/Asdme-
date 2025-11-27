import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Play, Pause, Trash2 } from "lucide-react";

interface MediaUploaderProps {
  type: "image" | "video";
  onMediaUploaded: (url: string) => void;
  initialUrl?: string;
  maxSize?: number;
}

export function MediaUploader({ type, onMediaUploaded, initialUrl, maxSize = 100 }: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxBytes = maxSize * 1024 * 1024;
      if (selectedFile.size > maxBytes) {
        toast({ title: "Error", description: `File too large (max ${maxSize}MB)` });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setDuration(duration);
      setEndTime(duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = startTime;
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    videoRef.current.currentTime = time;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select a file" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append(type, file);

      let endpoint = type === "image" ? "/api/upload-image" : "/api/upload-video";
      
      // For videos, add trim times as query parameters
      if (type === "video") {
        const params = new URLSearchParams();
        params.append("startTime", String(startTime));
        params.append("endTime", String(endTime));
        endpoint += "?" + params.toString();
        console.log("Uploading video with trim:", { startTime, endTime, endpoint });
      }

      console.log("Fetch starting:", { endpoint, fileSize: file.size });
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log("Fetch response:", { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.error || "Upload failed");
        } catch {
          throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log("Upload success:", data);
      onMediaUploaded(data.url);
      toast({ title: "Success", description: `${type === "image" ? "Image" : "Video"} uploaded with trim ${formatTime(startTime)} → ${formatTime(endTime)}!` });
      setFile(null);
      setPreview("");
      setStartTime(0);
      setEndTime(0);
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Error", description: `Failed to upload ${type}: ${error instanceof Error ? error.message : "Unknown error"}` });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || (!isDraggingStart && !isDraggingEnd)) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;

    if (isDraggingStart && time < endTime - 0.1) {
      setStartTime(time);
    } else if (isDraggingEnd && time > startTime + 0.1) {
      setEndTime(time);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
    };

    if (isDraggingStart || isDraggingEnd) {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDraggingStart, isDraggingEnd]);

  if (type === "image") {
    return (
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-upload">Upload Image</Label>
          <div className="flex gap-2">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
            />
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          {preview && (
            <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/30 mt-3">
              <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
              <button
                onClick={() => { setFile(null); setPreview(""); }}
                className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="video-upload">Upload & Trim Video (CapCut Style)</Label>
        <div className="flex gap-2">
          <Input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="flex-1"
          />
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {preview && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/30 bg-black">
            <video
              ref={videoRef}
              src={preview}
              onLoadedMetadata={handleMetadata}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  // Stop at endTime
                  if (videoRef.current.currentTime >= endTime) {
                    videoRef.current.pause();
                    setIsPlaying(false);
                  }
                }
              }}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={togglePlay}
              className="absolute bottom-2 left-2 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Timeline Trimmer - Simplified */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Trim Duration</Label>
              <div className="text-xs space-x-2 font-mono">
                <span className="text-cyan-400">{formatTime(startTime)}</span>
                <span className="text-gray-500">→</span>
                <span className="text-purple-400">{formatTime(endTime)}</span>
              </div>
            </div>

            {/* Start time slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Start: {formatTime(startTime)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={startTime}
                onChange={(e) => {
                  const newStart = parseFloat(e.target.value);
                  if (newStart < endTime - 0.1) {
                    setStartTime(newStart);
                    if (videoRef.current) videoRef.current.currentTime = newStart;
                  }
                }}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* End time slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">End: {formatTime(endTime)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={endTime}
                onChange={(e) => {
                  const newEnd = parseFloat(e.target.value);
                  if (newEnd > startTime + 0.1) {
                    setEndTime(newEnd);
                    if (videoRef.current) videoRef.current.currentTime = newEnd;
                  }
                }}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Duration display */}
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
              <p className="text-muted-foreground text-xs mb-1">Trim Duration</p>
              <p className="font-mono font-bold text-lg text-green-400">{formatTime(endTime - startTime)}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
