// components/WithAuth.tsx

'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export function WithAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading) {
        if (!user && pathname !== '/sign-in') {
          router.push('/sign-in');
        } else if (user && pathname === '/sign-in') {
          router.push('/');
        }
      }
    }, [user, loading, router, pathname]);

    if (loading) {
      return <div>Loading...</div>; 
    }

    if (!user && pathname !== '/sign-in') {
      return null;
    }

    return <Component {...props} />;
  };
}