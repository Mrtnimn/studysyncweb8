import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Play, Pause, SkipForward, Volume2, Music, Image, Bell, BellOff, 
  Maximize, Minimize, Upload, Youtube, Timer, Settings,
  Moon, Sun, Waves, Mountain, Coffee, Library, Eye, EyeOff
} from "lucide-react";
import { StudyTimer } from "./StudyTimer";

interface SoloStudyProps {
  onSessionComplete?: (duration: number) => void;
  onSessionStart?: () => void;
  onSessionPause?: () => void;
}

interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: number;
  type: 'local' | 'youtube' | 'spotify';
}

interface Wallpaper {
  id: string;
  name: string;
  url: string;
  category: 'nature' | 'library' | 'minimal' | 'custom';
  preview: string;
}

export function SoloStudy({ onSessionComplete, onSessionStart, onSessionPause }: SoloStudyProps) {
  // Core state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // Music state
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  // Wallpaper state
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null);
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null);
  const spotifyIframeRef = useRef<HTMLIFrameElement>(null);

  // Pre-loaded study wallpapers
  const studyWallpapers: Wallpaper[] = [
    {
      id: 'forest',
      name: 'Forest Focus',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop',
      category: 'nature',
      preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop'
    },
    {
      id: 'library',
      name: 'Classic Library',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop',
      category: 'library',
      preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop'
    },
    {
      id: 'minimal',
      name: 'Clean Minimal',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&h=1080&fit=crop',
      category: 'minimal',
      preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop'
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&h=1080&fit=crop',
      category: 'nature',
      preview: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=200&fit=crop'
    },
    {
      id: 'mountains',
      name: 'Mountain Peace',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      category: 'nature',
      preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'
    },
    {
      id: 'coffee-shop',
      name: 'Cozy Coffee Shop',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&h=1080&fit=crop',
      category: 'library',
      preview: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop'
    }
  ];

  // Fullscreen functionality and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyboard = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleDoNotDisturb();
          }
          break;
        case 'escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('studySync-soloStudy-preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.volume) setVolume([preferences.volume]);
        if (preferences.wallpaper) {
          const wallpaper = studyWallpapers.find(w => w.id === preferences.wallpaper);
          if (wallpaper) setSelectedWallpaper(wallpaper);
        }
        if (preferences.doNotDisturb) setIsDoNotDisturb(preferences.doNotDisturb);
      } catch (error) {
        console.log('Failed to load preferences:', error);
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyboard);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  // Save preferences to localStorage
  const savePreferences = () => {
    const preferences = {
      volume: volume[0],
      wallpaper: selectedWallpaper?.id || null,
      doNotDisturb: isDoNotDisturb,
      playlist: playlist.map(track => ({ ...track, url: track.type === 'local' ? null : track.url }))
    };
    localStorage.setItem('studySync-soloStudy-preferences', JSON.stringify(preferences));
  };

  // Auto-save preferences when state changes
  useEffect(() => {
    savePreferences();
  }, [volume, selectedWallpaper, isDoNotDisturb, playlist]);

  // Do Not Disturb mode
  const toggleDoNotDisturb = () => {
    setIsDoNotDisturb(!isDoNotDisturb);
    
    if (!isDoNotDisturb) {
      // Enable DND mode
      if ('Notification' in window && Notification.permission === 'granted') {
        console.log('Do Not Disturb enabled - notifications will be suppressed');
      }
      
      // Change page title to show focus mode
      document.title = `🔕 Focus Mode - StudySync`;
    } else {
      // Disable DND mode
      document.title = 'StudySync - Collaborative Study Platform';
    }
  };

  // Music functionality
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const newTrack: MusicTrack = {
          id: Date.now().toString() + Math.random(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          url,
          type: 'local'
        };
        
        setPlaylist(prev => [...prev, newTrack]);
        
        if (!currentTrack) {
          setCurrentTrack(newTrack);
        }
      }
    });
  };

  const addSpotifyPlaylist = () => {
    if (!spotifyPlaylistUrl.trim()) return;
    
    // Extract playlist ID from Spotify URL
    const playlistId = spotifyPlaylistUrl.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
    
    if (playlistId) {
      const spotifyTrack: MusicTrack = {
        id: playlistId,
        title: 'Spotify Playlist',
        url: spotifyPlaylistUrl,
        type: 'spotify'
      };
      
      setPlaylist(prev => [...prev, spotifyTrack]);
      setCurrentTrack(spotifyTrack);
      setSpotifyPlaylistUrl("");
    }
  };

  const addYouTubeTrack = () => {
    if (!youtubeUrl.trim()) return;
    
    // Extract video ID from YouTube URL
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
    
    if (videoId) {
      const youtubeTrack: MusicTrack = {
        id: videoId,
        title: 'YouTube Music',
        url: `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&showinfo=0&modestbranding=1`,
        type: 'youtube'
      };
      
      setPlaylist(prev => [...prev, youtubeTrack]);
      setCurrentTrack(youtubeTrack);
      setYoutubeUrl("");
    }
  };

  // Get YouTube video title (optional enhancement)
  const getYouTubeTitle = async (videoId: string) => {
    try {
      // This would require YouTube API key - for now using simple title
      return `YouTube Video ${videoId}`;
    } catch {
      return 'YouTube Music';
    }
  };

  const togglePlayPause = () => {
    if (currentTrack?.type === 'local' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
  };

  // Wallpaper functionality
  const handleWallpaperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setCustomWallpaper(url);
      setSelectedWallpaper({
        id: 'custom',
        name: 'Custom Wallpaper',
        url,
        category: 'custom',
        preview: url
      });
    }
  };

  const selectWallpaper = (wallpaper: Wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setCustomWallpaper(null);
  };

  // Timer integration
  const handleTimerStart = () => {
    setIsTimerActive(true);
    onSessionStart?.();
  };

  const handleTimerPause = () => {
    setIsTimerActive(false);
    onSessionPause?.();
  };

  const handleTimerComplete = (duration: number) => {
    setIsTimerActive(false);
    onSessionComplete?.(duration);
  };

  // Dynamic background style
  const backgroundStyle = selectedWallpaper ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${selectedWallpaper.url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {};

  const containerClasses = `min-h-screen transition-all duration-300 ${
    isDoNotDisturb ? 'bg-slate-900' : ''
  } ${isTimerActive && isDoNotDisturb ? 'animate-pulse' : ''}`;

  return (
    <div className={containerClasses} style={backgroundStyle}>
      {/* Fullscreen Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDoNotDisturb}
          className="bg-background/80 backdrop-blur-sm"
          data-testid="button-dnd-toggle"
        >
          {isDoNotDisturb ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-background/80 backdrop-blur-sm"
          data-testid="button-fullscreen-toggle"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>

      <div className="p-6 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold font-['Poppins'] text-white drop-shadow-lg">
              Solo Study Session
            </h1>
            <p className="text-white/80 text-lg drop-shadow-md">
              Your personalized focus environment with ambient music and beautiful backgrounds
            </p>
            {isDoNotDisturb && (
              <Badge className="bg-red-500/80 text-white backdrop-blur-sm">
                Do Not Disturb Mode Active
              </Badge>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Timer Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/90 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    <span>Focus Timer</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StudyTimer
                    onSessionComplete={handleTimerComplete}
                    onSessionStart={handleTimerStart}
                    onSessionPause={handleTimerPause}
                  />
                </CardContent>
              </Card>

              {/* Music Player */}
              <Card className="bg-white/90 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    <span>Ambient Music</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="local" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="local" data-testid="tab-local-music">Local Files</TabsTrigger>
                      <TabsTrigger value="spotify" data-testid="tab-spotify-music">Spotify</TabsTrigger>
                      <TabsTrigger value="youtube" data-testid="tab-youtube-music">YouTube</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="local" className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="audio/*"
                          multiple
                          className="hidden"
                          data-testid="input-file-upload"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="flex-1"
                          data-testid="button-upload-music"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Music Files
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="spotify" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Spotify Playlist URL</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://open.spotify.com/playlist/..."
                            value={spotifyPlaylistUrl}
                            onChange={(e) => setSpotifyPlaylistUrl(e.target.value)}
                            data-testid="input-spotify-url"
                          />
                          <Button onClick={addSpotifyPlaylist} data-testid="button-add-spotify">
                            Add
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="youtube" className="space-y-4">
                      <div className="space-y-2">
                        <Label>YouTube Video/Playlist URL</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://youtube.com/watch?v=..."
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            data-testid="input-youtube-url"
                          />
                          <Button onClick={addYouTubeTrack} data-testid="button-add-youtube">
                            Add
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Music Player Controls */}
                  {currentTrack && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{currentTrack.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {currentTrack.type} • {currentTrack.artist || 'Unknown Artist'}
                          </p>
                        </div>
                        <Badge variant="secondary">{currentTrack.type}</Badge>
                      </div>
                      
                      {/* Local Music Controls */}
                      {currentTrack.type === 'local' && (
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePlayPause}
                            data-testid="button-play-pause"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          
                          <div className="flex items-center gap-2 flex-1">
                            <Volume2 className="w-4 h-4" />
                            <Slider
                              value={volume}
                              onValueChange={handleVolumeChange}
                              max={100}
                              step={1}
                              className="flex-1"
                              data-testid="slider-volume"
                            />
                            <span className="text-sm text-muted-foreground w-8">{volume[0]}%</span>
                          </div>
                        </div>
                      )}

                      {/* YouTube Embedded Player */}
                      {currentTrack.type === 'youtube' && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">YouTube Music Player</p>
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <iframe
                              ref={youtubeIframeRef}
                              src={currentTrack.url}
                              title={currentTrack.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                              data-testid="youtube-player"
                            />
                          </div>
                        </div>
                      )}

                      {/* Spotify Embedded Player */}
                      {currentTrack.type === 'spotify' && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Spotify Music Player</p>
                          <div className="bg-black rounded-lg overflow-hidden">
                            <iframe
                              ref={spotifyIframeRef}
                              src={currentTrack.url.replace('/playlist/', '/embed/playlist/')}
                              width="100%"
                              height="352"
                              frameBorder="0"
                              allowTransparency={true}
                              allow="encrypted-media"
                              title={currentTrack.title}
                              className="w-full"
                              data-testid="spotify-player"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Playlist Display */}
                  {playlist.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Playlist ({playlist.length} tracks)</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {playlist.map((track) => (
                          <div
                            key={track.id}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                              currentTrack?.id === track.id 
                                ? 'bg-primary/20 border border-primary/30' 
                                : 'bg-muted/30 hover:bg-muted/50'
                            }`}
                            onClick={() => setCurrentTrack(track)}
                            data-testid={`track-${track.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm truncate">{track.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {track.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Wallpaper Selection Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    <span>Study Backgrounds</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom Upload */}
                  <div>
                    <input
                      type="file"
                      ref={wallpaperInputRef}
                      onChange={handleWallpaperUpload}
                      accept="image/*"
                      className="hidden"
                      data-testid="input-wallpaper-upload"
                    />
                    <Button
                      onClick={() => wallpaperInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                      data-testid="button-upload-wallpaper"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Custom Background
                    </Button>
                  </div>

                  {/* Pre-loaded Wallpapers */}
                  <div className="grid grid-cols-2 gap-2">
                    {studyWallpapers.map((wallpaper) => (
                      <div
                        key={wallpaper.id}
                        className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedWallpaper?.id === wallpaper.id 
                            ? 'border-primary shadow-lg' 
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                        onClick={() => selectWallpaper(wallpaper)}
                        data-testid={`wallpaper-${wallpaper.id}`}
                      >
                        <img
                          src={wallpaper.preview}
                          alt={wallpaper.name}
                          className="w-full h-20 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-end">
                          <p className="text-white text-xs p-2 font-medium truncate w-full">
                            {wallpaper.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedWallpaper && (
                    <div className="text-center">
                      <Badge className="bg-primary/80 text-white">
                        Current: {selectedWallpaper.name}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Study Environment Controls */}
              <Card className="bg-white/90 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    <span>Environment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Do Not Disturb</Label>
                    <Button
                      variant={isDoNotDisturb ? "default" : "outline"}
                      size="sm"
                      onClick={toggleDoNotDisturb}
                      data-testid="button-toggle-dnd"
                    >
                      {isDoNotDisturb ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Fullscreen Mode</Label>
                    <Button
                      variant={isFullscreen ? "default" : "outline"}
                      size="sm"
                      onClick={toggleFullscreen}
                      data-testid="button-toggle-fullscreen"
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Keyboard Shortcuts Guide */}
              <Card className="bg-white/90 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-sm">⌨️ Keyboard Shortcuts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Play/Pause</span>
                      <Badge variant="outline" className="text-xs">Space</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fullscreen</span>
                      <Badge variant="outline" className="text-xs">Ctrl+F</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Do Not Disturb</span>
                      <Badge variant="outline" className="text-xs">Ctrl+D</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exit Fullscreen</span>
                      <Badge variant="outline" className="text-xs">Esc</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element for local files */}
      <audio
        ref={audioRef}
        src={currentTrack?.type === 'local' ? currentTrack.url : undefined}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}