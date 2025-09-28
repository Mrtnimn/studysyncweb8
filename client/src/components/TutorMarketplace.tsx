import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTutorBookingSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Star, Clock, DollarSign, BookOpen, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TutorProfile } from "@shared/schema";

const bookingFormSchema = insertTutorBookingSchema.extend({
  session_date: z.date(),
  duration_minutes: z.number().min(30).max(180),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const subjects = [
  "Mathematics", "Science", "English", "History", "Geography", 
  "Physics", "Chemistry", "Biology", "Computer Science", "Languages",
  "Art", "Music", "Economics", "Psychology", "Philosophy"
];

export function TutorMarketplace() {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [maxRate, setMaxRate] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);

  // Search tutors with filters
  const { data: tutors, isLoading } = useQuery({
    queryKey: ['/api/tutors/search', selectedSubject, minRating, maxRate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (minRating) params.append('minRating', minRating);
      if (maxRate) params.append('maxRate', maxRate);
      
      const response = await fetch(`/api/tutors/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tutors');
      return response.json() as Promise<TutorProfile[]>;
    }
  });

  // Get tutor reviews
  const { data: reviews } = useQuery({
    queryKey: ['/api/tutors', selectedTutor?.id, 'reviews'],
    queryFn: async () => {
      if (!selectedTutor) return [];
      const response = await fetch(`/api/tutors/${selectedTutor.id}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
    enabled: !!selectedTutor
  });

  // Booking form
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      tutor_id: "",
      subject: "",
      duration_minutes: 60,
      session_notes: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await fetch('/api/tutors/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          session_date: data.session_date.toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to create booking');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Booking request sent successfully!" });
      form.reset();
      setSelectedTutor(null);
      queryClient.invalidateQueries({ queryKey: ['/api/tutors/bookings'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create booking",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (!selectedTutor) return;
    bookingMutation.mutate({
      ...data,
      tutor_id: selectedTutor.id,
    });
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatRating = (rating: number) => (rating / 100).toFixed(1);

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Find Your Perfect Tutor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with experienced tutors for personalized learning sessions
        </p>
      </div>

      {/* Search Filters */}
      <Card className="border-2 border-blue-100 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Filter Tutors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger data-testid="select-subject">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Hourly Rate</label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                data-testid="input-max-rate"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Rating</label>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger data-testid="select-min-rating">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any rating</SelectItem>
                  <SelectItem value="4.0">4.0+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="4.8">4.8+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors?.map((tutor) => (
            <Card key={tutor.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`/api/avatars/${tutor.user_id}`} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {tutor.user_id.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg" data-testid={`text-tutor-name-${tutor.id}`}>
                        Tutor #{tutor.user_id.slice(0, 8)}
                      </h3>
                      {tutor.average_rating && tutor.average_rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium" data-testid={`text-rating-${tutor.id}`}>
                            {formatRating(tutor.average_rating)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span data-testid={`text-rate-${tutor.id}`}>
                        {formatPrice(tutor.hourly_rate)}/hour
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>Responds in ~{tutor.response_time_hours}h</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="h-4 w-4" />
                      <span>{tutor.experience_years} years experience</span>
                    </div>

                    {tutor.languages && tutor.languages.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>Speaks {tutor.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {tutor.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {tutor.subjects.slice(0, 3).map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                  {tutor.subjects.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tutor.subjects.length - 3} more
                    </Badge>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => setSelectedTutor(tutor)}
                      data-testid={`button-book-${tutor.id}`}
                    >
                      Book Session
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/api/avatars/${tutor.user_id}`} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {tutor.user_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-bold">Book with Tutor #{tutor.user_id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatPrice(tutor.hourly_rate)}/hour • {tutor.average_rating ? formatRating(tutor.average_rating) : 'No rating'} ⭐ • {tutor.total_reviews} reviews
                          </p>
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        {tutor.bio}
                      </DialogDescription>
                    </DialogHeader>

                    {/* Tutor Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Subjects</h4>
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects.map((subject) => (
                            <Badge key={subject} variant="secondary">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Education & Experience</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{tutor.education}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {tutor.experience_years} years of teaching experience
                        </p>
                      </div>

                      {reviews && reviews.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Recent Reviews</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {reviews.slice(0, 3).map((review: any) => (
                              <div key={review.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "h-3 w-3",
                                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(review.created_at), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {review.review_text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booking Form */}
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-booking-subject">
                                      <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {tutor.subjects.map((subject) => (
                                      <SelectItem key={subject} value={subject}>
                                        {subject}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="duration_minutes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-duration">
                                      <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="90">1.5 hours</SelectItem>
                                    <SelectItem value="120">2 hours</SelectItem>
                                    <SelectItem value="180">3 hours</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="session_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Session Date & Time</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="button-select-date"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="session_notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="What would you like to focus on in this session?"
                                  className="resize-none"
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="textarea-session-notes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-lg font-semibold">
                            Total: {form.watch('duration_minutes') ? 
                              formatPrice(Math.round((form.watch('duration_minutes') / 60) * tutor.hourly_rate)) : 
                              '$0.00'
                            }
                          </div>
                          <Button
                            type="submit"
                            disabled={bookingMutation.isPending}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            data-testid="button-submit-booking"
                          >
                            {bookingMutation.isPending ? "Booking..." : "Book Session"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (!tutors || tutors.length === 0) && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No tutors found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search filters to find more tutors.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}