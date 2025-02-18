'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: number;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: 1,
    title: 'Verification Complete',
    description: 'YJ - Lamb Q4 2023 verification has been completed',
    type: 'success',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    title: 'Deadline Approaching',
    description: 'LCFS Q1 2024 report due in 5 days',
    type: 'warning',
    timestamp: '1 day ago',
    read: false,
  },
  {
    id: 3,
    title: 'New Document Uploaded',
    description: 'New compliance document uploaded for Demeter',
    type: 'info',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 4,
    title: 'System Update',
    description: 'Platform maintenance scheduled for next weekend',
    type: 'info',
    timestamp: '3 days ago',
    read: true,
  },
];

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              className="text-xs text-primary hover:text-primary/90"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium ${!notification.read ? 'text-primary' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}