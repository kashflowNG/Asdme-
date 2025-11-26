import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Play, Pause, X } from "lucide-react";

interface VideoTrimmerProps {
  onVideoTrimmed: (url: string) => void;
  initialUrl?: string;
}

export function VideoTrimmer({ onVideoTrimmed, initialUrl }: VideoTrimmerProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>(initialUrl || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (videoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(videoFile);
    }
  }, [videoFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({ title: "Error", description: "File too large (max 100MB)" });
        return;
      }
      setVideoFile(file);
    }
  };

  const handleMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndTime(Math.min(5, videoDuration));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
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

  const handleTrimAndUpload = async () => {
    if (!videoFile) {
      toast({ title: "Error", description: "Please select a video file" });
      return;
    }

    if (endTime - startTime !== 5) {
      toast({ title: "Error", description: "Clip must be exactly 5 seconds" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("startTime", startTime.toString());
      formData.append("endTime", endTime.toString());

      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onVideoTrimmed(data.url);
      toast({ title: "Success", description: "Video uploaded and trimmed!" });
      setVideoFile(null);
      setVideoPreview("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload video" });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="video-upload">Upload Video</Label>
        <Input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          MP4, WebM, or OGG. Max 100MB. Will be trimmed to 5 seconds.
        </p>
      </div>

      {videoPreview && (
        <div className="space-y-4">
          <video
            ref={videoRef}
            src={videoPreview}
            onLoadedMetadata={handleMetadata}
            onTimeUpdate={handleTimeUpdate}
            className="w-full rounded-lg bg-black"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
                className="gap-2"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <span className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Timeline with 5-second selection */}
            <div className="space-y-2">
              <Label className="text-sm">Select 5-Second Clip</Label>
              <div className="bg-gray-800 rounded p-3 space-y-3">
                {/* Start Time */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs">Start: {formatTime(startTime)}</span>
                    <span className="text-xs">End: {formatTime(endTime)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="range"
                      min="0"
                      max={Math.max(0, duration - 5)}
                      step="0.1"
                      value={startTime}
                      onChange={(e) => {
                        const newStart = parseFloat(e.target.value);
                        setStartTime(newStart);
                        setEndTime(newStart + 5);
                      }}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Duration: {formatTime(endTime - startTime)}
                  </p>
                </div>
              </div>

              {/* Visual timeline */}
              <div className="relative h-8 bg-gray-900 rounded border border-gray-700">
                {/* Start marker */}
                <div
                  className="absolute top-0 h-full w-1 bg-green-500 rounded cursor-col-resize"
                  style={{ left: `${(startTime / duration) * 100}%` }}
                  title="Start"
                />
                {/* End marker */}
                <div
                  className="absolute top-0 h-full w-1 bg-red-500 rounded cursor-col-resize"
                  style={{ left: `${(endTime / duration) * 100}%` }}
                  title="End"
                />
                {/* Selection highlight */}
                <div
                  className="absolute top-0 h-full bg-blue-500/20 border-l-2 border-r-2 border-blue-500"
                  style={{
                    left: `${(startTime / duration) * 100}%`,
                    right: `${100 - (endTime / duration) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview("");
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleTrimAndUpload}
                disabled={isUploading || endTime - startTime !== 5}
                className="gap-2 flex-1"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? "Uploading..." : "Trim & Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
