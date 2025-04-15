import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';

const VerifyEmail = () => {
  const { currentUser, sendVerificationEmail, isEmailVerified, refreshUserState } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      router.push('/login?redirect=/verify-email');
      return;
    }

    // If user is already verified, redirect to appropriate dashboard
    const checkVerification = async () => {
      try {
        await refreshUserState();
        if (isEmailVerified() && !hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          const redirectPath = currentUser.role === 'donor' ? '/donor/dashboard' : '/recipient/dashboard';
          router.push(redirectPath);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking verification status:', err);
        setLoading(false);
      }
    };

    checkVerification();

    // Clean up any existing interval
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [currentUser, isEmailVerified, refreshUserState, router]);

  // Set up a periodic check for email verification
  useEffect(() => {
    if (!currentUser || loading || hasRedirectedRef.current) return;

    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(async () => {
      try {
        await refreshUserState();
        if (isEmailVerified() && !hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          const redirectPath = currentUser.role === 'donor' ? '/donor/dashboard' : '/recipient/dashboard';
          router.push(redirectPath);
          // Clear the interval after redirect
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error in verification check interval:', err);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [currentUser, isEmailVerified, loading, refreshUserState, router]);

  // Countdown timer logic for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendVerification = async () => {
    if (sendingEmail || countdown > 0) return;
    
    setSendingEmail(true);
    setEmailSent(false);
    setError(null);
    
    try {
      await sendVerificationEmail();
      setEmailSent(true);
      setCountdown(60); // Set 60 second cooldown
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      setError(err.message || 'Failed to send verification email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Verify Email - MealMatch">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Verify Email - MealMatch">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-md-5">
                <h2 className="text-center mb-4">Verify Your Email</h2>
                
                <div className="text-center mb-4">
                  <div className="verify-icon mb-3">
                    <i className="fas fa-envelope-open-text fa-3x text-primary"></i>
                  </div>
                  
                  <p>
                    We've sent a verification email to: <br />
                    <strong>{currentUser?.email}</strong>
                  </p>
                  
                  <p className="text-muted">
                    Click the link in the email to verify your account.
                    Please check your spam folder if you don't see it.
                  </p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {emailSent && <Alert variant="success">Verification email sent successfully!</Alert>}
                
                <div className="d-grid gap-3">
                  <Button 
                    variant="primary" 
                    onClick={handleResendVerification}
                    disabled={sendingEmail || countdown > 0}
                  >
                    {sendingEmail ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend Email (${countdown}s)`
                    ) : (
                      "Resend Verification Email"
                    )}
                  </Button>
                  
                  <Button variant="outline-secondary" onClick={() => router.push('/login')}>
                    Back to Login
                  </Button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-muted small">
                    Already verified? Try refreshing the page or logging in again.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default VerifyEmail; 