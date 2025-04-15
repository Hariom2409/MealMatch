import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface AuthCheckProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

/**
 * A simpler protection component that doesn't use redirects
 * Instead shows appropriate UI based on auth state
 */
const AuthCheck: React.FC<AuthCheckProps> = ({ 
  children, 
  requireVerified = true 
}) => {
  const { currentUser, isEmailVerified } = useAuth();

  // If no user, show login message
  if (!currentUser) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4 text-center">
                <h4>Please Log In</h4>
                <p className="text-muted">You need to be logged in to access this page.</p>
                <Link href="/login" passHref>
                  <Button variant="primary">Go to Login</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // If verification is required and email is not verified
  if (requireVerified && !isEmailVerified()) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4 text-center">
                <h4>Email Verification Required</h4>
                <p className="text-muted mb-3">
                  Please verify your email address <strong>{currentUser.email}</strong> to continue.
                </p>
                <div className="d-grid gap-2">
                  <Link href="/verify-email" passHref>
                    <Button variant="primary">Verify Email</Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default AuthCheck; 