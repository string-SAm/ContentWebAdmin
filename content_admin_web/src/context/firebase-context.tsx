import { createContext } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { JsonData } from '@/components/translations/translation-editor';

export interface FirebaseContextType {
  firebaseApp: firebase.FirebaseApp | undefined;
  initializeFirebase: (config: Object) => void;
  saveChanges: (jsonData:JsonData,path:string) => Promise<any>;
}

export const FirebaseContext = createContext<FirebaseContextType | null>(null);
