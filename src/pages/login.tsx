import React, { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaGoogle, FaLock, FaEnvelope } from 'react-icons/fa';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const router = useRouter();
  const { login, loginWithGoogle, resetPassword, isEmailVerified, refreshUserState } = useAuth();
  const redirectPath = (router.query.redirect as string) || '/';
  const isRedirectingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (forgotPassword) {
      try {
        setError('');
        setLoading(true);
        await resetPassword(email);
        setLoading(false);
        alert('Password reset email sent! Check your inbox.');
        setForgotPassword(false);
      } catch (error: any) {
        setLoading(false);
        setError('Failed to reset password: ' + error.message);
      }
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      
      // Refresh user state to get latest verification status
      await refreshUserState();
      
      // Prevent multiple redirects
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;
      
      // Check email verification status and redirect accordingly
      if (!isEmailVerified()) {
        router.push('/verify-email');
      } else {
        router.push(redirectPath);
      }
    } catch (error: any) {
      setLoading(false);
      setError('Failed to log in: ' + error.message);
      isRedirectingRef.current = false;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      
      // Refresh user state to get latest verification status
      await refreshUserState();
      
      // Prevent multiple redirects
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;
      
      // Check email verification status and redirect accordingly
      if (!isEmailVerified()) {
        router.push('/verify-email');
      } else {
        router.push(redirectPath);
      }
    } catch (error: any) {
      setLoading(false);
      setError('Failed to log in with Google: ' + error.message);
      isRedirectingRef.current = false;
    }
  };

  return (
    <Layout>
      <Head>
        <title>Login - MealMatch</title>
        <meta name="description" content="Log in to your MealMatch account" />
      </Head>

      <section className="auth-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={5} md={8}>
              <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="text-center pt-4 pb-3">
                  <h1 className="h3 fw-bold">{forgotPassword ? 'Reset Password' : 'Welcome Back'}</h1>
                  <p className="text-muted">{forgotPassword ? 'Enter your email to receive reset instructions' : 'Sign in to your account'}</p>
                </div>
                
                <Card.Body className="p-4 p-md-5">
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4" controlId="email">
                      <div className="form-floating">
                        <Form.Control
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="form-control-lg"
                        />
                        <Form.Label>Email address</Form.Label>
                      </div>
                    </Form.Group>
                    
                    {!forgotPassword && (
                      <Form.Group className="mb-4" controlId="password">
                        <div className="form-floating">
                          <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-control-lg"
                          />
                          <Form.Label>Password</Form.Label>
                        </div>
                      </Form.Group>
                    )}
                    
                    {!forgotPassword && (
                      <div className="d-flex justify-content-end mb-4">
                        <Button 
                          variant="link" 
                          className="p-0 text-decoration-none text-primary"
                          onClick={() => setForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
                    )}
                    
                    <div className="d-grid mb-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg" 
                        disabled={loading}
                        className="btn-action"
                      >
                        {loading ? 'Please wait...' : forgotPassword ? 'Send Reset Link' : 'Sign In'}
                      </Button>
                    </div>
                    
                    {forgotPassword && (
                      <div className="text-center mb-4">
                        <Button 
                          variant="link" 
                          className="text-decoration-none"
                          onClick={() => setForgotPassword(false)}
                        >
                          Back to login
                        </Button>
                      </div>
                    )}
                    
                    {!forgotPassword && (
                      <>
                        <div className="divider-with-text my-4">
                          <span>OR</span>
                        </div>
                        
                        <div className="d-grid mb-4">
                          <Button 
                            variant="outline-secondary" 
                            size="lg" 
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="btn-social"
                          >
                            <FaGoogle className="me-2" /> Continue with Google
                          </Button>
                        </div>
                      </>
                    )}
                    
                    <div className="text-center">
                      <p className="mb-0">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-decoration-none fw-semibold">
                          Sign up
                        </Link>
                      </p>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </Layout>
  );
};

export default LoginPage; 