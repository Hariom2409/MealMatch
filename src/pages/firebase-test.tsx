import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { auth, db } from '@/utils/firebase';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Layout from '@/components/layout/Layout';

export default function FirebaseTestPage() {
  const [result, setResult] = useState({ 
    status: 'loading', 
    message: 'Testing Firebase connection...', 
    error: null as any 
  });
  
  const [authResult, setAuthResult] = useState({
    status: 'idle',
    message: '',
    error: null as any
  });

  useEffect(() => {
    async function testFirebase() {
      try {
        // Try to write to Firestore to test connection
        console.log('Testing Firestore connection...');
        const testRef = doc(db, 'connection_tests', new Date().toISOString());
        
        await setDoc(testRef, {
          timestamp: serverTimestamp(),
          test: 'Firebase connection test'
        });
        
        // Try to read from Firestore
        console.log('Reading from Firestore...');
        const querySnapshot = await getDocs(collection(db, 'connection_tests'));
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Successfully connected to Firebase:', documents.length, 'test documents found');
        
        setResult({
          status: 'success',
          message: `Successfully connected to Firebase! Found ${documents.length} test documents.`,
          error: null
        });
      } catch (error) {
        console.error('Firebase test error:', error);
        setResult({
          status: 'error',
          message: 'Failed to connect to Firebase. See error details below.',
          error
        });
      }
    }
    
    testFirebase();
  }, []);
  
  const createTestUser = async () => {
    setAuthResult({ status: 'loading', message: 'Creating test user...', error: null });
    try {
      const email = `test${Date.now()}@example.com`;
      const password = 'Test123456';
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      setAuthResult({
        status: 'success',
        message: `Test user created successfully! Email: ${email}, Password: ${password}`,
        error: null
      });
      
      console.log('Test user created:', userCredential.user);
    } catch (error) {
      console.error('Error creating test user:', error);
      setAuthResult({
        status: 'error',
        message: 'Failed to create test user. See error details below.',
        error
      });
    }
  };
  
  return (
    <Layout title="Firebase Test - MealMatch" description="Testing Firebase connectivity">
      <Container className="py-5">
        <h1 className="mb-4">Firebase Connection Test</h1>
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <h2 className="h4 mb-3">Connection Status</h2>
            
            <Alert 
              variant={
                result.status === 'success' ? 'success' : 
                result.status === 'error' ? 'danger' : 
                'warning'
              }
            >
              <Alert.Heading>
                {result.status === 'success' ? 'Success!' : 
                 result.status === 'error' ? 'Error' : 
                 'Testing...'}
              </Alert.Heading>
              <p className="mb-0">{result.message}</p>
            </Alert>
            
            {result.error && (
              <div className="mt-3">
                <h3 className="h5">Error Details:</h3>
                <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            )}
          </Card.Body>
        </Card>
        
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <h2 className="h4 mb-3">Authentication Test</h2>
            <p>If you can't log in, you may need to create a test user first:</p>
            
            <Button 
              variant="primary" 
              onClick={createTestUser}
              disabled={authResult.status === 'loading'}
              className="mb-3"
            >
              {authResult.status === 'loading' ? 'Creating...' : 'Create Test User'}
            </Button>
            
            {authResult.status !== 'idle' && (
              <Alert 
                variant={
                  authResult.status === 'success' ? 'success' : 
                  authResult.status === 'error' ? 'danger' : 
                  'warning'
                }
                className="mt-3"
              >
                <Alert.Heading>
                  {authResult.status === 'success' ? 'Success!' : 
                   authResult.status === 'error' ? 'Error' : 
                   'Loading...'}
                </Alert.Heading>
                <p className="mb-0">{authResult.message}</p>
                
                {authResult.error && (
                  <div className="mt-3">
                    <h3 className="h5">Error Details:</h3>
                    <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(authResult.error, null, 2)}
                    </pre>
                  </div>
                )}
              </Alert>
            )}
          </Card.Body>
        </Card>
        
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <h2 className="h4 mb-3">Firebase Configuration</h2>
            <p>Here's what your application is using for Firebase configuration:</p>
            
            <pre className="bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify({
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
              }, null, 2)}
            </pre>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
} 