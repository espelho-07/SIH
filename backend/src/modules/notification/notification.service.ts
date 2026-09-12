import { Notification } from '../../models/Notification';

export class NotificationService {
  async getNotifications(userId: string) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
  }

  async getNotificationById(id: string) {
    return Notification.findById(id);
  }

  async createNotification(data: any) {
    const notif = new Notification(data);
    await notif.save();
    return notif;
  }

  async updateNotification(id: string, data: any) {
    return Notification.findByIdAndUpdate(id, data, { new: true });
  }

  async getUnread(userId: string) {
    return Notification.find({ userId, isRead: false }).sort({ createdAt: -1 });
  }

  async markAsRead(id: string) {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  async markAllAsRead(userId: string) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  async deleteNotification(id: string) {
    return Notification.findByIdAndDelete(id);
  }

  async getPreferences(userId: string) {
    return {
      userId,
      channels: {
        inApp: true,
        sms: true,
        whatsapp: false,
        push: true,
      },
      categories: {
        emergencies: true,
        referrals: true,
        tokens: true,
        labReports: true,
        followups: true,
      },
    };
  }

  async updatePreferences(userId: string, data: any) {
    return { message: 'Notification preferences updated', userId, preferences: data };
  }
}
