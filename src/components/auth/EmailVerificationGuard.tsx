import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from 'react-bootstrap';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children }) => {
  const { currentUser, isEmailVerified, refreshUserState } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkEmailVerification = async () => {
      setIsChecking(true);
      
      try {
        // Check if user is logged in
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        // Refresh user state only once per page load
        await refreshUserState();
        
        // Get email verification status
        const verified = isEmailVerified();
        setIsVerified(verified);
        
        // If email isn't verified, redirect to verification page
        if (!verified) {
          router.push('/verify-email');
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkEmailVerification();
    // Only run once when component mounts or when currentUser changes
    // Do NOT include isEmailVerified or refreshUserState in dependencies
  }, [currentUser, router]);

  // Show loading state only during initial check
  if (isChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  // Only render children if verification passed
  return isVerified ? <>{children}</> : null;
};

export default EmailVerificationGuard; 