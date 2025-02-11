import { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<User>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

export interface UserData {
  uid: string;
  email: string | null;
  username: string;
  setupCompleted: boolean;
  createdAt: any; // You might want to use a more specific type
}