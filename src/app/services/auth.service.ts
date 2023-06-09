import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth) {
    this.user$ = afAuth.authState as Observable<firebase.User | null>;
  }

  register(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  login(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.afAuth.currentUser;
  }

  // Get the current user
  getCurrentUser() {
    return this.afAuth.currentUser;
  }

  // Sign out the user
  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }
}
