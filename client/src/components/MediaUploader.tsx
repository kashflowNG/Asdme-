import { useState, useRef, useEffect } from "react";
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

      if (type === "video") {
        formData.append("startTime", startTime.toString());
        formData.append("endTime", endTime.toString());
      }

      // Get auth token from localStorage
      const token = localStorage.getItem("neropage_auth_token");
      
      const endpoint = type === "image" ? "/api/upload-image" : "/api/upload-video";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      onMediaUploaded(data.url);
      toast({ title: "Success", description: `${type === "image" ? "Image" : "Video"} uploaded!` });
      setFile(null);
      setPreview("");
    } catch (error) {
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

  const handleMouseMove = (e: MouseEvent) => {
    if (!timelineRef.current || (!isDraggingStart && !isDraggingEnd)) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;

    if (isDraggingStart) {
      setStartTime(Math.min(time, endTime - 0.1));
    } else if (isDraggingEnd) {
      setEndTime(Math.max(time, startTime + 0.1));
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
    };

    if (isDraggingStart || isDraggingEnd) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingStart, isDraggingEnd, duration, startTime, endTime, handleMouseMove]);

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

          {/* Timeline Trimmer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Trim Duration</Label>
              <div className="text-xs space-x-3 font-mono">
                <span className="text-cyan-400">{formatTime(startTime)}</span>
                <span className="text-gray-500">→</span>
                <span className="text-purple-400">{formatTime(endTime)}</span>
                <span className="text-gray-400">({formatTime(endTime - startTime)}s)</span>
              </div>
            </div>
            
            <div
              ref={timelineRef}
              onClick={handleTimelineClick}
              className="relative h-14 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 cursor-pointer hover:border-cyan-500/70 transition-colors group"
            >
              {/* Background segments */}
              <div className="absolute inset-0 rounded-lg overflow-hidden flex">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-700/30" />
                ))}
              </div>

              {/* Darkened regions (outside trim) */}
              <div
                className="absolute top-0 h-full bg-black/40"
                style={{ width: `${(startTime / duration) * 100}%` }}
              />
              <div
                className="absolute top-0 h-full bg-black/40"
                style={{ right: 0, width: `${100 - (endTime / duration) * 100}%` }}
              />

              {/* Progress bar */}
              <div
                className="absolute top-0 h-full bg-cyan-500/50 transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />

              {/* Trim region highlight */}
              <div
                className="absolute h-full border-l-2 border-r-2 border-cyan-400 bg-cyan-500/10 transition-all"
                style={{
                  left: `${(startTime / duration) * 100}%`,
                  right: `${100 - (endTime / duration) * 100}%`,
                }}
              />

              {/* Start handle */}
              <div
                onMouseDown={() => setIsDraggingStart(true)}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-10 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-sm cursor-col-resize hover:from-cyan-300 hover:to-cyan-400 shadow-lg transition-all ${
                  isDraggingStart ? "ring-2 ring-cyan-300 scale-110" : ""
                }`}
                style={{ left: `${(startTime / duration) * 100}%` }}
              />

              {/* End handle */}
              <div
                onMouseDown={() => setIsDraggingEnd(true)}
                className={`absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-sm cursor-col-resize hover:from-purple-300 hover:to-purple-400 shadow-lg transition-all ${
                  isDraggingEnd ? "ring-2 ring-purple-300 scale-110" : ""
                }`}
                style={{ right: `${100 - (endTime / duration) * 100}%` }}
              />

              {/* Current time indicator */}
              <div
                className="absolute top-0 w-1 h-full bg-white/80 rounded-full pointer-events-none transition-all"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex gap-2 text-xs">
              <div className="flex-1 p-2 rounded bg-gray-800/50 border border-gray-700">
                <p className="text-muted-foreground">Start</p>
                <p className="font-mono font-bold text-cyan-400">{formatTime(startTime)}</p>
              </div>
              <div className="flex-1 p-2 rounded bg-gray-800/50 border border-gray-700">
                <p className="text-muted-foreground">Duration</p>
                <p className="font-mono font-bold text-purple-400">{formatTime(endTime - startTime)}</p>
              </div>
              <div className="flex-1 p-2 rounded bg-gray-800/50 border border-gray-700">
                <p className="text-muted-foreground">End</p>
                <p className="font-mono font-bold text-cyan-400">{formatTime(endTime)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
