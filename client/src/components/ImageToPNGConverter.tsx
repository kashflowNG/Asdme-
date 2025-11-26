import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, X } from "lucide-react";

interface ImageToPNGConverterProps {
  onPNGConverted: (url: string) => void;
}

export function ImageToPNGConverter({ onPNGConverted }: ImageToPNGConverterProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Error", description: "File too large (max 10MB)" });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const convertToPNG = async () => {
    if (!imageFile) {
      toast({ title: "Error", description: "Please select an image" });
      return;
    }

    setIsConverting(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            toast({ title: "Error", description: "Conversion failed" });
            setIsConverting(false);
            return;
          }

          const pngFile = new File([blob], `${imageFile.name.split('.')[0]}.png`, { type: "image/png" });
          const formData = new FormData();
          formData.append("image", pngFile);

          try {
            const response = await fetch("/api/upload-image", {
              method: "POST",
              body: formData,
              credentials: "include",
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            const fullUrl = `${window.location.origin}${data.url}`;
            
            onPNGConverted(fullUrl);
            toast({ title: "Success", description: "Image converted to PNG and uploaded!" });
            setImageFile(null);
            setPreview("");
          } catch (error) {
            toast({ title: "Error", description: "Failed to upload PNG" });
          }
        }, "image/png", 0.9);
      };

      img.onerror = () => {
        toast({ title: "Error", description: "Failed to process image" });
        setIsConverting(false);
      };

      img.src = preview;
    } catch (error) {
      toast({ title: "Error", description: "Conversion error" });
      setIsConverting(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-upload">Upload Image for SEO Meta</Label>
        <p className="text-xs text-muted-foreground">
          Upload any image (JPG, PNG, GIF, WebP). It will be converted to PNG for optimal SEO meta tags.
        </p>
        <input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full gap-2"
        >
          <Upload className="w-4 h-4" />
          Choose Image
        </Button>
      </div>

      {preview && (
        <div className="space-y-4">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-700">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImageFile(null);
                setPreview("");
              }}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={convertToPNG}
              disabled={isConverting}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isConverting ? "Converting..." : "Convert to PNG"}
            </Button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-xs text-blue-200">
            ℹ️ PNG format is optimal for social media sharing. Your image will be converted to PNG and used for link previews.
          </div>
        </div>
      )}
    </Card>
  );
}
