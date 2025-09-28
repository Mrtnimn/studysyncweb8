import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTutorProfileSchema } from "@shared/schema";
import { z } from "zod";
import { GraduationCap, Star, DollarSign, Clock, Plus, X, Calendar, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TutorProfile, TutorBooking } from "@shared/schema";

const profileFormSchema = insertTutorProfileSchema.extend({
  hourly_rate: z.number().min(10).max(500),
  experience_years: z.number().min(0).max(50),
  response_time_hours: z.number().min(1).max(72),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const availableSubjects = [
  "Mathematics", "Science", "English", "History", "Geography", 
  "Physics", "Chemistry", "Biology", "Computer Science", "Languages",
  "Art", "Music", "Economics", "Psychology", "Philosophy", "Statistics",
  "Calculus", "Algebra", "Literature", "Writing", "Spanish", "French",
  "German", "Chinese", "Japanese", "Programming", "Web Development"
];

const availableLanguages = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", 
  "Korean", "Italian", "Portuguese", "Russian", "Arabic", "Hindi"
];

const timezones = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Rome",
  "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai", "Asia/Mumbai",
  "Australia/Sydney", "Australia/Melbourne"
];

const availabilityOptions = [
  "Weekday mornings", "Weekday afternoons", "Weekday evenings",
  "Weekend mornings", "Weekend afternoons", "Weekend evenings",
  "Flexible schedule", "24/7 available"
];

export function TutorProfileManager() {
  const { toast } = useToast();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  // Get existing tutor profile
  const { data: tutorProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/tutors/profile/me'],
    queryFn: async () => {
      const response = await fetch('/api/tutors/profile/me');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      return data as TutorProfile | null;
    }
  });

  // Get tutor bookings
  const { data: bookings } = useQuery({
    queryKey: ['/api/tutors/bookings/tutor'],
    queryFn: async () => {
      const response = await fetch('/api/tutors/bookings/tutor');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json() as Promise<TutorBooking[]>;
    },
    enabled: !!tutorProfile
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: "",
      hourly_rate: 25,
      subjects: [],
      languages: [],
      education: "",
      experience_years: 0,
      availability: [],
      timezone: "America/New_York",
      response_time_hours: 24,
    },
  });

  // Load existing profile data when available
  useEffect(() => {
    if (tutorProfile) {
      form.reset({
        bio: tutorProfile.bio || "",
        hourly_rate: tutorProfile.hourly_rate / 100, // Convert from cents
        subjects: tutorProfile.subjects || [],
        languages: tutorProfile.languages || [],
        education: tutorProfile.education || "",
        experience_years: tutorProfile.experience_years || 0,
        availability: tutorProfile.availability || [],
        timezone: tutorProfile.timezone || "America/New_York",
        response_time_hours: tutorProfile.response_time_hours || 24,
      });
      setSelectedSubjects(tutorProfile.subjects || []);
      setSelectedLanguages(tutorProfile.languages || []);
      setSelectedAvailability(tutorProfile.availability || []);
    }
  }, [tutorProfile, form]);

  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const method = tutorProfile ? 'PATCH' : 'POST';
      const url = '/api/tutors/profile';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          hourly_rate: Math.round(data.hourly_rate * 100), // Convert to cents
          subjects: selectedSubjects,
          languages: selectedLanguages,
          availability: selectedAvailability,
        }),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: tutorProfile ? "Profile updated successfully!" : "Tutor profile created successfully!" 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tutors/profile/me'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save profile",
        variant: "destructive" 
      });
    },
  });

  const bookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string, status: string }) => {
      const response = await fetch(`/api/tutors/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update booking status');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Booking status updated!" });
      queryClient.invalidateQueries({ queryKey: ['/api/tutors/bookings/tutor'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update booking status",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    if (selectedSubjects.length === 0) {
      toast({ title: "Error", description: "Please select at least one subject", variant: "destructive" });
      return;
    }
    if (selectedLanguages.length === 0) {
      toast({ title: "Error", description: "Please select at least one language", variant: "destructive" });
      return;
    }
    profileMutation.mutate(data);
  };

  const addSubject = (subject: string) => {
    if (!selectedSubjects.includes(subject)) {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const removeSubject = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
  };

  const addLanguage = (language: string) => {
    if (!selectedLanguages.includes(language)) {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const removeLanguage = (language: string) => {
    setSelectedLanguages(selectedLanguages.filter(l => l !== language));
  };

  const addAvailability = (availability: string) => {
    if (!selectedAvailability.includes(availability)) {
      setSelectedAvailability([...selectedAvailability, availability]);
    }
  };

  const removeAvailability = (availability: string) => {
    setSelectedAvailability(selectedAvailability.filter(a => a !== availability));
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatRating = (rating: number) => (rating / 100).toFixed(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          {tutorProfile ? "Manage Your Tutor Profile" : "Become a Tutor"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {tutorProfile ? "Update your profile and manage bookings" : "Share your knowledge and earn by teaching others"}
        </p>
      </div>

      {tutorProfile && (
        <Card className="border-2 border-green-100 dark:border-green-900">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                Profile Overview
              </div>
              {tutorProfile.average_rating && tutorProfile.average_rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold" data-testid="text-tutor-rating">
                    {formatRating(tutorProfile.average_rating)} ({tutorProfile.total_reviews} reviews)
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span data-testid="text-hourly-rate">
                  {formatPrice(tutorProfile.hourly_rate)}/hour
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Responds in ~{tutorProfile.response_time_hours}h</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-600" />
                <span>{tutorProfile.experience_years} years experience</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {tutorProfile ? "Update Profile" : "Create Tutor Profile"}
          </CardTitle>
          <CardDescription>
            Fill out your information to {tutorProfile ? "update your" : "create a"} tutor profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell students about yourself, your teaching style, and what makes you a great tutor..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="textarea-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (USD) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="10"
                          max="500"
                          step="5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-hourly-rate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-experience-years"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subjects */}
              <div className="space-y-3">
                <FormLabel>Subjects You Teach *</FormLabel>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSubjects.map((subject) => (
                    <Badge key={subject} variant="default" className="flex items-center gap-1">
                      {subject}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSubject(subject)}
                        data-testid={`button-remove-subject-${subject}`}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addSubject}>
                  <SelectTrigger data-testid="select-add-subject">
                    <SelectValue placeholder="Add a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects
                      .filter(subject => !selectedSubjects.includes(subject))
                      .map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <FormLabel>Languages You Speak *</FormLabel>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedLanguages.map((language) => (
                    <Badge key={language} variant="secondary" className="flex items-center gap-1">
                      {language}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeLanguage(language)}
                        data-testid={`button-remove-language-${language}`}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addLanguage}>
                  <SelectTrigger data-testid="select-add-language">
                    <SelectValue placeholder="Add a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages
                      .filter(language => !selectedLanguages.includes(language))
                      .map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your educational background, degrees, certifications..."
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-education"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Availability */}
              <div className="space-y-3">
                <FormLabel>Availability</FormLabel>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedAvailability.map((availability) => (
                    <Badge key={availability} variant="outline" className="flex items-center gap-1">
                      {availability}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeAvailability(availability)}
                        data-testid={`button-remove-availability-${availability}`}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addAvailability}>
                  <SelectTrigger data-testid="select-add-availability">
                    <SelectValue placeholder="Add availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions
                      .filter(availability => !selectedAvailability.includes(availability))
                      .map((availability) => (
                        <SelectItem key={availability} value={availability}>
                          {availability}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-timezone">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectItem key={timezone} value={timezone}>
                              {timezone.replace('_', ' ')}
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
                  name="response_time_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Time (hours) *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-response-time">
                            <SelectValue placeholder="Select response time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Within 1 hour</SelectItem>
                          <SelectItem value="2">Within 2 hours</SelectItem>
                          <SelectItem value="4">Within 4 hours</SelectItem>
                          <SelectItem value="8">Within 8 hours</SelectItem>
                          <SelectItem value="24">Within 24 hours</SelectItem>
                          <SelectItem value="48">Within 48 hours</SelectItem>
                          <SelectItem value="72">Within 72 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={profileMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                data-testid="button-save-profile"
              >
                {profileMutation.isPending ? "Saving..." : (tutorProfile ? "Update Profile" : "Create Profile")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Bookings Management */}
      {tutorProfile && bookings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Manage Bookings
            </CardTitle>
            <CardDescription>
              View and manage your upcoming and past sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold" data-testid={`text-booking-subject-${booking.id}`}>
                          {booking.subject}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(booking.session_date).toLocaleDateString()} • {booking.duration_minutes} minutes
                        </p>
                        <p className="text-sm font-medium" data-testid={`text-booking-total-${booking.id}`}>
                          {formatPrice(booking.total_cost)}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(booking.status || 'pending')} data-testid={`badge-status-${booking.id}`}>
                          {booking.status || 'pending'}
                        </Badge>
                        {booking.status === 'pending' && (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() => bookingStatusMutation.mutate({ bookingId: booking.id, status: 'confirmed' })}
                              disabled={bookingStatusMutation.isPending}
                              data-testid={`button-confirm-${booking.id}`}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => bookingStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}
                              disabled={bookingStatusMutation.isPending}
                              data-testid={`button-cancel-${booking.id}`}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && new Date(booking.session_date) < new Date() && (
                          <Button
                            size="sm"
                            onClick={() => bookingStatusMutation.mutate({ bookingId: booking.id, status: 'completed' })}
                            disabled={bookingStatusMutation.isPending}
                            data-testid={`button-complete-${booking.id}`}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                    {booking.session_notes && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Notes:</strong> {booking.session_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}