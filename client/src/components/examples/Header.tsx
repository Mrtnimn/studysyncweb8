import { Header } from '../Header';

export default function HeaderExample() {
  //todo: remove mock functionality - replace with real user data
  const mockUser = {
    name: "Alex Johnson",
    email: "alex.johnson@studysync.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    streak: 7,
    xp: 1250
  };

  return (
    <Header
      user={mockUser}
      onSearch={(query) => console.log('Searching for:', query)}
      onNotificationClick={() => console.log('Notifications opened')}
    />
  );
}