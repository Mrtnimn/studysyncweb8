import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  Settings,
  Trophy,
  Clock,
  Video,
  FileText,
  Star,
  Brain,
  GraduationCap,
} from "lucide-react";

interface SidebarItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
}

interface AppSidebarProps {
  onNavigate?: (path: string) => void;
}

const mainItems: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Study Rooms",
    url: "/study-rooms",
    icon: BookOpen,
    badge: "Live",
  },
  {
    title: "Tutors",
    url: "/tutors",
    icon: Users,
  },
  {
    title: "Become Tutor",
    url: "/tutor-profile",
    icon: GraduationCap,
  },
];

const studyItems: SidebarItem[] = [
  {
    title: "Solo Study",
    url: "/solo-study",
    icon: Brain,
  },
  {
    title: "Group Sessions",
    url: "/group-sessions",
    icon: Video,
  },
  {
    title: "Study Timer",
    url: "/timer",
    icon: Clock,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
];

const progressItems: SidebarItem[] = [
  {
    title: "Achievements",
    url: "/achievements",
    icon: Trophy,
  },
  {
    title: "Study Streak",
    url: "/streak",
    icon: Star,
  },
];

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const [activeItem, setActiveItem] = useState("/dashboard");

  const handleItemClick = (url: string, title: string) => {
    setActiveItem(url);
    onNavigate?.(url);
    console.log(`Navigating to ${title}:`, url);
  };

  const renderMenuItems = (items: SidebarItem[]) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          onClick={() => handleItemClick(item.url, item.title)}
          className={`w-full justify-start ${activeItem === item.url ? 'bg-sidebar-accent' : ''}`}
          data-testid={`sidebar-${item.title.toLowerCase().replace(' ', '-')}`}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 text-xs">
              {item.badge}
            </Badge>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItems(mainItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Study</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItems(studyItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Progress</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItems(progressItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleItemClick("/settings", "Settings")}
                  className={activeItem === "/settings" ? 'bg-sidebar-accent' : ''}
                  data-testid="sidebar-settings"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}