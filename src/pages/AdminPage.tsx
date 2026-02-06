import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Loader2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  Square,
  CheckSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/lib/types";
import { generateSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface EventFormData {
  title: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  city: string;
  venue: string;
  address: string;
  description: string;
  ticket_url: string;
  poster_public_url: string;
  tags: string;
  status: "draft" | "published";
}

const initialFormData: EventFormData = {
  title: "",
  start_date: "",
  start_time: "18:00",
  end_date: "",
  end_time: "",
  city: "",
  venue: "",
  address: "",
  description: "",
  ticket_url: "",
  poster_public_url: "",
  tags: "",
  status: "draft",
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

function AdminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);

  // Use authenticated user's ID for event ownership
  const ownerId = user.id;

  // Fetch all events owned by current user
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events", ownerId],
    queryFn: async () => {
      // Fetch events owned by current user (RLS will filter automatically)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Event deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async ({
      data,
      eventId,
    }: {
      data: EventFormData;
      eventId?: string;
    }) => {
      const startAt = combineDateTimeLocal(data.start_date, data.start_time);
      const endAt = combineDateTimeLocal(data.end_date, data.end_time);

      if (!startAt) {
        throw new Error("Start date and time are required");
      }

      const eventData = {
        owner_id: ownerId,
        title: data.title,
        start_at: startAt,
        end_at: endAt,
        city: data.city,
        venue: data.venue || null,
        address: data.address || null,
        description: data.description || null,
        ticket_url: data.ticket_url || null,
        poster_public_url: data.poster_public_url || null,
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : null,
        status: data.status,
        slug:
          data.status === "published"
            ? generateSlug(data.title)
            : null,
      };

      if (eventId) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", eventId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(eventData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingEvent ? "Event updated" : "Event created" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setIsCreateOpen(false);
      setEditingEvent(null);
      setFormData(initialFormData);
    },
    onError: (error) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: events.length,
    published: events.filter((e) => e.status === "published").length,
    drafts: events.filter((e) => e.status === "draft").length,
    past: events.filter((e) => new Date(e.start_at) < new Date()).length,
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start_date: formatDateLocal(event.start_at),
      start_time: formatTimeLocal(event.start_at),
      end_date: formatDateLocal(event.end_at),
      end_time: formatTimeLocal(event.end_at),
      city: event.city,
      venue: event.venue || "",
      address: event.address || "",
      description: event.description || "",
      ticket_url: event.ticket_url || "",
      poster_public_url: event.poster_public_url || "",
      tags: event.tags?.join(", ") || "",
      status: event.status as "draft" | "published",
    });
    setIsCreateOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!formData.start_date) {
      toast({ title: "Start date is required", variant: "destructive" });
      return;
    }
    if (!formData.city.trim()) {
      toast({ title: "City is required", variant: "destructive" });
      return;
    }

    // Check for past date
    const startAt = combineDateTimeLocal(formData.start_date, formData.start_time);
    if (startAt && new Date(startAt) < new Date()) {
      if (formData.status === "published") {
        toast({
          title: "Warning: Past Event",
          description: "You are publishing an event with a past date.",
        });
      }
    }

    saveMutation.mutate({
      data: formData,
      eventId: editingEvent?.id,
    });
  };

  const isPastDate = (dateStr: string) => {
    const date = combineDateTimeLocal(dateStr, "00:00");
    return date ? new Date(date) < new Date() : false;
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-foreground">My Events</h1>
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Signed in as {user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
            <Dialog
              open={isCreateOpen}
              onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) {
                  setEditingEvent(null);
                  setFormData(initialFormData);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gradient-bg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? "Edit Event" : "Create New Event"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEvent
                      ? "Update event details"
                      : "Manually create a new event"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Event title"
                    />
                  </div>

                  {/* Date/Time */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, start_date: e.target.value })
                        }
                        className={cn(
                          isPastDate(formData.start_date) && "border-accent"
                        )}
                      />
                      {isPastDate(formData.start_date) && (
                        <p className="flex items-center gap-1 text-xs text-accent">
                          <AlertTriangle className="h-3 w-3" />
                          This date is in the past
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) =>
                          setFormData({ ...formData, start_time: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) =>
                          setFormData({ ...formData, end_time: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Berlin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        value={formData.venue}
                        onChange={(e) =>
                          setFormData({ ...formData, venue: e.target.value })
                        }
                        placeholder="Venue name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Full address"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      placeholder="Event description"
                    />
                  </div>

                  {/* URLs */}
                  <div className="space-y-2">
                    <Label htmlFor="ticket_url">Ticket URL</Label>
                    <Input
                      id="ticket_url"
                      type="url"
                      value={formData.ticket_url}
                      onChange={(e) =>
                        setFormData({ ...formData, ticket_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poster_url">Poster Image URL</Label>
                    <Input
                      id="poster_url"
                      type="url"
                      value={formData.poster_public_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          poster_public_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="hackathon, tech, berlin"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "draft" | "published") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingEvent ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Events", value: stats.total, icon: Calendar },
            { label: "Published", value: stats.published, icon: CheckCircle },
            { label: "Drafts", value: stats.drafts, icon: Clock },
            { label: "Past Events", value: stats.past, icon: AlertTriangle },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <p className="text-muted-foreground">No events found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => {
                    const isPast = new Date(event.start_at) < new Date();
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {event.poster_public_url && (
                              <img
                                src={event.poster_public_url}
                                alt=""
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {event.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span
                              className={cn(
                                "text-sm",
                                isPast && "text-accent"
                              )}
                            >
                              {format(new Date(event.start_at), "MMM d, yyyy")}
                            </span>
                            {isPast && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                Past
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{event.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.status === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {event.status === "published" && event.slug && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/events/${event.slug}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Event?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{event.title}".
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(event.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
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
  if (!date) return null;
  const t = time || "00:00";
  const d = new Date(`${date}T${t}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
