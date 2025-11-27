import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  filename: string;
  url: string;
}

interface MediaManagerProps {
  onFileDelete?: (filename: string) => void;
}

export function MediaManager({ onFileDelete }: MediaManagerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const { toast } = useToast();

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('neropage_auth_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch("/api/media/list", {
        credentials: "include",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to load media files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDelete = async (filename: string) => {
    setDeletingFile(filename);
    try {
      const token = localStorage.getItem('neropage_auth_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/media/${filename}`, {
        method: "DELETE",
        credentials: "include",
        headers,
      });

      if (response.ok) {
        setFiles(files.filter(f => f.filename !== filename));
        toast({ title: "Success", description: "File deleted successfully" });
        onFileDelete?.(filename);
      } else {
        toast({ title: "Error", description: "Failed to delete file" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Error", description: "Failed to delete file" });
    } finally {
      setDeletingFile(null);
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 space-y-3 border-2 border-purple-500/30">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Previous Uploads</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadFiles}
          disabled={isLoading}
          className="h-8"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.filename}
            className="relative group rounded-lg overflow-hidden border border-border bg-gray-800/50 hover:border-purple-500/50"
          >
            <div className="aspect-square flex items-center justify-center">
              {file.url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video
                  src={file.url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <button
              onClick={() => handleDelete(file.filename)}
              disabled={deletingFile === file.filename}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              title="Delete file"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
