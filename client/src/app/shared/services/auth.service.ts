import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { USER_STORAGE_KEY } from '../constants/auth.constants';

type VerifyUserResponse = {
  user?: {
    picUrl?: string | null;
    name?: string | null;
    email?: string | null;
    uid?: string;
  };
  isNewUser?: boolean | string | number;
};

type StoredUser = {
  picUrl?: string | null;
  name?: string | null;
  email?: string | null;
  uid?: string;
  isNewUser: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly firebaseApp: FirebaseApp;
  private readonly auth: Auth;
  private readonly googleProvider = new GoogleAuthProvider();
  private readonly userSignal = signal<User | null>(null);
  private readonly storedUserSignal = signal<StoredUser | null>(null);
  private redirectAfterLogin: string | null = null;
  private manualLogout = false;

  constructor(
    private readonly http: HttpClient,
    private readonly zone: NgZone,
    private readonly router: Router
  ) {
    this.firebaseApp = this.ensureFirebaseApp();
    this.auth = getAuth(this.firebaseApp);

    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.userSignal.set(currentUser);
    }
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<StoredUser> | null;
          this.storedUserSignal.set({
            picUrl: parsed?.picUrl ?? null,
            name: parsed?.name ?? null,
            email: parsed?.email ?? null,
            uid: parsed?.uid,
            isNewUser: this.normalizeIsNewUser(parsed?.isNewUser)
          });
        } catch {
          this.clearStoredUser();
        }
      }
    }

    onAuthStateChanged(this.auth, (user) => {
      this.zone.run(() => {
        void this.handleAuthStateChange(user);
      });
    });
  }

  user(): User | null {
    return this.userSignal();
  }

  profile(): StoredUser | null {
    return this.storedUserSignal();
  }

  isLoggedIn(): boolean {
    return this.userSignal() !== null || this.storedUserSignal() !== null;
  }

  setPostLoginRedirect(path: string): void {
    this.redirectAfterLogin = path;
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(this.auth, this.googleProvider);
    } catch (error) {
      console.error('login failed', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      this.manualLogout = true;
      await signOut(this.auth);
    } catch (error) {
      console.error('logout failed', error);
      throw error;
    }
  }

  private async handleAuthStateChange(user: User | null): Promise<void> {
    this.userSignal.set(user);
    console.log('User state changed:', user);

    if (user) {
      const storedUser = await this.verifyUserWithBackend(user);
      this.storedUserSignal.set(storedUser);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
      }

      if (this.redirectAfterLogin) {
        const target = this.redirectAfterLogin;
        this.redirectAfterLogin = null;
        if (!storedUser.isNewUser) {
          await this.router.navigate([target]);
        }
      }
    } else {
      this.storedUserSignal.set(null);
      this.clearStoredUser();
      this.redirectAfterLogin = null;
      if (this.manualLogout) {
        this.manualLogout = false;
        await this.router.navigate(['/']);
      }
    }
  }

  private async verifyUserWithBackend(firebaseUser: User): Promise<StoredUser> {
    const fallbackUser: StoredUser = {
      picUrl: firebaseUser.photoURL,
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      uid: firebaseUser.uid,
      isNewUser: false
    };

    try {
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };

      const response = await firstValueFrom(
        this.http.post<VerifyUserResponse>('http://localhost:3000/api/auth/verify_user', userData)
      );

      const isNewUser = this.normalizeIsNewUser(response?.isNewUser);
      const storedUser: StoredUser = {
        picUrl: response?.user?.picUrl ?? fallbackUser.picUrl,
        name: response?.user?.name ?? fallbackUser.name,
        email: response?.user?.email ?? fallbackUser.email,
        uid: response?.user?.uid ?? fallbackUser.uid,
        isNewUser
      };

      if (isNewUser) {
        this.redirectAfterLogin = null;
        await this.router.navigate(['/profile']);
      }

      return storedUser;
    } catch (error) {
      console.error('backend error:', error);
      return fallbackUser;
    }
  }

  private ensureFirebaseApp(): FirebaseApp {
    const apps = getApps();
    if (apps.length > 0) {
      return getApp();
    }
    return initializeApp(environment.firebase);
  }

  private clearStoredUser(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  private normalizeIsNewUser(value: VerifyUserResponse['isNewUser']): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }

    return false;
  }
}
