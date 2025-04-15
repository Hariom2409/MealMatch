import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { FaUtensils, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';

const CreateDonation = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  
  // Get today's date and format for date input min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Commonly used food categories for tags
  const commonTags = [
    'fruits', 'vegetables', 'dairy', 'bakery', 'prepared meals', 
    'canned goods', 'grains', 'beverages', 'snacks', 'desserts'
  ];
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/donor/create');
      return;
    }
    
    if (currentUser.role !== 'donor') {
      router.push('/');
      return;
    }
    
    // Pre-fill location if available from user profile
    if (currentUser.address) {
      setLocation(currentUser.address);
    }
  }, [currentUser, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Form validation
      if (!title || !quantity || !description || !location || !expiryDate || !expiryTime) {
        throw new Error('Please fill in all required fields');
      }
      
      // Create combined expiry datetime
      const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
      if (expiryDateTime <= new Date()) {
        throw new Error('Expiry time must be in the future');
      }
      
      // Simulate API call to create food post
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated successful response
      setSuccess(true);
      setLoading(false);
      
      // Reset form after successful submission
      setTimeout(() => {
        router.push('/donor/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while posting your donation');
      setLoading(false);
    }
  };
  
  const handleTagClick = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };
  
  const handleAddCustomTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      setCustomTag('');
    }
  };
  
  if (!currentUser || currentUser.role !== 'donor') {
    return (
      <Layout title="Loading - MealMatch">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout title="Post Food Donation - MealMatch" description="Share your excess food with those in need">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4 p-md-5">
                <h1 className="h3 mb-4 text-center">Post Food Donation</h1>
                
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}
                
                {success ? (
                  <Alert variant="success">
                    <Alert.Heading>Donation Posted Successfully!</Alert.Heading>
                    <p>Thank you for your generosity. Your donation has been posted and will be visible to nearby NGOs.</p>
                    <p className="mb-0">Redirecting to your dashboard...</p>
                  </Alert>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      {/* Food Details Section */}
                      <Col xs={12}>
                        <div className="mb-4">
                          <div className="d-flex align-items-center mb-3">
                            <FaUtensils className="text-success me-2" />
                            <h2 className="h5 mb-0">Food Details</h2>
                          </div>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="E.g., Fresh Vegetables, Baked Goods, etc."
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              required
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="E.g., 5 kg, 10 servings, 3 boxes, etc."
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              required
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder="Describe the food items, including any allergens or dietary information"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              required
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Tags</Form.Label>
                            <div className="mb-2">
                              {commonTags.map(tag => (
                                <Button
                                  key={tag}
                                  variant={tags.includes(tag) ? "success" : "outline-success"}
                                  size="sm"
                                  className="me-2 mb-2"
                                  onClick={() => handleTagClick(tag)}
                                >
                                  {tag}
                                </Button>
                              ))}
                            </div>
                            <div className="d-flex">
                              <Form.Control
                                type="text"
                                placeholder="Add custom tag"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                className="me-2"
                              />
                              <Button 
                                variant="outline-secondary" 
                                onClick={handleAddCustomTag}
                                disabled={!customTag}
                              >
                                Add
                              </Button>
                            </div>
                          </Form.Group>
                        </div>
                      </Col>
                      
                      {/* Pickup Information Section */}
                      <Col xs={12}>
                        <div className="mb-4">
                          <div className="d-flex align-items-center mb-3">
                            <FaMapMarkerAlt className="text-success me-2" />
                            <h2 className="h5 mb-0">Pickup Information</h2>
                          </div>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter address or location for pickup"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              required
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Pickup Instructions</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              placeholder="Any special instructions for pickup (e.g., 'Ask for manager', 'Use back entrance')"
                              value={pickupInstructions}
                              onChange={(e) => setPickupInstructions(e.target.value)}
                            />
                          </Form.Group>
                        </div>
                      </Col>
                      
                      {/* Expiry Information Section */}
                      <Col xs={12}>
                        <div className="mb-4">
                          <div className="d-flex align-items-center mb-3">
                            <FaCalendarAlt className="text-success me-2" />
                            <h2 className="h5 mb-0">Expiry Information</h2>
                          </div>
                          
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Expiry Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                  type="date"
                                  min={today}
                                  value={expiryDate}
                                  onChange={(e) => setExpiryDate(e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Expiry Time <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                  type="time"
                                  value={expiryTime}
                                  onChange={(e) => setExpiryTime(e.target.value)}
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                      
                      {/* Terms and Submit Section */}
                      <Col xs={12}>
                        <Alert variant="info" className="d-flex align-items-start">
                          <FaInfoCircle className="me-2 mt-1" />
                          <div>
                            By posting this donation, you confirm that the food is safe for consumption until the specified expiry time.
                          </div>
                        </Alert>
                        
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                          <Button 
                            variant="secondary" 
                            onClick={() => router.push('/donor/dashboard')}
                            disabled={loading}
                            className="px-4"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            variant="success" 
                            disabled={loading}
                            className="px-4"
                          >
                            {loading ? (
                              <>
                                <Spinner 
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Posting...
                              </>
                            ) : (
                              'Post Donation'
                            )}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default CreateDonation; 