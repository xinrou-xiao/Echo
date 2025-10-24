import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { HttpClient } from '@angular/common/http';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { environment } from '../../../environments/environment';

const USER_STORAGE_KEY = 'echo.user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  user: User | null = null;
  private auth: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router
  ) {
    try {
      const app = initializeApp(environment.firebase);
      this.auth = getAuth(app);
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  ngOnInit() {
    if (this.auth) {
      onAuthStateChanged(this.auth, async (user) => {
        this.user = user;
        console.log('User state changed:', user);

        if (user) {
          await this.verifyUserWithBackend(user);
        } else if (typeof window !== 'undefined') {
          window.localStorage.removeItem(USER_STORAGE_KEY);
        }

        this.cdr.detectChanges();
      });
    }
  }

  private async verifyUserWithBackend(firebaseUser: User) {
    try {
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };

      const response: any = await this.http.post(
        'http://localhost:3000/api/auth/verify_user',
        userData
      ).toPromise();

      if (typeof window !== 'undefined') {
        const storedUser = {
          ...(response?.user ?? {}),
          picUrl: response?.user?.picUrl ?? firebaseUser.photoURL,
          name: response?.user?.name ?? firebaseUser.displayName,
          email: response?.user?.email ?? firebaseUser.email,
          uid: response?.user?.uid ?? firebaseUser.uid
        };

        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
      }

      if (response?.isNewUser) {
        await this.router.navigate(['/profile']);
      }

    } catch (error) {
      console.error('backend error:', error);
    }
  }

  async loginWithGoogle() {
    if (!this.auth) {
      console.error('Auth not initialized');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      console.log('logined');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('login failed', error);
    }
  }

  async logout() {
    if (!this.auth) {
      console.error('Auth not initialized');
      return;
    }

    try {
      await signOut(this.auth);
      console.log('logouted');
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
      this.cdr.detectChanges();
      await this.router.navigate(['/']);
    } catch (error) {
      console.error('log out failed', error);
    }
  }
}
