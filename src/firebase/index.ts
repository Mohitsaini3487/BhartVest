'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

export function initializeFirebase(): ReturnType<typeof getSdks> {
  let firebaseApp: FirebaseApp;

  // If app is already initialized, return it
  if (getApps().length) {
    return getSdks(getApp());
  }

  try {
    // ✅ For Firebase Hosting (usually fails on Vercel)
    firebaseApp = initializeApp();
  } catch (e) {
    // ✅ For Localhost or Vercel
    console.warn(
      'Automatic initialization failed. Falling back to firebase config object.',
      e
    );
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

// Exported SDKs for direct usage
export const { firebaseApp, auth, firestore } = initializeFirebase();

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
