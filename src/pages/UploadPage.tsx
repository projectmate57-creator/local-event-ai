import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

type UploadStep = "idle" | "screening" | "extracting" | "done";

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle");
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const progressValue = uploadStep === "screening" ? 33 : uploadStep === "extracting" ? 66 : uploadStep === "done" ? 100 : 0;

  // Authenticated user flow (existing behavior)
  const handleAuthenticatedUpload = async (file: File) => {
    setIsLoading(true);
    setUploadStep("extracting");

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user!.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("posters").getPublicUrl(filePath);
      const posterUrl = urlData.publicUrl;

      const { data: event, error: insertError } = await supabase
        .from("events")
        .insert({
          owner_id: user!.id,
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

      await supabase.functions.invoke("extract", {
        body: { eventId: event.id, imageUrl: posterUrl },
      });

      navigate(`/drafts/${event.id}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      setIsLoading(false);
      setUploadStep("idle");
    }
  };

  // Anonymous flow via submit-poster edge function
  const handleAnonymousUpload = async (file: File) => {
    setIsLoading(true);
    setRejectionMessage(null);
    setUploadStep("screening");

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke("submit-poster", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;

      if (data.status === "rejected") {
        setRejectionMessage(data.reason);
        setIsLoading(false);
        setUploadStep("idle");
        return;
      }

      setUploadStep("done");
      navigate(`/drafts/${data.eventId}?token=${data.editToken}`);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      setIsLoading(false);
      setUploadStep("idle");
    }
  };

  const handleFileSelect = async (file: File) => {
    if (user) {
      handleAuthenticatedUpload(file);
    } else {
      handleAnonymousUpload(file);
    }
  };

  // URL-based uploads
  const handleUrlSubmit = async (imageUrl: string) => {
    if (user) {
      // Authenticated URL flow
      setIsLoading(true);
      setUploadStep("extracting");
      try {
        const { data: event, error: insertError } = await supabase
          .from("events")
          .insert({
            owner_id: user.id,
            status: "draft",
            title: "Untitled Event",
            start_at: new Date().toISOString(),
            city: "",
            poster_public_url: imageUrl,
          })
          .select()
          .single();
        if (insertError) throw insertError;

        await supabase.functions.invoke("extract", {
          body: { eventId: event.id, imageUrl },
        });
        navigate(`/drafts/${event.id}`);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Failed to process",
          description: error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
        setIsLoading(false);
        setUploadStep("idle");
      }
    } else {
      // Anonymous URL flow
      setIsLoading(true);
      setRejectionMessage(null);
      setUploadStep("screening");
      try {
        const { data, error } = await supabase.functions.invoke("submit-poster", {
          body: { imageUrl },
        });
        if (error) throw error;

        if (data.status === "rejected") {
          setRejectionMessage(data.reason);
          setIsLoading(false);
          setUploadStep("idle");
          return;
        }

        setUploadStep("done");
        navigate(`/drafts/${data.eventId}?token=${data.editToken}`);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Failed to process",
          description: error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
        setIsLoading(false);
        setUploadStep("idle");
      }
    }
  };

  const handleEventUrlSubmit = async (sourceUrl: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Event URL extraction requires an account. Please sign in first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setUploadStep("extracting");
    try {
      const { data: event, error: insertError } = await supabase
        .from("events")
        .insert({
          owner_id: user.id,
          status: "draft",
          title: "Untitled Event",
          start_at: new Date().toISOString(),
          city: "",
          source_url: sourceUrl,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      await supabase.functions.invoke("extract", {
        body: { eventId: event.id, sourceUrl },
      });
      navigate(`/drafts/${event.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Failed to process",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      setIsLoading(false);
      setUploadStep("idle");
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
            {!user && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                No account needed — AI screens all uploads
              </p>
            )}
          </div>

          {/* Rejection message */}
          {rejectionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-foreground">Upload not accepted</p>
                <p className="text-sm text-muted-foreground mt-1">{rejectionMessage}</p>
              </div>
            </motion.div>
          )}

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
              <div className="text-center px-4 w-full max-w-xs">
                <p className="text-lg font-medium text-foreground">
                  {uploadStep === "screening" && "Screening your image..."}
                  {uploadStep === "extracting" && "Extracting event details..."}
                  {uploadStep === "done" && "All done!"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadStep === "screening" && "Checking content safety"}
                  {uploadStep === "extracting" && "Our AI is reading your poster"}
                  {uploadStep === "done" && "Redirecting to your draft..."}
                </p>
                <Progress value={progressValue} className="mt-4 h-2" />
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
