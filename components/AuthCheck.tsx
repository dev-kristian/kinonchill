'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AuthCheck() {
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkAuth = async () => {
    setAuthStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/check-auth');
      const data = await response.json();

      if (response.ok) {
        setAuthStatus('success');
      } else {
        setAuthStatus('error');
        setErrorMessage(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setAuthStatus('error');
      setErrorMessage('An error occurred while checking authentication');
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">TMDB Authentication Check</h1>
      <Button onClick={checkAuth} disabled={authStatus === 'loading'}>
        {authStatus === 'loading' ? 'Checking...' : 'Check Authentication'}
      </Button>

      {authStatus === 'success' && (
        <Alert className="mt-4" variant="default">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Authentication successful.</AlertDescription>
        </Alert>
      )}

      {authStatus === 'error' && (
        <Alert className="mt-4" variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}