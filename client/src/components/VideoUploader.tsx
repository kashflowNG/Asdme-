import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Play, Pause, Video as VideoIcon } from "lucide-react";

interface VideoUploaderProps {
  onVideoUploaded: (url: string) => void;
  initialUrl?: string;
  maxSize?: number;
}

export function VideoUploader({ onVideoUploaded, initialUrl, maxSize = 500 }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoInfo, setVideoInfo] = useState<{ duration: string; size: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File) => {
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      toast({ title: "Error", description: `File too large (max ${maxSize}MB)` });
      return false;
    }
    if (!file.type.startsWith("video/")) {
      toast({ title: "Error", description: "Please select a valid video file" });
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      setVideoInfo({
        duration: formatTime(duration),
        size: file ? formatFileSize(file.size) : "0 MB",
      });
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

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select a video" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    return new Promise<void>((resolve) => {
      try {
        const formData = new FormData();
        formData.append("video", file);

        const token = localStorage.getItem("neropage_auth_token");
        console.log("[VideoUpload] Starting upload, token:", !!token);
        
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
            console.log("[VideoUpload] Progress:", Math.round(percentComplete) + "%");
          }
        });

        xhr.addEventListener("load", () => {
          console.log("[VideoUpload] Load event - status:", xhr.status);
          setIsUploading(false);
          setUploadProgress(0);
          
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log("[VideoUpload] Success:", data);
              onVideoUploaded(data.url);
              toast({ title: "Success", description: "Video uploaded successfully!" });
              setFile(null);
              setPreview("");
              setVideoInfo(null);
              setIsPlaying(false);
            } catch (e) {
              console.error("[VideoUpload] Parse error:", e);
              toast({ title: "Error", description: "Invalid server response" });
            }
          } else {
            console.error("[VideoUpload] Upload failed:", xhr.status);
            toast({ title: "Error", description: `Upload failed: ${xhr.status}` });
          }
          resolve();
        });

        xhr.addEventListener("error", (e) => {
          console.error("[VideoUpload] Network error:", e);
          setIsUploading(false);
          setUploadProgress(0);
          toast({ title: "Error", description: "Upload failed - network error" });
          resolve();
        });

        xhr.addEventListener("abort", () => {
          console.log("[VideoUpload] Aborted");
          setIsUploading(false);
          setUploadProgress(0);
          resolve();
        });

        console.log("[VideoUpload] Opening POST to /api/upload-video");
        xhr.open("POST", "/api/upload-video", true);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        console.log("[VideoUpload] Sending form data");
        xhr.send(formData);
      } catch (error) {
        console.error("[VideoUpload] Exception:", error);
        setIsUploading(false);
        setUploadProgress(0);
        toast({ title: "Error", description: "Upload failed" });
        resolve();
      }
    });
  };

  const clearFile = () => {
    setFile(null);
    setPreview("");
    setVideoInfo(null);
    setIsPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`p-6 border-2 transition-all ${
          isDragActive
            ? "border-cyan-400 bg-cyan-500/10"
            : "border-dashed border-purple-500/30 hover:border-cyan-500/50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center py-6">
          {!preview ? (
            <>
              <VideoIcon className="w-12 h-12 text-purple-400 mb-3" />
              <Label className="text-base font-semibold mb-2">Upload Video</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your video here or click to browse
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Video
              </Button>
              <p className="text-xs text-muted-foreground mt-3">Max {maxSize}MB</p>
            </>
          ) : (
            <div className="w-full space-y-4">
              {/* Video Preview */}
              <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/30 bg-black">
                <video
                  ref={videoRef}
                  src={preview}
                  onLoadedMetadata={handleMetadata}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={togglePlay}
                  className="absolute bottom-3 left-3 bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                {!isUploading && (
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Video Info */}
              {videoInfo && (
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-mono font-bold text-cyan-400">{videoInfo.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">File Size</p>
                    <p className="text-sm font-mono font-bold text-purple-400">{videoInfo.size}</p>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="w-full space-y-2">
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden border border-cyan-500/50">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-cyan-400 font-semibold">{uploadProgress}% uploaded</p>
                    <p className="text-xs text-muted-foreground">Uploading...</p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {!isUploading && (
                <Button
                  onClick={handleUpload}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
