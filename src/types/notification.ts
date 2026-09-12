export interface HealthNotification {
  id: string;
  recipientRole?: string;
  recipientUserId?: string;
  recipientFacilityId?: string;
  title: string;
  message: string;
  type: 'REFERRAL' | 'APPOINTMENT' | 'QUEUE' | 'CLINICAL' | 'SYSTEM';
  referralId?: string;
  referralCode?: string;
  read: boolean;
  timestamp: string;
}
