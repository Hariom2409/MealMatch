import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';

// Bootstrap styles import
import 'bootstrap/dist/css/bootstrap.min.css';

// Custom styles
import '@/styles/globals.css';

// Context providers
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Load Bootstrap JS only on client-side and only after initial render
  useEffect(() => {
    // Use a timeout to defer non-critical JS loading
    const timer = setTimeout(() => {
      import('bootstrap/dist/js/bootstrap');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle GitHub Pages redirect from 404.html
  useEffect(() => {
    // Check if we have a redirect parameter in URL
    const { currentRoute } = router.query;
    if (currentRoute && typeof currentRoute === 'string') {
      // Remove the query parameter to clean up the URL
      const newUrl = `/${currentRoute}`;
      router.replace(newUrl);
    }
  }, [router.query, router]);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Component {...pageProps} />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
} 