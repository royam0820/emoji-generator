'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createUserProfile } from '../actions/server-actions';

export function ProfileCreator() {
  const { isSignedIn } = useAuth();
  const [hasAttemptedCreation, setHasAttemptedCreation] = useState(false);

  useEffect(() => {
    if (isSignedIn && !hasAttemptedCreation) {
      setHasAttemptedCreation(true);
      createUserProfile()
        .then(profile => {
          console.log('Profile creation result:', profile);
        })
        .catch(error => {
          console.error('Failed to create profile:', error);
        });
    }
  }, [isSignedIn, hasAttemptedCreation]);

  return null;
} 