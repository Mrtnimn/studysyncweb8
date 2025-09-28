import { StudyRoomCard } from '../StudyRoomCard';

export default function StudyRoomCardExample() {
  //todo: remove mock functionality - replace with real room data
  const mockRoom = {
    id: "room-1",
    title: "Advanced Calculus Study Group",
    description: "Join us for intensive calculus problem-solving sessions. We'll cover derivatives, integrals, and differential equations.",
    subject: "Mathematics",
    participants: 8,
    maxParticipants: 12,
    duration: "2h 30m",
    rating: 4.8,
    isPrivate: false,
    host: {
      name: "Dr. Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face"
    },
    tags: ["Calculus", "Problem Solving", "Advanced", "University Level"],
    hasVideo: true
  };

  return (
    <div className="max-w-sm">
      <StudyRoomCard
        room={mockRoom}
        onJoin={(roomId) => console.log('Joining room:', roomId)}
        onFavorite={(roomId) => console.log('Favorited room:', roomId)}
      />
    </div>
  );
}