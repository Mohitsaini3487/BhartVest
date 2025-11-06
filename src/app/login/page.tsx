'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
       if (user && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        // Ensure all required fields have a fallback
        setDocumentNonBlocking(userRef, {
            id: user.uid,
            googleId: user.providerData.find(p => p.providerId === 'google.com')?.uid || user.uid,
            email: user.email || 'no-email@example.com',
            displayName: user.displayName || 'Anonymous User',
            profilePictureUrl: user.photoURL || null
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="mb-8">
            <Logo />
        </div>
        <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
            <h1 className="mb-2 text-center font-headline text-2xl font-semibold">Welcome to BharatVest</h1>
            <p className="mb-6 text-center text-muted-foreground">Sign in to access your financial dashboard.</p>
            <Button onClick={handleSignIn} className="w-full" size="lg" disabled={!auth}>
                 <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2C327.3 113.8 290.4 96 248 96 171.4 96 108 159.4 108 236s63.4 140 140 140c78.6 0 125.7-52.5 130.8-82.3H248v-96h239.2c4.3 23.2 6.8 46.8 6.8 72.1z"></path>
                 </svg>
                Sign in with Google
            </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">Your AI-powered gateway to the Indian markets.</p>
    </div>
  );
}
