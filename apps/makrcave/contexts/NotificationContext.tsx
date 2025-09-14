'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useKeycloak } from '@makrx/auth';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'inventory' | 'equipment' | 'projects' | 'system' | 'user' | 'security';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: NotificationType;
  actionUrl?: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'destructive';
  }>;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getNotificationsByCategory: (category: NotificationType) => Notification[];
  getUnreadCountByCategory: (category: NotificationType) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useKeycloak();

  // Load sample notifications for development
  useEffect(() => {
    if (user) {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'inventory',
          title: 'Low Stock Alert',
          message: 'PLA Filament (White) is running low. Only 2 spools remaining.',
          timestamp: new Date(Date.now() - 60000),
          read: false,
          priority: 'medium',
          category: 'inventory',
          actionUrl: '/inventory'
        },
        {
          id: '2',
          type: 'equipment',
          title: 'Maintenance Required',
          message: '3D Printer #3 needs scheduled maintenance check.',
          timestamp: new Date(Date.now() - 300000),
          read: false,
          priority: 'high',
          category: 'equipment',
          actionUrl: '/equipment'
        },
        {
          id: '3',
          type: 'system',
          title: 'Welcome!',
          message: `Welcome to MakrCave, ${user.firstName || user.email?.split('@')[0]}!`,
          timestamp: new Date(),
          read: false,
          priority: 'low',
          category: 'system'
        }
      ];
      setNotifications(sampleNotifications);
    }
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove after 10 seconds for non-urgent notifications
    if (newNotification.priority !== 'urgent') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 10000);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationsByCategory = (category: NotificationType): Notification[] => {
    return notifications.filter(notification => 
      notification.category === category || notification.type === category
    );
  };

  const getUnreadCountByCategory = (category: NotificationType): number => {
    return notifications.filter(n => 
      (n.category === category || n.type === category) && !n.read
    ).length;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByCategory,
    getUnreadCountByCategory
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}