import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Clock, Star, Video, Lock, Globe } from "lucide-react";

export interface StudyRoom {
  id: string;
  title: string;
  description: string;
  subject: string;
  participants: number;
  maxParticipants: number;
  duration: string;
  rating: number;
  isPrivate: boolean;
  host: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  hasVideo: boolean;
}

interface StudyRoomCardProps {
  room: StudyRoom;
  onJoin?: (roomId: string) => void;
  onFavorite?: (roomId: string) => void;
}

export function StudyRoomCard({ room, onJoin, onFavorite }: StudyRoomCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleJoin = () => {
    onJoin?.(room.id);
    console.log("Joining room:", room.title);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(room.id);
    console.log("Favorited room:", room.title);
  };

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-study-room-${room.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{room.subject}</Badge>
              {room.isPrivate ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Globe className="w-4 h-4 text-emerald-600" />
              )}
              {room.hasVideo && <Video className="w-4 h-4 text-primary" />}
            </div>
            <h3 className="font-semibold text-lg mb-1">{room.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className="shrink-0"
            data-testid={`button-favorite-${room.id}`}
          >
            <Star
              className={`w-4 h-4 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
            />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{room.participants}/{room.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{room.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{room.rating}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={room.host.avatar} alt={room.host.name} />
            <AvatarFallback className="text-xs">{room.host.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">Hosted by {room.host.name}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {room.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {room.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">+{room.tags.length - 3}</Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={handleJoin}
          className="w-full"
          disabled={room.participants >= room.maxParticipants}
          data-testid={`button-join-${room.id}`}
        >
          {room.participants >= room.maxParticipants ? 'Room Full' : 'Join Study Room'}
        </Button>
      </CardFooter>
    </Card>
  );
}