import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Save, Send, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { ConfidenceChip } from "@/components/ConfidenceChip";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/lib/types";
import { generateSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";

type EventFormData = Omit<Event, "id" | "owner_id" | "created_at" | "updated_at" | "status">;

export default function DraftPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<EventFormData>>({});
  const [isExtracting, setIsExtracting] = useState(false);

  // Separate date/time inputs (stored as local strings)
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const { data: event, isLoading } = useQuery({
    queryKey: ["draft", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        start_at: event.start_at,
        end_at: event.end_at,
        timezone: event.timezone,
        city: event.city,
        venue: event.venue,
        address: event.address,
        description: event.description,
        ticket_url: event.ticket_url,
        tags: event.tags,
        poster_path: event.poster_path,
        poster_public_url: event.poster_public_url,
        source_url: event.source_url,
        confidence_overall: event.confidence_overall,
        confidence_json: event.confidence_json,
        evidence_json: event.evidence_json,
        slug: event.slug,
      });

      setStartDate(formatDateLocal(event.start_at));
      setStartTime(formatTimeLocal(event.start_at));
      setEndDate(formatDateLocal(event.end_at));
      setEndTime(formatTimeLocal(event.end_at));
    }
  }, [event]);


  const saveMutation = useMutation({
    mutationFn: async (data: Partial<EventFormData>) => {
      const { error } = await supabase
        .from("events")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Draft saved" });
      queryClient.invalidateQueries({ queryKey: ["draft", id] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const slug = formData.slug || generateSlug(formData.title || "event");
      
      const { error } = await supabase
        .from("events")
        .update({
          ...formData,
          slug,
          status: "published",
        })
        .eq("id", id);

      if (error) throw error;
      return slug;
    },
    onSuccess: (slug) => {
      toast({ title: "Event published!" });
      navigate(`/events/${slug}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to publish",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReExtract = async () => {
    if (!event) return;
    setIsExtracting(true);

    try {
      await supabase.functions.invoke("extract", {
        body: {
          eventId: event.id,
          imageUrl: event.poster_public_url,
          sourceUrl: event.source_url,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["draft", id] });
      toast({ title: "Re-extraction started" });
    } catch (error) {
      toast({
        title: "Re-extraction failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Check if event is in the past
  const isPastEvent = formData.start_at ? new Date(formData.start_at) < new Date() : false;
  
  // Validation checks
  const validationChecks = {
    title: !!formData.title?.trim(),
    start_at: !!formData.start_at,
    city: !!formData.city?.trim(),
    ticket_url: !formData.ticket_url || isValidUrl(formData.ticket_url),
    future_date: !isPastEvent, // Warning for past events
  };

  // Core validation (required for publishing)
  const coreValidation = validationChecks.title && validationChecks.start_at && validationChecks.city && validationChecks.ticket_url;
  
  // Allow publishing past events with warning
  const isValid = coreValidation;

  const getFieldConfidence = (field: string): number | undefined => {
    if (!formData.confidence_json) return undefined;
    const conf = formData.confidence_json as Record<string, number>;
    return conf[field];
  };

  const isLowConfidence = (field: string): boolean => {
    const conf = getFieldConfidence(field);
    return conf !== undefined && conf < 0.7;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Draft not found</h1>
        </div>
      </Layout>
    );
  }

  const posterUrl = formData.poster_public_url || "/placeholder.svg";

  return (
    <Layout>
      <section className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Verify & Publish</h1>
              <p className="text-sm text-muted-foreground">Review the AI-extracted details</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {formData.confidence_overall && (
                <ConfidenceBadge confidence={formData.confidence_overall} />
              )}
              <EvidenceDrawer evidence={formData.evidence_json as Record<string, string>} />
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Poster Preview - Collapsible on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <img
                src={posterUrl}
                alt="Event poster"
                className="h-full w-full object-cover"
                style={{ maxHeight: "300px" }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReExtract}
                disabled={isExtracting}
                className="text-xs sm:text-sm"
              >
                {isExtracting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                Re-extract
              </Button>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                {getFieldConfidence("title") !== undefined && (
                  <ConfidenceChip confidence={getFieldConfidence("title")!} />
                )}
              </div>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => updateField("title", e.target.value)}
                className={cn(isLowConfidence("title") && "border-accent")}
              />
              {isLowConfidence("title") && (
                <p className="flex items-center gap-1 text-sm text-accent">
                  <AlertCircle className="h-4 w-4" />
                  Please verify this field
                </p>
              )}
            </div>

            {/* Date/Time */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="start_date">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    {getFieldConfidence("start_at") !== undefined && (
                      <ConfidenceChip confidence={getFieldConfidence("start_at")!} />
                    )}
                  </div>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const next = e.target.value;
                      setStartDate(next);
                      const iso = combineDateTimeLocal(next, startTime);
                      if (iso) updateField("start_at", iso);
                    }}
                    className={cn(isLowConfidence("start_at") && "border-accent")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      const next = e.target.value;
                      setStartTime(next);
                      const iso = combineDateTimeLocal(startDate, next);
                      if (iso) updateField("start_at", iso);
                    }}
                    className={cn(isLowConfidence("start_at") && "border-accent")}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      const next = e.target.value;
                      setEndDate(next);
                      const iso = combineDateTimeLocal(next, endTime);
                      updateField("end_at", iso);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      const next = e.target.value;
                      setEndTime(next);
                      const iso = combineDateTimeLocal(endDate, next);
                      updateField("end_at", iso);
                    }}
                  />
                </div>
              </div>
            </div>


            {/* Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  {getFieldConfidence("city") !== undefined && (
                    <ConfidenceChip confidence={getFieldConfidence("city")!} />
                  )}
                </div>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={cn(isLowConfidence("city") && "border-accent")}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="venue">Venue</Label>
                  {getFieldConfidence("venue") !== undefined && (
                    <ConfidenceChip confidence={getFieldConfidence("venue")!} />
                  )}
                </div>
                <Input
                  id="venue"
                  value={formData.venue || ""}
                  onChange={(e) => updateField("venue", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="description">Description</Label>
                {getFieldConfidence("description") !== undefined && (
                  <ConfidenceChip confidence={getFieldConfidence("description")!} />
                )}
              </div>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                rows={5}
              />
            </div>

            {/* Ticket URL */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="ticket_url">Ticket URL</Label>
                {getFieldConfidence("ticket_url") !== undefined && (
                  <ConfidenceChip confidence={getFieldConfidence("ticket_url")!} />
                )}
              </div>
              <Input
                id="ticket_url"
                type="url"
                value={formData.ticket_url || ""}
                onChange={(e) => updateField("ticket_url", e.target.value)}
                className={cn(!validationChecks.ticket_url && "border-destructive")}
              />
              {!validationChecks.ticket_url && (
                <p className="text-sm text-destructive">Please enter a valid URL</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) =>
                  updateField(
                    "tags",
                    e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                  )
                }
                placeholder="hackathon, tech, berlin"
              />
            </div>

            {/* Validation Checklist */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="mb-3 font-semibold text-foreground">Publishing Checklist</h3>
              <div className="space-y-2">
                {[
                  { key: "title", label: "Title is present", required: true },
                  { key: "start_at", label: "Start date is set", required: true },
                  { key: "city", label: "City is specified", required: true },
                  { key: "ticket_url", label: "Ticket URL is valid (if provided)", required: true },
                  { key: "future_date", label: "Event is in the future", required: false },
                ].map(({ key, label, required }) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {validationChecks[key as keyof typeof validationChecks] ? (
                      <CheckCircle2 className="h-4 w-4 text-confidence-high" />
                    ) : required ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-accent" />
                    )}
                    <span
                      className={cn(
                        validationChecks[key as keyof typeof validationChecks]
                          ? "text-muted-foreground"
                          : required ? "text-foreground" : "text-accent"
                      )}
                    >
                      {label}
                      {!required && !validationChecks[key as keyof typeof validationChecks] && " (warning)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Event Warning */}
            {isPastEvent && (
              <div className="rounded-lg border border-accent/50 bg-accent/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-accent" />
                  <div>
                    <h4 className="font-medium text-foreground">This event appears to be in the past</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The start date ({new Date(formData.start_at!).toLocaleDateString()}) has already passed. 
                      Please verify the year is correct. You can still publish past events for archival purposes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons - Sticky on mobile */}
            <div className="flex gap-3 pt-4 pb-4 sm:pb-0 sticky bottom-0 bg-background/95 backdrop-blur-sm sm:relative sm:bg-transparent sm:backdrop-blur-none border-t sm:border-t-0 -mx-4 px-4 sm:mx-0 sm:px-0 mt-4">
              <Button
                variant="outline"
                onClick={() => saveMutation.mutate(formData)}
                disabled={saveMutation.isPending}
                className="flex-1 sm:flex-initial h-11 sm:h-10"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">Save Draft</span>
                <span className="sm:hidden">Save</span>
              </Button>
              <Button
                onClick={() => publishMutation.mutate()}
                disabled={!isValid || publishMutation.isPending}
                className="gradient-bg flex-1 sm:flex-initial h-11 sm:h-10"
              >
                {publishMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publish
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

function formatDateLocal(isoString?: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTimeLocal(isoString?: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

function combineDateTimeLocal(date: string, time: string): string | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
