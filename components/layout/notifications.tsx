'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { BASE_URL , defaultHeaders} from '@/lib/api';
import { Notification } from '@/lib/types';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${BASE_URL}/notifs/v2/notification-list/`, {
          method: 'GET',
          headers: {
            ...defaultHeaders
          }
        });
        const data = await response.json();
        const mappedNotifications = data.data.results.map((apiNotif: any) => ({
          id: apiNotif.id,
          message: apiNotif.message,
          created_at: apiNotif.created_at,
          status: apiNotif.status,
          type: 'info',
          intent_type: apiNotif.intent_type,
          checklist_id: apiNotif.checklist_id,
          reference_id: apiNotif.reference_id
        }));
        
        setNotifications(mappedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, status: 'READ' }
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

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(`${BASE_URL}/notifs/v2/notifications/mark-all-read/`, {
        method: 'POST',
        headers: {
          ...defaultHeaders
        }
      });
      
      if (!response.ok) throw new Error('Failed to mark all as read');
      
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
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
              onClick={handleMarkAllAsRead}
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
                  notification.status === 'UNREAD' ? 'bg-primary/5' : ''
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.intent_type === 'CHECKLIST' && notification.checklist_id && notification.reference_id) {
                    router.push(`/audit/checklist?id=${notification.checklist_id}&checklist_item_id=${notification.reference_id}`);
                    setShowNotifications(false);
                  } else if (notification.intent_type === 'DOCUMENT' && notification.reference_id) {
                    router.push(`/library/document?document_id=${notification.reference_id}`);
                    setShowNotifications(false);
                  }
                }}
              >
                <div className="flex gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium ${notification.status === 'UNREAD' ? 'text-primary' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.created_at}
                    </p>
                  </div>
                  {notification.status === 'UNREAD' && (
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