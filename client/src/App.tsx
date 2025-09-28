import { useState } from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { SoloStudyWizard } from "@/components/SoloStudyWizard";
import { StudyCalendar } from "@/components/StudyCalendar";
import { AuthWrapper } from "@/components/AuthWrapper";
import { AchievementSystem } from "@/components/AchievementSystem";
import { GroupStudyRoom } from "@/components/GroupStudyRoom";
import { TutorMarketplace } from "@/components/TutorMarketplace";
import { TutorProfileManager } from "@/components/TutorProfileManager";

function App() {
  const [currentPath, setCurrentPath] = useState("/dashboard");
  const [selectedRoom, setSelectedRoom] = useState<{id: string, name: string, subject: string} | null>(null);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const handleNavigation = (path: string) => {
    setCurrentPath(path);
    console.log("Navigating to:", path);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthWrapper onAuthStateChange={(user) => console.log('Auth state changed:', user)}>
          {(user) => (
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar onNavigate={handleNavigation} />
                <div className="flex flex-col flex-1">
                  <Header
                    user={{
                      name: user.name,
                      email: user.email || 'user@studysync.com',
                      avatar: user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                      streak: user.study_streak || 0,
                      xp: user.total_xp || 0
                    }}
                    onSearch={(query) => console.log('Searching for:', query)}
                    onNotificationClick={() => console.log('Notifications opened')}
                  />
                  <main className="flex-1 overflow-auto p-6 bg-background">
                {/* Main Content Based on Current Path */}
                {currentPath === "/dashboard" && (
                  <Dashboard
                    user={user}
                    onCreateRoom={() => console.log("Creating new study room")}
                    onJoinRoom={(roomId) => console.log("Joining room:", roomId)}
                    onBookTutor={(tutorId) => console.log("Booking tutor:", tutorId)}
                  />
                )}
                
                {currentPath === "/calendar" && (
                  <StudyCalendar
                    onEventCreate={(event) => console.log('Event created:', event)}
                    onEventUpdate={(eventId, updates) => console.log('Event updated:', eventId, updates)}
                  />
                )}
                
                {currentPath === "/study-rooms" && (
                  selectedRoom ? (
                    <GroupStudyRoom
                      roomId={selectedRoom.id}
                      roomName={selectedRoom.name}
                      subject={selectedRoom.subject}
                      onLeaveRoom={() => setSelectedRoom(null)}
                    />
                  ) : (
                    <div className="space-y-6" data-testid="study-rooms-page">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-3xl font-bold font-['Poppins']">Study Rooms</h1>
                          <p className="text-gray-600 mt-2">
                            Join collaborative study sessions with peers around the world
                          </p>
                        </div>
                        <button 
                          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          onClick={() => console.log('Create room clicked')}
                        >
                          ➕ Create Room
                        </button>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl">🏠</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Active Study Rooms</h3>
                            <p className="text-gray-600 text-sm">Choose a room to join or create your own</p>
                          </div>
                        </div>
                      </div>

                      <GroupStudyRoomsGrid 
                        onSelectRoom={(room) => setSelectedRoom({id: room.id, name: room.name, subject: room.subject})}
                      />

                      <div className="grid md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            📚 Study Tips
                          </h3>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Use headphones for better audio quality</li>
                            <li>• Keep your camera on to stay engaged</li>
                            <li>• Share your screen when explaining concepts</li>
                            <li>• Take breaks every 25-30 minutes</li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            🌟 Benefits
                          </h3>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Learn from peers and different perspectives</li>
                            <li>• Stay motivated through accountability</li>
                            <li>• Improve communication skills</li>
                            <li>• Build lasting study friendships</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                )}
                
                {currentPath === "/tutors" && (
                  <TutorMarketplace />
                )}
                
                {currentPath === "/tutor-profile" && (
                  <TutorProfileManager />
                )}
                
                {currentPath === "/solo-study" && (
                  <SoloStudyWizard
                    onSessionComplete={(duration) => console.log(`Solo study session completed: ${duration} minutes`)}
                    onSessionStart={() => console.log('Solo study session started')}
                    onSessionPause={() => console.log('Solo study session paused')}
                    onExit={() => setCurrentPath("/dashboard")}
                  />
                )}
                
                {currentPath === "/group-sessions" && (
                  selectedRoom ? (
                    <GroupStudyRoom
                      roomId={selectedRoom.id}
                      roomName={selectedRoom.name}
                      subject={selectedRoom.subject}
                      onLeaveRoom={() => setSelectedRoom(null)}
                    />
                  ) : (
                    <div className="space-y-6" data-testid="group-sessions-page">
                      <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold font-['Poppins'] bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                          👥 Group Study Sessions
                        </h1>
                        <p className="text-gray-600 text-lg">
                          Join live study rooms with students from around the world!
                        </p>
                      </div>

                      <GroupStudyRoomsGrid 
                        onSelectRoom={(room) => setSelectedRoom({id: room.id, name: room.name, subject: room.subject})}
                      />
                      
                      <div className="text-center">
                        <p className="text-gray-500 mb-4">
                          Don't see a room for your subject? Create your own!
                        </p>
                        <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                          ➕ Create New Room
                        </button>
                      </div>
                    </div>
                  )
                )}
                
                {currentPath === "/achievements" && (
                  <AchievementSystemWrapper
                    user={user}
                    onAchievementUnlocked={(achievement) => console.log('Achievement unlocked:', achievement)}
                  />
                )}
                
                {currentPath === "/streak" && (
                  <div className="space-y-4" data-testid="streak-page">
                    <h1 className="text-3xl font-bold font-['Poppins'] flex items-center gap-2">
                      🔥 Study Streak Dashboard
                    </h1>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                        <div className="text-center">
                          <div className="text-5xl mb-2">🔥</div>
                          <div className="text-3xl font-bold text-orange-600">7</div>
                          <div className="text-orange-700 font-medium">Current Streak</div>
                          <div className="text-sm text-orange-600 mt-1">Keep it going!</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                        <div className="text-center">
                          <div className="text-5xl mb-2">⭐</div>
                          <div className="text-3xl font-bold text-yellow-600">15</div>
                          <div className="text-yellow-700 font-medium">Longest Streak</div>
                          <div className="text-sm text-yellow-600 mt-1">Personal best!</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                        <div className="text-center">
                          <div className="text-5xl mb-2">🎯</div>
                          <div className="text-3xl font-bold text-purple-600">30</div>
                          <div className="text-purple-700 font-medium">Goal</div>
                          <div className="text-sm text-purple-600 mt-1">You can do it!</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentPath === "/settings" && (
                  <SettingsPage 
                    user={user}
                    onUpdateProfile={(updates) => console.log('Profile updated:', updates)}
                    onUpdatePreferences={(prefs) => console.log('Preferences updated:', prefs)}
                  />
                )}
                  </main>
                </div>
              </div>
            </SidebarProvider>
          )}
        </AuthWrapper>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

// Settings Page Component
function SettingsPage({ user, onUpdateProfile, onUpdatePreferences }: {
  user: any;
  onUpdateProfile: (updates: any) => void;
  onUpdatePreferences: (prefs: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [displayName, setDisplayName] = useState(user.display_name || user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [bio, setBio] = useState(user.bio || '');
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'account', name: 'Account', icon: '🔒' }
  ];

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-['Poppins']">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              data-testid={`settings-tab-${tab.id}`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Profile Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid="input-display-name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                  data-testid="textarea-bio"
                />
              </div>

              <button
                onClick={() => onUpdateProfile({ display_name: displayName, email, bio })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                data-testid="button-save-profile"
              >
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Study Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Study Session Duration</h4>
                    <p className="text-sm text-gray-600">Default length for solo study sessions</p>
                  </div>
                  <select className="border border-gray-300 rounded-lg px-3 py-2" data-testid="select-session-duration">
                    <option value="25">25 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Break Duration</h4>
                    <p className="text-sm text-gray-600">Length of breaks between study sessions</p>
                  </div>
                  <select className="border border-gray-300 rounded-lg px-3 py-2" data-testid="select-break-duration">
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => onUpdatePreferences({ sessionDuration: 25, breakDuration: 5 })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                data-testid="button-save-preferences"
              >
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                      data-testid="toggle-notifications"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Updates</h4>
                    <p className="text-sm text-gray-600">Receive weekly progress reports via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailUpdates}
                      onChange={(e) => setEmailUpdates(e.target.checked)}
                      className="sr-only peer"
                      data-testid="toggle-email-updates"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Study Reminders</h4>
                    <p className="text-sm text-gray-600">Get reminders to maintain your study streak</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={studyReminders}
                      onChange={(e) => setStudyReminders(e.target.checked)}
                      className="sr-only peer"
                      data-testid="toggle-study-reminders"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <button
                onClick={() => onUpdatePreferences({ notifications, emailUpdates, studyReminders })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                data-testid="button-save-notifications"
              >
                Save Notification Settings
              </button>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Account Management</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.total_xp || 0}</div>
                  <div className="text-sm text-blue-700">Total XP</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{user.study_streak || 0}</div>
                  <div className="text-sm text-green-700">Study Streak</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{user.study_level || 1}</div>
                  <div className="text-sm text-purple-700">Study Level</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-3 text-red-600">Danger Zone</h4>
                <div className="space-y-3">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Log Out
                  </button>
                  <div>
                    <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors border border-red-300">
                      Delete Account
                    </button>
                    <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to fetch and display real group study rooms
function GroupStudyRoomsGrid({ onSelectRoom }: { 
  onSelectRoom: (room: any) => void; 
}) {
  // Fetch active group rooms
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['/api/rooms'],
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
        ))}
      </div>
    );
  }

  const typedRooms = (rooms as any[]) || [];

  // If no rooms exist, show placeholder rooms to demonstrate the UI
  const displayRooms = typedRooms.length > 0 ? typedRooms : [
    {
      id: 'demo-1',
      name: 'Calculus Study Group',
      subject: 'Mathematics',
      current_participants: 3,
      max_participants: 6,
      host_id: 'demo-host-1',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-2', 
      name: 'Biology Lab Session',
      subject: 'Biology',
      current_participants: 2,
      max_participants: 4,
      host_id: 'demo-host-2',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      name: 'Spanish Conversation',
      subject: 'Spanish',
      current_participants: 4,
      max_participants: 8,
      host_id: 'demo-host-3',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayRooms.map((room) => (
        <div key={room.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectRoom(room)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" data-testid={`room-name-${room.id}`}>{room.name}</h3>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
              Live
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">📚</span>
              <span className="text-sm font-medium" data-testid={`room-subject-${room.id}`}>{room.subject}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-purple-600">👥</span>
              <span className="text-sm" data-testid={`room-participants-${room.id}`}>
                {room.current_participants}/{room.max_participants} participants
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500">⏱️</span>
              <span className="text-sm text-gray-600">
                Started {new Date(room.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <button 
            className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200"
            data-testid={`join-room-${room.id}`}
          >
            Join Room
          </button>
        </div>
      ))}
    </div>
  );
}

// Wrapper component to fetch real achievement data
function AchievementSystemWrapper({ user, onAchievementUnlocked }: { 
  user: any; 
  onAchievementUnlocked?: (achievement: any) => void; 
}) {
  // Fetch all achievements
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements'],
  });

  // Fetch user's unlocked achievements
  const { data: userAchievements = [], isLoading: userAchievementsLoading } = useQuery({
    queryKey: ['/api/achievements/me'],
  });

  if (achievementsLoading || userAchievementsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const mappedAchievements = achievements.map((achievement: any) => ({
    id: achievement.id,
    title: achievement.name,
    description: achievement.description,
    icon: mapIcon(achievement.icon),
    category: mapCategory(achievement.category),
    rarity: mapRarity(achievement.category),
    xpReward: achievement.xp_reward,
    unlocked: userAchievements.some((ua: any) => ua.achievement_id === achievement.id),
    unlockedAt: userAchievements.find((ua: any) => ua.achievement_id === achievement.id)?.unlocked_at
  }));

  return (
    <AchievementSystem
      achievements={mappedAchievements}
      user={user}
      onAchievementUnlocked={onAchievementUnlocked}
    />
  );
}

// Helper functions
function mapIcon(iconName: string): string {
  const iconMap: { [key: string]: string } = {
    'trophy': '🏆',
    'star': '⭐',
    'fire': '🔥',
    'book': '📚',
    'target': '🎯',
    'rocket': '🚀',
    'crown': '👑',
    'gem': '💎'
  };
  return iconMap[iconName] || '🏆';
}

function mapCategory(backendCategory: string): 'study' | 'social' | 'streak' | 'milestone' | 'special' {
  const categoryMap: { [key: string]: 'study' | 'social' | 'streak' | 'milestone' | 'special' } = {
    'study': 'study',
    'social': 'social', 
    'streak': 'streak',
    'milestone': 'milestone',
    'special': 'special'
  };
  return categoryMap[backendCategory] || 'milestone';
}

function mapRarity(category: string): 'common' | 'rare' | 'epic' | 'legendary' {
  const rarityMap: { [key: string]: 'common' | 'rare' | 'epic' | 'legendary' } = {
    'study': 'common',
    'social': 'rare',
    'streak': 'epic', 
    'milestone': 'legendary',
    'special': 'legendary'
  };
  return rarityMap[category] || 'common';
}

export default App;