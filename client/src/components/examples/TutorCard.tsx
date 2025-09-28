import { TutorCard } from '../TutorCard';

export default function TutorCardExample() {
  //todo: remove mock functionality - replace with real tutor data
  const mockTutor = {
    id: "tutor-1",
    name: "Maria Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    totalReviews: 127,
    hourlyRate: 1, // $1/hour as specified
    subjects: ["Spanish", "Literature", "Writing", "Grammar"],
    bio: "Native Spanish speaker with 8+ years of teaching experience. Specializing in conversational Spanish and academic writing for all levels.",
    availability: "Mon-Fri 9AM-6PM EAT",
    totalSessions: 340,
    responseTime: "< 2 hours",
    isOnline: true,
    languages: ["Spanish", "English", "Portuguese"]
  };

  return (
    <div className="max-w-sm">
      <TutorCard
        tutor={mockTutor}
        onBook={(tutorId) => console.log('Booking tutor:', tutorId)}
        onFavorite={(tutorId) => console.log('Favorited tutor:', tutorId)}
        onViewProfile={(tutorId) => console.log('Viewing profile:', tutorId)}
      />
    </div>
  );
}