import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaMapMarkerAlt, FaRegClock, FaUser, FaPhoneAlt, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';

// Dummy data for demo purposes
const getDummyFoodPost = (id: string) => {
  return {
    id,
    title: 'Fresh Produce',
    quantity: '40 kg',
    description: 'Mixed vegetables and fruits including carrots, potatoes, apples, and oranges. All items are fresh and were received this morning. Perfect for soup kitchens or community meal preparation.',
    donorName: 'Green Market',
    donorPhone: '555-123-4567',
    donorEmail: 'contact@greenmarket.com',
    distance: '1.2 km',
    location: '123 Main Street, Downtown',
    fullAddress: '123 Main Street, Downtown, Cityville, ST 12345',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    tags: ['fruits', 'vegetables', 'fresh'],
    images: ['/images/sample-food1.jpg', '/images/sample-food2.jpg'],
    pickupInstructions: 'Please enter through the back door and ask for the manager. Bring your own containers if possible.',
    availablePickupTimes: [
      { id: '1', time: new Date(Date.now() + 1000 * 60 * 60 * 2) }, // 2 hours from now
      { id: '2', time: new Date(Date.now() + 1000 * 60 * 60 * 5) }, // 5 hours from now
      { id: '3', time: new Date(Date.now() + 1000 * 60 * 60 * 8) }, // 8 hours from now
    ]
  };
};

// Format date for display
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate time remaining until expiry
const getTimeRemaining = (expiryTime: Date) => {
  const now = new Date();
  const timeRemaining = expiryTime.getTime() - now.getTime();
  
  if (timeRemaining <= 0) {
    return 'Expired';
  }
  
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hoursRemaining > 24) {
    const daysRemaining = Math.floor(hoursRemaining / 24);
    return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
  }
  
  if (hoursRemaining > 0) {
    return `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}, ${minutesRemaining} min${minutesRemaining !== 1 ? 's' : ''} remaining`;
  }
  
  return `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} remaining`;
};

const ClaimDonation = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  const [foodPost, setFoodPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/ngo/claim/' + id);
      return;
    }
    
    if (currentUser.role !== 'ngo') {
      router.push('/');
      return;
    }
    
    // Simulate API call to get food post details
    if (id) {
      try {
        const data = getDummyFoodPost(id as string);
        setFoodPost(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load food post details. Please try again.');
        setLoading(false);
      }
    }
  }, [id, currentUser, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPickupTime) {
      setError('Please select a pickup time.');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    // Simulate API call to submit claim
    setTimeout(() => {
      setSubmitting(false);
      setSubmitSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push('/ngo/dashboard');
      }, 2000);
    }, 1500);
  };
  
  if (!currentUser || currentUser.role !== 'ngo') {
    return (
      <Layout title="Loading - MealMatch">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
        </Container>
      </Layout>
    );
  }
  
  if (loading) {
    return (
      <Layout title="Loading Donation Details - MealMatch">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Loading donation details...</p>
        </Container>
      </Layout>
    );
  }
  
  if (error && !foodPost) {
    return (
      <Layout title="Error - MealMatch">
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
          <div className="text-center mt-4">
            <Link href="/ngo/dashboard">
              <Button variant="primary">
                <FaArrowLeft className="me-2" /> Return to Dashboard
              </Button>
            </Link>
          </div>
        </Container>
      </Layout>
    );
  }
  
  if (submitSuccess) {
    return (
      <Layout title="Claim Submitted - MealMatch">
        <Container className="py-5 text-center">
          <div className="d-inline-block p-4 bg-success text-white rounded-circle mb-4">
            <FaRegClock size={48} />
          </div>
          <h2>Your claim has been submitted!</h2>
          <p className="mb-4">We've notified the donor about your pickup request. You'll receive a confirmation soon.</p>
          <Link href="/ngo/dashboard">
            <Button variant="primary" size="lg">
              Return to Dashboard
            </Button>
          </Link>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout title={`Claim Donation: ${foodPost?.title} - MealMatch`} description="Claim available food donations">
      <Container className="py-5">
        {/* Back Link */}
        <div className="mb-4">
          <Link href="/ngo/dashboard" className="text-decoration-none">
            <span className="d-flex align-items-center text-success">
              <FaArrowLeft className="me-2" /> Back to Dashboard
            </span>
          </Link>
        </div>
        
        <Row>
          {/* Donation Details */}
          <Col lg={8} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="mb-4">
                  <h1 className="h3 fw-bold mb-2">{foodPost.title}</h1>
                  <div className="d-flex flex-wrap align-items-center mb-3">
                    <Badge bg="success" className="me-2 mb-2">Available Now</Badge>
                    <div className="d-flex align-items-center text-warning me-3 mb-2">
                      <FaRegClock className="me-1" />
                      <small>{getTimeRemaining(foodPost.expiryTime)}</small>
                    </div>
                    <div className="d-flex align-items-center text-muted mb-2">
                      <FaMapMarkerAlt className="me-1" />
                      <small>{foodPost.distance} away</small>
                    </div>
                  </div>
                  
                  {foodPost.tags.map((tag: string) => (
                    <Badge key={tag} bg="light" text="dark" className="me-1 mb-2">{tag}</Badge>
                  ))}
                </div>
                
                <div className="mb-4">
                  <h5 className="fw-bold">Description</h5>
                  <p>{foodPost.description}</p>
                </div>
                
                <Row className="mb-4">
                  <Col md={6} className="mb-3 mb-md-0">
                    <h5 className="fw-bold">Quantity</h5>
                    <p className="mb-0">{foodPost.quantity}</p>
                  </Col>
                  <Col md={6}>
                    <h5 className="fw-bold">Best Before</h5>
                    <p className="mb-0">{formatDate(foodPost.expiryTime)}</p>
                  </Col>
                </Row>
                
                <h5 className="fw-bold">Donor Information</h5>
                <div className="p-3 bg-light rounded mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <FaUser className="text-muted me-2" />
                    <span>{foodPost.donorName}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaPhoneAlt className="text-muted me-2" />
                    <span>{foodPost.donorPhone}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaMapMarkerAlt className="text-muted me-2" />
                    <span>{foodPost.fullAddress}</span>
                  </div>
                </div>
                
                <h5 className="fw-bold">Pickup Instructions</h5>
                <p>{foodPost.pickupInstructions}</p>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Claim Form */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Body className="p-4">
                <h2 className="h4 fw-bold mb-4">Claim This Donation</h2>
                
                {error && (
                  <Alert variant="danger" className="mb-3">{error}</Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="pickupTime">
                    <Form.Label className="fw-medium">Select Pickup Time</Form.Label>
                    <Form.Select 
                      value={selectedPickupTime}
                      onChange={(e) => setSelectedPickupTime(e.target.value)}
                      required
                    >
                      <option value="">Choose a time...</option>
                      {foodPost.availablePickupTimes.map((slot: any) => (
                        <option key={slot.id} value={slot.id}>
                          {formatDate(slot.time)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-4" controlId="additionalNotes">
                    <Form.Label className="fw-medium">Additional Notes (Optional)</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      placeholder="Any special requests or information for the donor"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      variant="success" 
                      type="submit" 
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        'Claim Donation'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default ClaimDonation; 