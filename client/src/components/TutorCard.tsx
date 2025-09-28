import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, DollarSign, BookOpen, Heart } from "lucide-react";

export interface Tutor {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  subjects: string[];
  bio: string;
  availability: string;
  totalSessions: number;
  responseTime: string;
  isOnline: boolean;
  languages: string[];
}

interface TutorCardProps {
  tutor: Tutor;
  onBook?: (tutorId: string) => void;
  onFavorite?: (tutorId: string) => void;
  onViewProfile?: (tutorId: string) => void;
}

export function TutorCard({ tutor, onBook, onFavorite, onViewProfile }: TutorCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleBook = () => {
    onBook?.(tutor.id);
    console.log("Booking tutor:", tutor.name);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(tutor.id);
    console.log("Favorited tutor:", tutor.name);
  };

  const handleViewProfile = () => {
    onViewProfile?.(tutor.id);
    console.log("Viewing profile:", tutor.name);
  };

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-tutor-${tutor.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={tutor.avatar} alt={tutor.name} />
              <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              tutor.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{tutor.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{tutor.rating}</span>
                    <span className="text-sm text-muted-foreground">({tutor.totalReviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>${tutor.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavorite}
                data-testid={`button-favorite-tutor-${tutor.id}`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tutor.bio}</p>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{tutor.totalSessions} sessions completed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Responds in {tutor.responseTime}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Subjects:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tutor.subjects.slice(0, 3).map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
              {tutor.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">+{tutor.subjects.length - 3}</Badge>
              )}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-muted-foreground">Languages:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tutor.languages.map((language, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleViewProfile}
          className="flex-1"
          data-testid={`button-view-profile-${tutor.id}`}
        >
          View Profile
        </Button>
        <Button
          onClick={handleBook}
          className="flex-1"
          data-testid={`button-book-tutor-${tutor.id}`}
        >
          Book Session
        </Button>
      </CardFooter>
    </Card>
  );
}