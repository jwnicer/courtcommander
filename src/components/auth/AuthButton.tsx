
'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { UserCheck } from 'lucide-react';


export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Skeleton className="h-9 w-28" />;
  }

  if (user) {
     return (
        <Badge variant="outline" className="py-2 px-3">
            <UserCheck className="mr-2 h-4 w-4 text-green-500" />
            <span className="font-medium">Signed In</span>
        </Badge>
     )
  }

  return null;
}
