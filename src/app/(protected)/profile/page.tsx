'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'profiles', user.uid);
  }, [firestore, user]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<ProfileFormValues>(profileRef);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        displayName: '',
        bio: ''
    }
  });

  useEffect(() => {
    if (user || profileData) {
      reset({
        displayName: profileData?.displayName || user?.displayName || '',
        bio: profileData?.bio || '',
      });
    }
  }, [profileData, user, reset]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!profileRef) return;
    
    await setDocumentNonBlocking(profileRef, data, { merge: true });

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been saved successfully.',
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Your Profile" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL ?? ''} />
                  <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your name and bio.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  {...register('displayName')}
                  disabled={isProfileLoading}
                />
                {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell us a little about yourself"
                  rows={4}
                  disabled={isProfileLoading}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ''} disabled />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || isProfileLoading || !isDirty}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
