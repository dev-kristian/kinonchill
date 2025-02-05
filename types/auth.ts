// types/auth.ts
import { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<User>;
  signOut: () => Promise<void>;
}
