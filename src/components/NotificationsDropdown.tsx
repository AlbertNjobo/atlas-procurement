import { useState } from 'react';
import { Bell, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type NotificationType = 'approval' | 'status' | 'alert' | 'info';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: NotificationType;
  link: string;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Approval Required',
    description: 'Purchase Requisition REQ-2024-089 needs your approval.',
    time: '10m ago',
    read: false,
    type: 'approval',
    link: '/requisitions'
  },
  {
    id: '2',
    title: 'RFQ Status Update',
    description: '3 new bids received for Laptop Fleet Renewal.',
    time: '1h ago',
    read: false,
    type: 'status',
    link: '/rfqs'
  },
  {
    id: '3',
    title: 'New Supplier Onboarded',
    description: 'Acme Corp has completed the onboarding workflow.',
    time: '2h ago',
    read: true,
    type: 'info',
    link: '/suppliers'
  },
  {
    id: '4',
    title: 'Budget Alert',
    description: 'IT Hardware budget is at 90% utilization.',
    time: '1d ago',
    read: true,
    type: 'alert',
    link: '/'
  }
];

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'approval':
      return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
    case 'status':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'alert':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'info':
    default:
      return <FileText className="h-4 w-4 text-green-500" />;
  }
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(initialNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="p-0 font-semibold text-sm">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup className="p-1">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    !notification.read && "bg-muted/50"
                  )}
                  render={<Link to={notification.link} onClick={() => markAsRead(notification.id)} />}
                >
                  <div className="flex w-full items-start gap-2">
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm font-medium leading-none",
                        !notification.read && "text-foreground"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="outline" className="w-full text-xs" size="sm">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
