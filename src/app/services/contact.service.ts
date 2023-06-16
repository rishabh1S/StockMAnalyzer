import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private firestore: AngularFirestore) {}

  addMessage(data: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.firestore
        .collection('messages')
        .add(data)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
