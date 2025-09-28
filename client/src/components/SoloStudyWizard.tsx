import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, ArrowLeft, Upload, Music, Image as ImageIcon, 
  Timer, FileText, Sparkles, Heart, Target, CheckCircle,
  Volume2, Play, Pause, Settings, Coffee, Library,
  Mountain, Waves, Trees, Sun, BookOpen, Maximize2,
  Minimize2, Eye, Search
} from "lucide-react";
import { AvatarCompanion, useAvatarCompanion } from "./AvatarCompanion";
import { StudyTimer } from "./StudyTimer";
import { PDFViewer } from "./PDFViewer";
import { DictionaryLookup } from "./DictionaryLookup";
import { validateYouTubeURL, validateSpotifyURL, getSecureIframeProps } from "@/utils/security";

// Import background images
import studyBg1 from '@assets/stock_images/peaceful_study_envir_5b4d8ced.jpg';
import studyBg2 from '@assets/stock_images/peaceful_study_envir_dc2a29f2.jpg';
import studyBg3 from '@assets/stock_images/peaceful_study_envir_774d3979.jpg';
import studyBg4 from '@assets/stock_images/peaceful_study_envir_23a114fe.jpg';
import studyBg5 from '@assets/stock_images/peaceful_study_envir_b52fa166.jpg';
import studyBg6 from '@assets/stock_images/peaceful_study_envir_6583786e.jpg';

interface SoloStudyWizardProps {
  onSessionComplete?: (duration: number) => void;
  onSessionStart?: () => void;
  onSessionPause?: () => void;
  onExit?: () => void;
}

interface StudyDocument {
  id: string;
  name: string;
  file: File;
  type: string;
  size: number;
}

interface MusicTrack {
  id: string;
  title: string;
  url: string;
  type: 'local' | 'youtube' | 'spotify';
}

interface StudyBackground {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  preview: string;
}

interface StudySession {
  title: string;
  documents: StudyDocument[];
  background: StudyBackground | null;
  music: MusicTrack | null;
  pomodoroSettings: {
    focusTime: number;
    shortBreak: number;
    longBreak: number;
    sessions: number;
  };
}

type WizardStep = 'welcome' | 'title' | 'documents' | 'background' | 'music' | 'timer' | 'session';

const studyBackgrounds: StudyBackground[] = [
  {
    id: 'library',
    name: 'Peaceful Library',
    url: studyBg1,
    icon: <Library className="w-6 h-6" />,
    preview: studyBg1
  },
  {
    id: 'coffee',
    name: 'Cozy Coffee Shop',
    url: studyBg2,
    icon: <Coffee className="w-6 h-6" />,
    preview: studyBg2
  },
  {
    id: 'nature',
    name: 'Forest Serenity',
    url: studyBg3,
    icon: <Trees className="w-6 h-6" />,
    preview: studyBg3
  },
  {
    id: 'mountain',
    name: 'Mountain Vista',
    url: studyBg4,
    icon: <Mountain className="w-6 h-6" />,
    preview: studyBg4
  },
  {
    id: 'sunset',
    name: 'Golden Hour',
    url: studyBg5,
    icon: <Sun className="w-6 h-6" />,
    preview: studyBg5
  },
  {
    id: 'waves',
    name: 'Ocean Waves',
    url: studyBg6,
    icon: <Waves className="w-6 h-6" />,
    preview: studyBg6
  }
];

export function SoloStudyWizard({ onSessionComplete, onSessionStart, onSessionPause, onExit }: SoloStudyWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [studySession, setStudySession] = useState<StudySession>({
    title: '',
    documents: [],
    background: null,
    music: null,
    pomodoroSettings: {
      focusTime: 25,
      shortBreak: 5,
      longBreak: 15,
      sessions: 4
    }
  });
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  
  // New state for enhanced features
  const [selectedPDF, setSelectedPDF] = useState<StudyDocument | null>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [lookupWord, setLookupWord] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  
  const documentInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const companion = useAvatarCompanion();

  // Calculate progress
  const stepOrder: WizardStep[] = ['welcome', 'title', 'documents', 'background', 'music', 'timer', 'session'];
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / (stepOrder.length - 1)) * 100;

  // Navigation handlers
  const nextStep = useCallback(() => {
    const nextIndex = Math.min(currentStepIndex + 1, stepOrder.length - 1);
    setCurrentStep(stepOrder[nextIndex]);
    
    // Trigger companion reactions
    if (stepOrder[nextIndex] === 'session') {
      companion.celebrate();
    } else {
      companion.showEncouragement();
    }
  }, [currentStepIndex, stepOrder, companion]);

  const prevStep = useCallback(() => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(stepOrder[prevIndex]);
  }, [currentStepIndex, stepOrder]);

  // File upload handlers
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDocuments: StudyDocument[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      file,
      type: file.type,
      size: file.size
    }));

    setStudySession(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('audio/')) return;

    const newTrack: MusicTrack = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
      type: 'local'
    };

    setStudySession(prev => ({ ...prev, music: newTrack }));
  };

  const addYouTubeMusic = () => {
    if (!youtubeUrl.trim()) return;
    
    // Use security validation function
    const validatedUrl = validateYouTubeURL(youtubeUrl);
    
    if (validatedUrl) {
      const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
      const track: MusicTrack = {
        id: videoId || Date.now().toString(),
        title: 'YouTube Music',
        url: validatedUrl, // Use the validated secure URL
        type: 'youtube'
      };
      
      setStudySession(prev => ({ ...prev, music: track }));
      setYoutubeUrl('');
    } else {
      // Show error for invalid URL
      alert('Invalid YouTube URL. Please use a valid YouTube link (youtube.com, youtu.be).');
    }
  };

  const addSpotifyMusic = () => {
    if (!spotifyUrl.trim()) return;
    
    // Use security validation function
    const validatedUrl = validateSpotifyURL(spotifyUrl);
    
    if (validatedUrl) {
      const playlistId = spotifyUrl.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
      const track: MusicTrack = {
        id: playlistId || Date.now().toString(),
        title: 'Spotify Playlist',
        url: validatedUrl, // Use the validated secure URL
        type: 'spotify'
      };
      
      setStudySession(prev => ({ ...prev, music: track }));
      setSpotifyUrl('');
    } else {
      // Show error for invalid URL
      alert('Invalid Spotify URL. Please use a valid Spotify playlist link (open.spotify.com).');
    }
  };

  // Session handlers
  const startSession = () => {
    setIsSessionActive(true);
    setCurrentStep('session');
    companion.celebrate();
    onSessionStart?.();
  };

  const handleSessionComplete = (duration: number) => {
    setIsSessionActive(false);
    exitFullscreen(); // Exit fullscreen when session completes
    companion.celebrate();
    onSessionComplete?.(duration);
  };

  // New handlers for enhanced features
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setDoNotDisturb(true);
    } catch (error) {
      console.log("Fullscreen not supported or denied");
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
      setDoNotDisturb(false);
    } catch (error) {
      console.log("Exit fullscreen failed");
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const openDictionary = (word: string = '') => {
    setLookupWord(word);
    setIsDictionaryOpen(true);
  };

  const closeDictionary = () => {
    setIsDictionaryOpen(false);
    setLookupWord('');
  };

  const openPDFViewer = (document: StudyDocument) => {
    setSelectedPDF(document);
  };

  const closePDFViewer = () => {
    setSelectedPDF(null);
  };

  // Get companion message based on step
  const getCompanionMessage = () => {
    switch (currentStep) {
      case 'welcome':
        return "Welcome to your personal study space! I'm here to help you create the perfect learning environment! 🌟";
      case 'title':
        return "What would you like to call this study session? Give it a name that motivates you! 📚";
      case 'documents':
        return "Upload your study materials! PDFs, documents, anything you need for focused learning! 📄";
      case 'background':
        return "Choose your perfect study ambience! The right environment helps you focus better! 🖼️";
      case 'music':
        return "Add some background music to keep you in the zone! Music can boost your concentration! 🎵";
      case 'timer':
        return "Set up your Pomodoro timer! Focused bursts with breaks help you learn more effectively! ⏰";
      case 'session':
        return "You're all set! Time to focus and learn. I'll be here cheering you on! 🎯";
      default:
        return "Let's create an amazing study session together! 💪";
    }
  };

  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      x: -50, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  // Background style for session
  const sessionBackgroundStyle = studySession.background ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${studySession.background.url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {};

  if (currentStep === 'session') {
    return (
      <div className="min-h-screen" style={sessionBackgroundStyle}>
        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStep('timer');
              setIsSessionActive(false);
              exitFullscreen();
            }}
            className="bg-white/80 backdrop-blur-sm"
            data-testid="button-back-to-setup"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setup
          </Button>
          
          <Button
            variant="outline"
            onClick={toggleFullscreen}
            className="bg-white/80 backdrop-blur-sm"
            data-testid="button-toggle-fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
            {isFullscreen ? 'Exit Focus' : 'Do Not Disturb'}
          </Button>

          <Button
            variant="outline"
            onClick={() => openDictionary()}
            className="bg-white/80 backdrop-blur-sm"
            data-testid="button-open-dictionary"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Dictionary
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Study Documents Sidebar */}
          {studySession.documents.length > 0 && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="lg:w-80 bg-white/95 backdrop-blur-md border-r border-white/20 p-4 overflow-y-auto"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Study Materials
              </h3>
              <div className="space-y-2">
                {studySession.documents.map((doc) => (
                  <motion.div 
                    key={doc.id} 
                    className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-600">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        {doc.type === 'application/pdf' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPDFViewer(doc)}
                            className="h-6 w-6 p-0"
                            data-testid={`button-view-pdf-${doc.id}`}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDictionary()}
                          className="h-6 w-6 p-0"
                          data-testid={`button-lookup-${doc.id}`}
                        >
                          <Search className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Main Session Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl w-full"
            >
              <Card className="bg-white/90 backdrop-blur-md border-white/20 shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {studySession.title || 'Focus Session'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StudyTimer
                    onSessionComplete={handleSessionComplete}
                    onSessionStart={() => setIsSessionActive(true)}
                    onSessionPause={onSessionPause}
                    focusTime={studySession.pomodoroSettings.focusTime}
                    shortBreak={studySession.pomodoroSettings.shortBreak}
                    longBreak={studySession.pomodoroSettings.longBreak}
                    sessions={studySession.pomodoroSettings.sessions}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Music Player */}
            {studySession.music && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 w-full max-w-2xl"
              >
                <Card className="bg-white/90 backdrop-blur-md border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{studySession.music.title}</span>
                      <Badge variant="secondary">{studySession.music.type}</Badge>
                    </div>
                    
                    {studySession.music.type === 'youtube' && (() => {
                      const secureUrl = validateYouTubeURL(studySession.music.url);
                      const secureProps = getSecureIframeProps();
                      
                      return secureUrl ? (
                        <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={secureUrl}
                            title={studySession.music.title}
                            frameBorder="0"
                            {...secureProps}
                            allowFullScreen
                            className="w-full h-full"
                            data-testid="iframe-youtube-player"
                          />
                        </div>
                      ) : (
                        <div className="mt-3 p-4 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-red-800 text-sm">
                            ⚠️ Invalid YouTube URL. Please use a valid YouTube link.
                          </p>
                        </div>
                      );
                    })()}
                    
                    {studySession.music.type === 'spotify' && (() => {
                      const secureUrl = validateSpotifyURL(studySession.music.url);
                      const secureProps = getSecureIframeProps();
                      
                      return secureUrl ? (
                        <div className="mt-3 bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={secureUrl}
                            width="100%"
                            height="352"
                            frameBorder="0"
                            allowTransparency={true}
                            {...secureProps}
                            title={studySession.music.title}
                            className="w-full"
                            data-testid="iframe-spotify-player"
                          />
                        </div>
                      ) : (
                        <div className="mt-3 p-4 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-red-800 text-sm">
                            ⚠️ Invalid Spotify URL. Please use a valid Spotify link.
                          </p>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Floating Companion */}
          <div className="fixed bottom-6 right-6 z-50">
            <AvatarCompanion
              mood={companion.mood}
              message={companion.message}
              showMessage={companion.showMessage}
              onInteraction={companion.showEncouragement}
              position="relative"
            />
          </div>
        </div>

        {/* PDF Viewer Modal */}
        {selectedPDF && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-6xl h-[90vh] m-4">
              <PDFViewer
                file={selectedPDF.file}
                onClose={closePDFViewer}
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Dictionary Lookup Modal */}
        <DictionaryLookup
          isOpen={isDictionaryOpen}
          onClose={closeDictionary}
          initialWord={lookupWord}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-700">Study Session Setup</h2>
          <span className="text-sm text-gray-600">
            Step {currentStepIndex + 1} of {stepOrder.length - 1}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar Companion */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="sticky top-6"
            >
              <AvatarCompanion
                mood={companion.mood}
                message={getCompanionMessage()}
                showMessage={true}
                onInteraction={companion.showEncouragement}
                size="large"
                position="relative"
              />
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Step Content */}
                {currentStep === 'welcome' && (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                      </motion.div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Welcome to Solo Study! 
                      </CardTitle>
                      <p className="text-gray-600 text-lg mt-2">
                        Let's create your perfect study environment together! ✨
                      </p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-center gap-4 p-4 bg-blue-50 rounded-lg">
                          <Target className="w-6 h-6 text-blue-600" />
                          <span className="text-blue-800 font-medium">Focused Learning Environment</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 p-4 bg-green-50 rounded-lg">
                          <Heart className="w-6 h-6 text-green-600" />
                          <span className="text-green-800 font-medium">Personalized Study Experience</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 p-4 bg-purple-50 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-purple-600" />
                          <span className="text-purple-800 font-medium">Pomodoro Timer Integration</span>
                        </div>
                      </div>
                      <Button 
                        onClick={nextStep} 
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3 shadow-lg"
                      >
                        Let's Get Started! 
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 'title' && (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-center">Name Your Study Session</CardTitle>
                      <p className="text-gray-600 text-center">Give your session a motivating title (optional)</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="session-title" className="text-lg font-medium">Session Title</Label>
                        <Input
                          id="session-title"
                          placeholder="e.g., 'Mastering Calculus', 'Spanish Vocabulary', 'History Essay'"
                          value={studySession.title}
                          onChange={(e) => setStudySession(prev => ({ ...prev, title: e.target.value }))}
                          className="mt-2 text-lg h-12"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button onClick={nextStep} size="lg" className="flex-1 bg-purple-600 hover:bg-purple-700">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 'documents' && (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-center">Upload Study Materials</CardTitle>
                      <p className="text-gray-600 text-center">Add documents, PDFs, or any files you'll need</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <input
                          type="file"
                          ref={documentInputRef}
                          onChange={handleDocumentUpload}
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          className="hidden"
                        />
                        <Button
                          onClick={() => documentInputRef.current?.click()}
                          variant="outline"
                          size="lg"
                          className="w-full h-32 border-dashed border-2 hover:border-purple-400 hover:bg-purple-50"
                        >
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <span className="text-lg font-medium">Upload Documents</span>
                            <p className="text-sm text-gray-500 mt-1">PDF, DOC, TXT, PPT files</p>
                          </div>
                        </Button>
                      </div>

                      {studySession.documents.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Uploaded Documents ({studySession.documents.length})</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {studySession.documents.map((doc) => (
                              <div key={doc.id} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm truncate">{doc.name}</p>
                                  <p className="text-xs text-gray-600">
                                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button onClick={nextStep} size="lg" className="flex-1 bg-purple-600 hover:bg-purple-700">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 'background' && (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-center">Choose Your Study Environment</CardTitle>
                      <p className="text-gray-600 text-center">Select a serene background for focus and ambience</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {studyBackgrounds.map((bg) => (
                          <motion.div
                            key={bg.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                              studySession.background?.id === bg.id 
                                ? 'border-purple-500 shadow-lg' 
                                : 'border-transparent hover:border-purple-300'
                            }`}
                            onClick={() => setStudySession(prev => ({ ...prev, background: bg }))}
                          >
                            <img
                              src={bg.preview}
                              alt={bg.name}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="text-center text-white">
                                {bg.icon}
                                <p className="text-sm font-medium mt-1">{bg.name}</p>
                              </div>
                            </div>
                            {studySession.background?.id === bg.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                              >
                                <CheckCircle className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button 
                          onClick={nextStep} 
                          size="lg" 
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          disabled={!studySession.background}
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 'music' && (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-center">Add Background Music</CardTitle>
                      <p className="text-gray-600 text-center">Upload music files or add YouTube/Spotify links</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        {/* Local Music Upload */}
                        <div>
                          <Label className="font-medium">Upload Local Music</Label>
                          <input
                            type="file"
                            ref={musicInputRef}
                            onChange={handleMusicUpload}
                            accept="audio/*"
                            className="hidden"
                          />
                          <Button
                            onClick={() => musicInputRef.current?.click()}
                            variant="outline"
                            className="w-full mt-2"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Audio File
                          </Button>
                        </div>

                        {/* YouTube */}
                        <div>
                          <Label className="font-medium">YouTube Music</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              value={youtubeUrl}
                              onChange={(e) => setYoutubeUrl(e.target.value)}
                            />
                            <Button onClick={addYouTubeMusic}>Add</Button>
                          </div>
                        </div>

                        {/* Spotify */}
                        <div>
                          <Label className="font-medium">Spotify Playlist</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="https://open.spotify.com/playlist/..."
                              value={spotifyUrl}
                              onChange={(e) => setSpotifyUrl(e.target.value)}
                            />
                            <Button onClick={addSpotifyMusic}>Add</Button>
                          </div>
                        </div>
                      </div>

                      {studySession.music && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <Music className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium">{studySession.music.title}</p>
                              <Badge variant="secondary">{studySession.music.type}</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button onClick={nextStep} size="lg" className="flex-1 bg-purple-600 hover:bg-purple-700">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === 'timer' && (
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-center">Configure Pomodoro Timer</CardTitle>
                      <p className="text-gray-600 text-center">Set your focus and break intervals</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Focus Time (minutes)</Label>
                          <Input
                            type="number"
                            value={studySession.pomodoroSettings.focusTime}
                            onChange={(e) => setStudySession(prev => ({
                              ...prev,
                              pomodoroSettings: { ...prev.pomodoroSettings, focusTime: parseInt(e.target.value) || 25 }
                            }))}
                            min="1"
                            max="120"
                          />
                        </div>
                        
                        <div>
                          <Label>Short Break (minutes)</Label>
                          <Input
                            type="number"
                            value={studySession.pomodoroSettings.shortBreak}
                            onChange={(e) => setStudySession(prev => ({
                              ...prev,
                              pomodoroSettings: { ...prev.pomodoroSettings, shortBreak: parseInt(e.target.value) || 5 }
                            }))}
                            min="1"
                            max="30"
                          />
                        </div>
                        
                        <div>
                          <Label>Long Break (minutes)</Label>
                          <Input
                            type="number"
                            value={studySession.pomodoroSettings.longBreak}
                            onChange={(e) => setStudySession(prev => ({
                              ...prev,
                              pomodoroSettings: { ...prev.pomodoroSettings, longBreak: parseInt(e.target.value) || 15 }
                            }))}
                            min="1"
                            max="60"
                          />
                        </div>
                        
                        <div>
                          <Label>Sessions Before Long Break</Label>
                          <Input
                            type="number"
                            value={studySession.pomodoroSettings.sessions}
                            onChange={(e) => setStudySession(prev => ({
                              ...prev,
                              pomodoroSettings: { ...prev.pomodoroSettings, sessions: parseInt(e.target.value) || 4 }
                            }))}
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button 
                          onClick={startSession} 
                          size="lg" 
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                        >
                          Start Study Session!
                          <Timer className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}