import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, X, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  onEventUrlSubmit?: (url: string) => void;
  isLoading?: boolean;
}

export function FileUpload({
  onFileSelect,
  onUrlSubmit,
  onEventUrlSubmit,
  isLoading = false,
}: FileUploadProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [eventUrl, setEventUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleImageUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      setPreview(imageUrl);
      onUrlSubmit(imageUrl);
    }
  };

  const handleEventUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventUrl.trim() && onEventUrlSubmit) {
      onEventUrlSubmit(eventUrl);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setImageUrl("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Image URL</TabsTrigger>
          <TabsTrigger value="event">Event Page</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-xl border border-border object-cover"
                  style={{ maxHeight: "400px" }}
                />
                <button
                  onClick={clearPreview}
                  className="absolute right-3 top-3 rounded-full bg-foreground/80 p-2 text-background hover:bg-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50",
                    isLoading && "pointer-events-none opacity-50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="mb-2 text-lg font-medium text-foreground">
                      {isDragActive ? "Drop your poster here" : "Drag & drop your event poster"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse (PNG, JPG, WEBP)
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <form onSubmit={handleImageUrlSubmit} className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-border p-4">
              <Image className="h-5 w-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Paste image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
                disabled={isLoading}
              />
            </div>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-xl border border-border object-cover"
                  style={{ maxHeight: "300px" }}
                />
              </motion.div>
            )}
            <Button
              type="submit"
              disabled={!imageUrl.trim() || isLoading}
              className="w-full gradient-bg"
            >
              Extract from Image URL
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="event" className="mt-4">
          <form onSubmit={handleEventUrlSubmit} className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-border p-4">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Paste event page URL (e.g., eventbrite, meetup)..."
                value={eventUrl}
                onChange={(e) => setEventUrl(e.target.value)}
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
                disabled={isLoading}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              We'll try to extract event details from the page. Works best with structured event pages.
            </p>
            <Button
              type="submit"
              disabled={!eventUrl.trim() || isLoading}
              className="w-full gradient-bg"
            >
              Extract from Event Page
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
