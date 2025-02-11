export interface UserProfile {
    uid: string;
    email: string | null;
    username: string;
    setupCompleted: boolean;
    createdAt: string;
    updatedAt: string;
  }