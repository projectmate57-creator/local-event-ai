import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, X, Link as LinkIcon, Camera, Sparkles } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
    noClick: true,
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

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="upload" className="text-xs sm:text-sm py-2.5 px-1.5 sm:px-3">
            <Camera className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Photo</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs sm:text-sm py-2.5 px-1.5 sm:px-3">
            <Image className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Image URL</span>
          </TabsTrigger>
          <TabsTrigger value="event" className="text-xs sm:text-sm py-2.5 px-1.5 sm:px-3">
            <LinkIcon className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Event Link</span>
          </TabsTrigger>
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
                  style={{ maxHeight: "350px" }}
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
                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-10 transition-all",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50",
                    isLoading && "pointer-events-none opacity-50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center text-center w-full">
                    <div className="mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                      <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                    </div>
                    <p className="mb-1 text-base sm:text-lg font-medium text-foreground">
                      {isDragActive ? "Drop your poster here" : "Upload event poster"}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-5 px-2">
                      Take a photo or choose from your gallery
                    </p>
                    
                    {/* Mobile-friendly action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        type="button"
                        variant="default"
                        className="gradient-bg flex-1 h-12 text-base"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCameraClick();
                        }}
                      >
                        <Camera className="mr-2 h-5 w-5" />
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 text-base"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGalleryClick();
                        }}
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        Choose Image
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <form onSubmit={handleImageUrlSubmit} className="space-y-4">
            <div className="rounded-xl border border-border p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  type="url"
                  placeholder="Paste image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 text-base"
                  disabled={isLoading}
                />
              </div>
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
                  style={{ maxHeight: "250px" }}
                />
              </motion.div>
            )}
            <Button
              type="submit"
              disabled={!imageUrl.trim() || isLoading}
              className="w-full gradient-bg h-12 text-base"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Extract Event Details
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="event" className="mt-4">
          <form onSubmit={handleEventUrlSubmit} className="space-y-4">
            <div className="rounded-xl border border-border p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  type="url"
                  placeholder="Paste event page URL..."
                  value={eventUrl}
                  onChange={(e) => setEventUrl(e.target.value)}
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 text-base"
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground px-1">
              Works with Eventbrite, Meetup, Facebook Events, and more.
            </p>
            <Button
              type="submit"
              disabled={!eventUrl.trim() || isLoading}
              className="w-full gradient-bg h-12 text-base"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Extract Event Details
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
