import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationCategory =
  | 'traffic'
  | 'hazard'
  | 'camera'
  | 'toll'
  | 'safety'
  | 'system';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string; // ISO date string or relative display
  read: boolean;
  actionRoute?: string;
  actionLabel?: string;
  metadata?: {
    digiPin?: string;
    tollAmount?: string;
    speedLimit?: string;
    roadName?: string;
  };
}

const STORAGE_KEY_NOTIFICATIONS = '@bmap/notifications_v1';

const INITIAL_SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'FASTag Toll Deducted · ₹135',
    message: 'Kherki Daula Toll Plaza (NH-48) · Tag ID: 34161B · Free-Flow Barrier Passed.',
    category: 'toll',
    priority: 'medium',
    timestamp: '10 min ago',
    read: false,
    actionRoute: '/(tabs)/services',
    actionLabel: 'Inspect Telematics',
    metadata: {
      tollAmount: '₹135',
      roadName: 'NH-48 Jaipur Expy',
      digiPin: '28J4-K8M2-9P',
    },
  },
  {
    id: 'notif_2',
    title: 'Severe Traffic Congestion Alert',
    message: 'Rajiv Chowk Underpass gridlock (+18 min delay). Alternative Sohna Elevated Corridor recommended.',
    category: 'traffic',
    priority: 'high',
    timestamp: '25 min ago',
    read: false,
    actionRoute: '/(tabs)/routes',
    actionLabel: 'Reroute Now',
    metadata: {
      roadName: 'Rajiv Chowk Underpass',
      digiPin: '28J3-H7K1-8X',
    },
  },
  {
    id: 'notif_3',
    title: 'Speed Radar Camera Warning',
    message: 'Fixed Radar Gun 450m ahead on Cyber City Boulevard. Speed limit strictly 60 km/h.',
    category: 'camera',
    priority: 'high',
    timestamp: '1 hour ago',
    read: false,
    actionRoute: '/modal',
    actionLabel: 'Open Cockpit HUD',
    metadata: {
      speedLimit: '60 km/h',
      roadName: 'Cyber City Promenade',
    },
  },
  {
    id: 'notif_4',
    title: 'Road Hazard Reported Ahead',
    message: 'Waterlogging & pothole cluster reported by 45 verified drivers on Sector 29 service lane.',
    category: 'hazard',
    priority: 'medium',
    timestamp: '2 hours ago',
    read: true,
    actionRoute: '/hazard-report',
    actionLabel: 'View Hazard',
    metadata: {
      roadName: 'Sector 29 Service Lane',
    },
  },
  {
    id: 'notif_5',
    title: 'ISRO NavIC Dual-Band Lock Active',
    message: 'L5 + S-Band constellation locked with 7 satellites. Sub-meter horizontal accuracy 0.6m.',
    category: 'system',
    priority: 'low',
    timestamp: 'Today, 08:30 AM',
    read: true,
    actionRoute: '/digipin-explorer',
    actionLabel: 'View NavIC Status',
    metadata: {
      digiPin: '28J4-L9N3-1B',
    },
  },
  {
    id: 'notif_6',
    title: 'Emergency SOS 112 Ready',
    message: 'Sovereign SOS safety beacon online. Direct dispatch link to National Emergency 112 verified.',
    category: 'safety',
    priority: 'low',
    timestamp: 'Yesterday',
    read: true,
    actionRoute: '/sos-distress',
    actionLabel: 'Check SOS Contacts',
  },
];

type NotificationListener = (notifications: NotificationItem[], unreadCount: number) => void;
type BannerListener = (notification: NotificationItem) => void;

class NotificationService {
  private notifications: NotificationItem[] = [];
  private isLoaded: boolean = false;
  private listeners: Set<NotificationListener> = new Set();
  private bannerListeners: Set<BannerListener> = new Set();

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notifications = parsed;
        } else {
          this.notifications = INITIAL_SEED_NOTIFICATIONS;
        }
      } else {
        this.notifications = INITIAL_SEED_NOTIFICATIONS;
        await this.persist();
      }
    } catch {
      this.notifications = INITIAL_SEED_NOTIFICATIONS;
    } finally {
      this.isLoaded = true;
      this.notify();
    }
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_NOTIFICATIONS,
        JSON.stringify(this.notifications)
      );
    } catch {
      // Storage error fallback
    }
  }

  private notify(): void {
    const unread = this.notifications.filter((n) => !n.read).length;
    this.listeners.forEach((listener) => {
      try {
        listener([...this.notifications], unread);
      } catch {
        // Listener error
      }
    });
  }

  async getNotifications(): Promise<NotificationItem[]> {
    if (!this.isLoaded) await this.init();
    return [...this.notifications];
  }

  getUnreadCountSync(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  async getUnreadCount(): Promise<number> {
    if (!this.isLoaded) await this.init();
    return this.notifications.filter((n) => !n.read).length;
  }

  async markAsRead(id: string): Promise<void> {
    if (!this.isLoaded) await this.init();
    let changed = false;
    this.notifications = this.notifications.map((item) => {
      if (item.id === id && !item.read) {
        changed = true;
        return { ...item, read: true };
      }
      return item;
    });

    if (changed) {
      await this.persist();
      this.notify();
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this.isLoaded) await this.init();
    this.notifications = this.notifications.map((item) => ({ ...item, read: true }));
    await this.persist();
    this.notify();
  }

  async deleteNotification(id: string): Promise<void> {
    if (!this.isLoaded) await this.init();
    this.notifications = this.notifications.filter((item) => item.id !== id);
    await this.persist();
    this.notify();
  }

  async clearAll(): Promise<void> {
    if (!this.isLoaded) await this.init();
    this.notifications = [];
    await this.persist();
    this.notify();
  }

  async pushNotification(
    data: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>
  ): Promise<NotificationItem> {
    if (!this.isLoaded) await this.init();

    const newItem: NotificationItem = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: 'Just now',
      read: false,
    };

    this.notifications = [newItem, ...this.notifications];
    await this.persist();
    this.notify();

    // Trigger in-app floating banner listeners
    this.bannerListeners.forEach((fn) => {
      try {
        fn(newItem);
      } catch {
        // Banner listener error
      }
    });

    return newItem;
  }

  async addNotification(
    data: {
      title: string;
      message: string;
      category?: NotificationCategory;
      type?: string;
      priority?: NotificationPriority;
      actionRoute?: string;
      actionLabel?: string;
      metadata?: NotificationItem['metadata'];
    }
  ): Promise<NotificationItem> {
    const category: NotificationCategory =
      data.category ||
      (data.type === 'warning' || data.type === 'danger' ? 'safety' : 'system');
    const priority: NotificationPriority =
      data.priority ||
      (data.type === 'danger' ? 'critical' : data.type === 'warning' ? 'high' : 'medium');

    return this.pushNotification({
      title: data.title,
      message: data.message,
      category,
      priority,
      actionRoute: data.actionRoute,
      actionLabel: data.actionLabel,
      metadata: data.metadata,
    });
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    // Instant initial delivery
    listener([...this.notifications], this.getUnreadCountSync());
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeToBanners(listener: BannerListener): () => void {
    this.bannerListeners.add(listener);
    return () => {
      this.bannerListeners.delete(listener);
    };
  }
}

export const notificationService = new NotificationService();

