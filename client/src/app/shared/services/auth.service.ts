/** 1 This is our AuthService. It injects HttpClient, 
 * so the frontend can call our backend API.*/
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
  data?: {
    _id?: string;
    picUrl?: string | null;
    name?: string | null;
    email?: string | null;
    uid?: string;
  };
  isNewUser?: boolean | string | number;
};

type StoredUser = {
  _id?: string;
  picUrl?: string | null;
  name?: string | null;
  email?: string | null;
  uid?: string;
  isNewUser: boolean;
};

/** 1*/
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly firebaseApp: FirebaseApp;
  private readonly auth: Auth;
  private readonly googleProvider = new GoogleAuthProvider();
  private readonly userSignal = signal<User | null>(null);
  private readonly storedUserSignal = signal<StoredUser | null>(null);
  private readonly readySignal = signal(false);
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
    if (currentUser) this.userSignal.set(currentUser);
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<StoredUser> | null;
          this.storedUserSignal.set({
            _id: parsed?._id,
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
      this.zone.run(async () => {
        await this.handleAuthStateChange(user);
        this.readySignal.set(true);
      });
    });
  }

  ready(): Promise<void> {
    return new Promise((resolve) => {
      if (this.readySignal()) resolve();
      else {
        const check = setInterval(() => {
          if (this.readySignal()) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      }
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
    await signInWithPopup(this.auth, this.googleProvider);
  }

  async logout(): Promise<void> {
    this.manualLogout = true;
    await signOut(this.auth);
  }

  private async handleAuthStateChange(user: User | null): Promise<void> {
    this.userSignal.set(user);
    if (user) {
      const storedUser = await this.verifyUserWithBackend(user);
      /**3 */
      // 3 On the server side, this Express route receives those parameters, 
      // then uses Mongoose to check MongoDB. If a user with that uid already exists, 
      //we return that document with isNewUser: false. Otherwise, 
      //we create and save a new user and return isNewUser: true.*/
      this.storedUserSignal.set(storedUser);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
      }
      if (this.redirectAfterLogin) {
        const target = this.redirectAfterLogin;
        this.redirectAfterLogin = null;
        if (!storedUser.isNewUser) await this.router.navigate([target]);
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
 
  /** 2*/
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
        this.http.post<VerifyUserResponse>(`${environment.apiUrl}/auth/verify_user`, userData)
      );
      const isNewUser = this.normalizeIsNewUser(response?.isNewUser);
      const storedUser: StoredUser = {
        _id: response?.data?._id,
        picUrl: response?.data?.picUrl ?? fallbackUser.picUrl,
        name: response?.data?.name ?? fallbackUser.name,
        email: response?.data?.email ?? fallbackUser.email,
        uid: response?.data?.uid ?? fallbackUser.uid,
        isNewUser
      };
      if (isNewUser) {
        this.redirectAfterLogin = null;
        await this.router.navigate(['/profile']);
      }
      return storedUser;
    } catch {
      return fallbackUser;
    }
  }

  private ensureFirebaseApp(): FirebaseApp {
    const apps = getApps();
    return apps.length > 0 ? getApp() : initializeApp(environment.firebase);
  }

  private clearStoredUser(): void {
    if (typeof window !== 'undefined') window.localStorage.removeItem(USER_STORAGE_KEY);
  }

  private normalizeIsNewUser(value: VerifyUserResponse['isNewUser']): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }
    return false;
  }
}