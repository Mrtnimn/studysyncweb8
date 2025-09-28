import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageCircle, 
  Share, 
  Users, 
  Clock, 
  Send,
  FileText,
  Presentation,
  Volume2,
  VolumeX,
  Settings,
  Hand,
  Crown,
  Heart
} from "lucide-react";
import { AvatarCompanion, useAvatarCompanion } from "./AvatarCompanion";
import { PageTransition, AnimatedCard } from "./PageTransition";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'celebration';
}

interface StudyParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isOnline: boolean;
  isSpeaking: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  studyStreak: number;
  level: number;
}

interface GroupStudyRoomProps {
  roomId: string;
  roomName: string;
  subject: string;
  onLeaveRoom: () => void;
}

const mockParticipants: StudyParticipant[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isHost: true,
    isOnline: true,
    isSpeaking: false,
    hasVideo: true,
    hasAudio: true,
    studyStreak: 7,
    level: 8
  },
  {
    id: '2',
    name: 'Emma Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332b077?w=150&h=150&fit=crop&crop=face',
    isHost: false,
    isOnline: true,
    isSpeaking: true,
    hasVideo: true,
    hasAudio: true,
    studyStreak: 12,
    level: 10
  },
  {
    id: '3',
    name: 'Marcus Smith',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isHost: false,
    isOnline: true,
    isSpeaking: false,
    hasVideo: false,
    hasAudio: true,
    studyStreak: 3,
    level: 5
  },
  {
    id: '4',
    name: 'Sophia Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isHost: false,
    isOnline: true,
    isSpeaking: false,
    hasVideo: true,
    hasAudio: false,
    studyStreak: 15,
    level: 12
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    userId: 'system',
    userName: 'StudySync',
    message: 'Welcome to the Advanced Calculus Study Group! Let\'s learn together! 📚',
    timestamp: new Date(Date.now() - 300000),
    type: 'system'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Emma Chen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b332b077?w=150&h=150&fit=crop&crop=face',
    message: 'Hey everyone! Ready to tackle derivatives today?',
    timestamp: new Date(Date.now() - 240000),
    type: 'text'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Marcus Smith',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    message: 'Definitely! I have been struggling with the chain rule.',
    timestamp: new Date(Date.now() - 180000),
    type: 'text'
  },
  {
    id: '4',
    userId: '4',
    userName: 'Sophia Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    message: 'I can help with that! Let me share my notes.',
    timestamp: new Date(Date.now() - 120000),
    type: 'text'
  }
];

export function GroupStudyRoom({ roomId, roomName, subject, onLeaveRoom }: GroupStudyRoomProps) {
  const [participants, setParticipants] = useState<StudyParticipant[]>(mockParticipants);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [showParticipants, setShowParticipants] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const companion = useAvatarCompanion();

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    companion.welcome();
  }, [companion]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'You',
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate other participants' reactions
    setTimeout(() => {
      if (Math.random() > 0.7) {
        const reactions = ['👍', '💡', '🎯', '✨', 'Great point!', 'Thanks for sharing!'];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        const randomParticipant = participants[Math.floor(Math.random() * (participants.length - 1)) + 1];
        
        const reactionMessage: ChatMessage = {
          id: (Date.now() + Math.random()).toString(),
          userId: randomParticipant.id,
          userName: randomParticipant.name,
          userAvatar: randomParticipant.avatar,
          message: randomReaction,
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, reactionMessage]);
      }
    }, 1000 + Math.random() * 3000);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Update participant state
    setParticipants(prev => prev.map(p => 
      p.id === '1' ? { ...p, hasVideo: !isVideoOn } : p
    ));
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // Update participant state
    setParticipants(prev => prev.map(p => 
      p.id === '1' ? { ...p, hasAudio: !isAudioOn } : p
    ));
  };

  const celebrateProgress = () => {
    const celebrationMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'StudySync',
      message: 'Amazing progress everyone! Keep up the great work! 🎉',
      timestamp: new Date(),
      type: 'celebration'
    };
    
    setMessages(prev => [...prev, celebrationMessage]);
    companion.celebrate();
  };

  return (
    <PageTransition className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              📚
            </motion.div>
            <div>
              <h1 className="text-xl font-bold font-['Poppins']">{roomName}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{subject}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Users className="w-3 h-3 mr-1" />
                  {participants.length} active
                </Badge>
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(sessionTime)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={celebrateProgress}
              variant="outline"
              size="sm"
              className="bg-purple-50 border-purple-200 hover:bg-purple-100"
            >
              <Heart className="w-4 h-4 mr-1 text-purple-600" />
              Celebrate Progress
            </Button>
            <Button
              onClick={onLeaveRoom}
              variant="outline"
              size="sm"
            >
              Leave Room
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Video Grid Area */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 h-full max-h-[calc(100vh-200px)]">
            {participants.map((participant, index) => (
              <AnimatedCard
                key={participant.id}
                className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg"
              >
                {participant.hasVideo ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-white/20">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm opacity-75">Camera Active</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-gray-600">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                )}
                
                {/* Participant Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {participant.isHost && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="text-white font-medium text-sm">
                        {participant.name}
                      </span>
                      <Badge className="bg-purple-500/80 text-white text-xs">
                        L{participant.level}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {participant.isSpeaking && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Volume2 className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}
                      {!participant.hasAudio && (
                        <MicOff className="w-4 h-4 text-red-400" />
                      )}
                      {!participant.hasVideo && (
                        <VideoOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Speaking Animation */}
                {participant.isSpeaking && (
                  <motion.div
                    className="absolute inset-0 border-4 border-green-400 rounded-xl"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Sidebar with Chat and Participants */}
        <div className="w-80 bg-white/90 backdrop-blur-sm border-l border-gray-200 flex flex-col">
          {/* Tab Header */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setIsChatOpen(true)}
              className={`flex-1 p-3 text-sm font-medium ${
                isChatOpen 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Chat ({messages.length})
            </button>
            <button
              onClick={() => setIsChatOpen(false)}
              className={`flex-1 p-3 text-sm font-medium ${
                !isChatOpen 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              People ({participants.length})
            </button>
          </div>

          {/* Chat Section */}
          {isChatOpen && (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        message.type === 'system' 
                          ? 'text-center' 
                          : message.type === 'celebration'
                          ? 'text-center bg-purple-50 p-2 rounded-lg border border-purple-200'
                          : ''
                      }`}
                    >
                      {message.type === 'system' ? (
                        <div className="text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1 inline-block">
                          {message.message}
                        </div>
                      ) : message.type === 'celebration' ? (
                        <div className="text-sm font-medium text-purple-700">
                          {message.message}
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <Avatar className="w-6 h-6 flex-shrink-0 mt-1">
                            <AvatarImage src={message.userAvatar} />
                            <AvatarFallback className="text-xs">
                              {message.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {message.userName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 break-words">
                              {message.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Participants Section */}
          {!isChatOpen && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {participants.map((participant) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {participant.name}
                        </span>
                        {participant.isHost && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Level {participant.level}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          🔥 {participant.studyStreak} streak
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {participant.hasAudio ? (
                        <Mic className="w-4 h-4 text-green-600" />
                      ) : (
                        <MicOff className="w-4 h-4 text-gray-400" />
                      )}
                      {participant.hasVideo ? (
                        <Video className="w-4 h-4 text-blue-600" />
                      ) : (
                        <VideoOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleAudio}
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={isVideoOn ? "default" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Share className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Presentation className="w-5 h-5" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Hand className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Floating Companion */}
      <div className="absolute bottom-20 left-4 z-50">
        <AvatarCompanion
          mood={companion.mood}
          message={companion.message}
          showMessage={companion.showMessage}
          onInteraction={companion.showEncouragement}
          position="relative"
        />
      </div>
    </PageTransition>
  );
}