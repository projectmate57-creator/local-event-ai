import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const OWNER_ID = "00000000-0000-0000-0000-000000000000";

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const ownerId = OWNER_ID;

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${ownerId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("posters")
        .getPublicUrl(filePath);

      const posterUrl = urlData.publicUrl;

      const { data: event, error: insertError } = await supabase
        .from("events")
        .insert({
          owner_id: ownerId,
          status: "draft",
          title: "Untitled Event",
          start_at: new Date().toISOString(),
          city: "",
          poster_path: filePath,
          poster_public_url: posterUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { error: extractError } = await supabase.functions.invoke("extract", {
        body: { eventId: event.id, imageUrl: posterUrl },
      });

      if (extractError) {
        console.error("Extraction error:", extractError);
        toast({
          title: "Extraction started",
          description: "AI extraction may take a moment. You can edit the draft now.",
        });
      }

      navigate(`/drafts/${event.id}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (imageUrl: string) => {
    setIsLoading(true);

    try {
      const { data: event, error: insertError } = await supabase
        .from("events")
        .insert({
          owner_id: ownerId,
          status: "draft",
          title: "Untitled Event",
          start_at: new Date().toISOString(),
          city: "",
          poster_public_url: imageUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { error: extractError } = await supabase.functions.invoke("extract", {
        body: { eventId: event.id, imageUrl },
      });

      if (extractError) {
        console.error("Extraction error:", extractError);
      }

      navigate(`/drafts/${event.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Failed to process",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleEventUrlSubmit = async (sourceUrl: string) => {
    setIsLoading(true);

    try {
      const { data: event, error: insertError } = await supabase
        .from("events")
        .insert({
          owner_id: ownerId,
          status: "draft",
          title: "Untitled Event",
          start_at: new Date().toISOString(),
          city: "",
          source_url: sourceUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { error: extractError } = await supabase.functions.invoke("extract", {
        body: { eventId: event.id, sourceUrl },
      });

      if (extractError) {
        console.error("Extraction error:", extractError);
      }

      navigate(`/drafts/${event.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Failed to process",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-6 sm:py-10 lg:py-16 min-h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Upload Event Poster
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Snap a photo and we'll extract the details
            </p>
          </div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-16 sm:py-20"
            >
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="text-center px-4">
                <p className="text-lg font-medium text-foreground">
                  Extracting event details...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Our AI is reading your poster
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              <FileUpload
                onFileSelect={handleFileSelect}
                onUrlSubmit={handleUrlSubmit}
                onEventUrlSubmit={handleEventUrlSubmit}
                isLoading={isLoading}
              />
              
              {/* Helper text */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-muted-foreground mt-6"
              >
                📍 Spotted an event poster? Share it with the community!
              </motion.p>
            </>
          )}
        </motion.div>
      </section>
    </Layout>
  );
}
