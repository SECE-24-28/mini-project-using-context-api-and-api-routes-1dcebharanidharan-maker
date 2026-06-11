import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  theme: "light",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));

interface WorkspaceStore {
  activeWorkspaceId: string | null;
  activeChannelId: string | null;
  setActiveWorkspace: (id: string) => void;
  setActiveChannel: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeWorkspaceId: null,
  activeChannelId: null,
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setActiveChannel: (id) => set({ activeChannelId: id }),
}));

interface NotificationStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
}));
