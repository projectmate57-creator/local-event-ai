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

  // Unauthenticated/testing mode
  const ownerId = OWNER_ID;

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${ownerId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("posters")
        .getPublicUrl(filePath);

      const posterUrl = urlData.publicUrl;

      // Create draft event
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

      // Call AI extraction
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

      // Navigate to draft page
      navigate(`/drafts/${event.id}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (imageUrl: string) => {
    setIsLoading(true);

    try {
      // Create draft event with external image
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

      // Call AI extraction
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventUrlSubmit = async (sourceUrl: string) => {
    setIsLoading(true);

    try {
      // Create draft event with source URL
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

      // Call AI extraction with source URL
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="mb-4 text-3xl font-bold text-foreground">Upload Event Poster</h1>
          <p className="mb-12 text-muted-foreground">
            Upload your event poster and our AI will extract all the details automatically.
            You can review and edit before publishing.
          </p>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-20"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium text-foreground">Processing your poster...</p>
              <p className="text-sm text-muted-foreground">
                AI is extracting event details. This may take a moment.
              </p>
            </motion.div>
          ) : (
            <FileUpload
              onFileSelect={handleFileSelect}
              onUrlSubmit={handleUrlSubmit}
              onEventUrlSubmit={handleEventUrlSubmit}
              isLoading={isLoading}
            />
          )}
        </motion.div>
      </section>
    </Layout>
  );
}
