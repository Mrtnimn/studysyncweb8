import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, momentLocalizer, Views, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Clock, 
  BookOpen, 
  Users, 
  Calendar as CalendarIcon,
  Sparkles,
  Target,
  GraduationCap,
  UserCheck,
  Edit,
  Trash2
} from "lucide-react";
import { AvatarCompanion, useAvatarCompanion } from "./AvatarCompanion";
import { PageTransition, StaggeredContainer, StaggeredItem } from "./PageTransition";

// Initialize moment localizer
const localizer = momentLocalizer(moment);

// Backend calendar event interface
interface CalendarEvent {
  id: string;
  title: string;
  subject: string;
  start_time: string;
  end_time: string;
  session_type: 'solo' | 'group' | 'tutoring';
  status: 'scheduled' | 'completed' | 'cancelled';
  reminder_minutes: number;
  created_at: string;
}

// React-Big-Calendar event interface
interface CalendarEventForBigCalendar extends Event {
  id: string;
  resource: CalendarEvent;
}

interface StudyCalendarProps {
  onEventCreate?: (event: any) => void;
  onEventUpdate?: (eventId: string, updates: any) => void;
}

// Form interface for creating events
interface NewEventForm {
  title: string;
  subject: string;
  start_time: string;
  end_time: string;
  session_type: 'solo' | 'group' | 'tutoring';
  reminder_minutes: number;
}

const eventTypeEmojis = {
  solo: '🧠',
  group: '👥',
  tutoring: '👨‍🏫'
};

const eventTypeColors = {
  solo: '#3B82F6', // blue
  group: '#10B981', // emerald
  tutoring: '#8B5CF6' // purple
};

const eventTypeGradients = {
  solo: 'from-blue-500 to-blue-600',
  group: 'from-green-500 to-emerald-600',
  tutoring: 'from-purple-500 to-pink-600'
};

export function StudyCalendar({ onEventCreate, onEventUpdate }: StudyCalendarProps) {
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [view, setView] = useState<keyof typeof Views>(Views.MONTH);
  
  const [newEvent, setNewEvent] = useState<NewEventForm>({
    title: '',
    subject: '',
    start_time: '',
    end_time: '',
    session_type: 'solo',
    reminder_minutes: 15
  });

  const companion = useAvatarCompanion();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    companion.welcome();
  }, [companion]);

  // Fetch calendar events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => apiRequest('/api/events')
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (eventData: NewEventForm) => apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Success!",
        description: "Study session scheduled successfully! 📅",
      });
      setShowEventDialog(false);
      resetForm();
      companion.celebrate();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create study session. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<CalendarEvent> }) => 
      apiRequest(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Updated!",
        description: "Study session updated successfully!",
      });
      setShowEventDialog(false);
      setSelectedEvent(null);
      setIsEditing(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update study session. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Transform events for react-big-calendar
  const calendarEvents: CalendarEventForBigCalendar[] = events.map((event: CalendarEvent) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
    resource: event
  }));

  const resetForm = () => {
    setNewEvent({
      title: '',
      subject: '',
      start_time: '',
      end_time: '',
      session_type: 'solo',
      reminder_minutes: 15
    });
  };

  const handleSelectSlot = useCallback(({ start, end }: { start: Date, end: Date }) => {
    setSelectedDate(start);
    const startTime = moment(start).format('YYYY-MM-DDTHH:mm');
    const endTime = moment(end).format('YYYY-MM-DDTHH:mm');
    
    setNewEvent(prev => ({
      ...prev,
      start_time: startTime,
      end_time: endTime
    }));
    setShowEventDialog(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEventForBigCalendar) => {
    setSelectedEvent(event.resource);
    setNewEvent({
      title: event.resource.title,
      subject: event.resource.subject,
      start_time: moment(event.resource.start_time).format('YYYY-MM-DDTHH:mm'),
      end_time: moment(event.resource.end_time).format('YYYY-MM-DDTHH:mm'),
      session_type: event.resource.session_type,
      reminder_minutes: event.resource.reminder_minutes
    });
    setIsEditing(true);
    setShowEventDialog(true);
  }, []);

  const handleCreateOrUpdateEvent = () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your study session.",
        variant: "destructive"
      });
      return;
    }

    if (isEditing && selectedEvent) {
      updateEventMutation.mutate({
        id: selectedEvent.id,
        updates: newEvent
      });
    } else {
      createEventMutation.mutate(newEvent);
    }
  };

  const eventStyleGetter = (event: CalendarEventForBigCalendar) => {
    const sessionType = event.resource.session_type;
    return {
      style: {
        backgroundColor: eventTypeColors[sessionType],
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500'
      }
    };
  };

  // Get today's events
  const todayEvents = events.filter((event: CalendarEvent) => {
    const eventDate = new Date(event.start_time);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  // Get upcoming events (next 5)
  const upcomingEvents = events
    .filter((event: CalendarEvent) => new Date(event.start_time) > new Date())
    .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Spanish', 'French', 
    'Art', 'Music', 'Physics', 'Chemistry', 'Biology', 'Geography',
    'Computer Science', 'Psychology', 'Philosophy'
  ];

  return (
    <PageTransition className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Avatar Companion */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="sticky top-6"
          >
            <AvatarCompanion
              mood={companion.mood}
              message="Plan your study sessions here! Consistent scheduling leads to better results! 📅"
              showMessage={true}
              onInteraction={companion.showEncouragement}
              size="large"
              position="relative"
            />
          </motion.div>
        </div>

        {/* Main Calendar */}
        <div className="lg:col-span-3 space-y-6">
          <StaggeredContainer className="space-y-4">
            <StaggeredItem>
              <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold font-['Poppins'] flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-purple-600" />
                        Study Calendar
                      </CardTitle>
                      <p className="text-gray-600 mt-1">Plan your learning journey</p>
                    </div>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedEvent(null);
                        resetForm();
                        setShowEventDialog(true);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      data-testid="button-add-session"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Session
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </StaggeredItem>

            {/* Calendar */}
            <StaggeredItem>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        variant={view === Views.MONTH ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView(Views.MONTH)}
                        data-testid="button-month-view"
                      >
                        Month
                      </Button>
                      <Button
                        variant={view === Views.WEEK ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView(Views.WEEK)}
                        data-testid="button-week-view"
                      >
                        Week
                      </Button>
                      <Button
                        variant={view === Views.DAY ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView(Views.DAY)}
                        data-testid="button-day-view"
                      >
                        Day
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Click to create • Click event to edit
                    </div>
                  </div>

                  <div className="h-[600px]" data-testid="calendar-container">
                    <Calendar
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 600 }}
                      view={view}
                      onView={setView}
                      onSelectSlot={handleSelectSlot}
                      onSelectEvent={handleSelectEvent}
                      selectable
                      eventPropGetter={eventStyleGetter}
                      views={['month', 'week', 'day']}
                      step={60}
                      showMultiDayTimes
                      components={{
                        event: ({ event }: { event: CalendarEventForBigCalendar }) => (
                          <div className="p-1">
                            <div className="font-medium text-xs">
                              {eventTypeEmojis[event.resource.session_type]} {event.title}
                            </div>
                            {event.resource.subject && (
                              <div className="text-xs opacity-90">{event.resource.subject}</div>
                            )}
                          </div>
                        )
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </StaggeredItem>

            {/* Today's Events & Upcoming */}
            <div className="grid md:grid-cols-2 gap-4">
              <StaggeredItem>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Today's Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {todayEvents.map((event: CalendarEvent) => (
                          <motion.div
                            key={event.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={`p-3 rounded-lg bg-gradient-to-r ${eventTypeGradients[event.session_type]} text-white`}
                            data-testid={`today-event-${event.id}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{eventTypeEmojis[event.session_type]}</span>
                              <span className="font-medium">{event.title}</span>
                              {event.status === 'completed' && (
                                <Badge className="bg-green-200 text-green-800">✓ Done</Badge>
                              )}
                            </div>
                            <div className="text-sm opacity-90 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {moment(event.start_time).format('HH:mm')}
                              </span>
                              <span>
                                {Math.round(
                                  (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60)
                                )}min
                              </span>
                              {event.subject && <span>• {event.subject}</span>}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No sessions planned for today</p>
                        <p className="text-sm">Click on the calendar to add one!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggeredItem>

              <StaggeredItem>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingEvents.map((event: CalendarEvent, index: number) => (
                          <motion.div
                            key={event.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 bg-gray-50 rounded-lg border"
                            data-testid={`upcoming-event-${event.id}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span>{eventTypeEmojis[event.session_type]}</span>
                              <span className="font-medium text-sm">{event.title}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {moment(event.start_time).format('MMM DD, YYYY [at] HH:mm')}
                            </div>
                            {event.subject && (
                              <div className="text-xs text-gray-500 mt-1">{event.subject}</div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No upcoming sessions</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggeredItem>
            </div>
          </StaggeredContainer>
        </div>
      </div>

      {/* Create/Edit Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-purple-600" />}
              {isEditing ? 'Edit Study Session' : 'Create Study Session'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Session Title *</Label>
              <Input
                id="event-title"
                placeholder="e.g., Calculus Study, Spanish Practice"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
                data-testid="input-event-title"
              />
            </div>

            <div>
              <Label htmlFor="event-subject">Subject</Label>
              <Select
                value={newEvent.subject}
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger className="mt-1" data-testid="select-subject">
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                  className="mt-1"
                  data-testid="input-start-time"
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                  className="mt-1"
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <div>
              <Label>Session Type</Label>
              <div className="flex gap-2 mt-2">
                {(['solo', 'group', 'tutoring'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={newEvent.session_type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewEvent(prev => ({ ...prev, session_type: type }))}
                    className="flex items-center gap-1"
                    data-testid={`button-session-${type}`}
                  >
                    <span>{eventTypeEmojis[type]}</span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="reminder">Reminder</Label>
              <Select
                value={newEvent.reminder_minutes.toString()}
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, reminder_minutes: parseInt(value) }))}
              >
                <SelectTrigger className="mt-1" data-testid="select-reminder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEventDialog(false);
                  setIsEditing(false);
                  setSelectedEvent(null);
                  resetForm();
                }} 
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrUpdateEvent}
                disabled={!newEvent.title.trim() || createEventMutation.isPending || updateEventMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                data-testid="button-save-event"
              >
                {createEventMutation.isPending || updateEventMutation.isPending ? (
                  "Saving..."
                ) : (
                  isEditing ? "Update Session" : "Create Session"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}