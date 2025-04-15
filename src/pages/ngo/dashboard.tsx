import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Alert, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaSearch, FaMapMarkerAlt, FaRegClock, FaClipboardCheck, FaHistory } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getFoodPosts, updateFoodPostStatus } from '@/services/foodPostService';
import { FoodPost } from '@/types';
import { seedFoodPosts } from '@/utils/seedData';

// Dummy data for demo purposes
const DUMMY_AVAILABLE_FOOD: DisplayFoodPost[] = [
  {
    id: '1',
    title: 'Fresh Produce',
    quantity: '40 kg',
    description: 'Mixed vegetables and fruits',
    postedByName: 'Green Market',
    postedBy: 'dummy-donor-1',
    distance: '1.2 km',
    location: {
      address: '123 Main Street',
      lat: 37.7749,
      lng: -122.4194
    },
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
    preparedTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    status: 'available',
    isVegetarian: true,
    isNonVegetarian: false,
    isGlutenFree: false,
    tags: ['fruits', 'vegetables'],
  },
  {
    id: '2',
    title: 'Prepared Meals',
    quantity: '25 servings',
    description: 'Pasta with marinara sauce',
    postedByName: 'Italian Restaurant',
    postedBy: 'dummy-donor-2',
    distance: '3.5 km',
    location: {
      address: '456 Oak Avenue',
      lat: 37.7739,
      lng: -122.4312
    },
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours from now
    preparedTime: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
    status: 'available',
    isVegetarian: false,
    isNonVegetarian: true,
    isGlutenFree: false,
    tags: ['ready-to-eat', 'cooked'],
  },
  {
    id: '3',
    title: 'Bread Assortment',
    quantity: '30 loaves',
    description: 'Various types of bread and pastries',
    postedByName: 'Downtown Bakery',
    postedBy: 'dummy-donor-3',
    distance: '0.8 km',
    location: {
      address: '789 Maple Road',
      lat: 37.7729,
      lng: -122.4232
    },
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
    preparedTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    status: 'available',
    isVegetarian: true,
    isNonVegetarian: false,
    isGlutenFree: false,
    tags: ['bakery', 'bread'],
  },
  {
    id: '4',
    title: 'Dairy Products',
    quantity: '15 items',
    description: 'Milk, yogurt, and cheese',
    postedByName: 'Local Grocery',
    postedBy: 'dummy-donor-4',
    distance: '2.4 km',
    location: {
      address: '101 Pine Street',
      lat: 37.7719,
      lng: -122.4292
    },
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 36), // 36 hours from now
    preparedTime: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    status: 'available',
    isVegetarian: false,
    isNonVegetarian: true,
    isGlutenFree: true,
    tags: ['dairy', 'refrigerated'],
  },
];

// Dummy data for claimed donations
const DUMMY_CLAIMED_DONATIONS = [
  {
    id: '5',
    title: 'Catering Leftovers',
    quantity: '15 servings',
    description: 'Various finger foods and appetizers',
    donorName: 'Event Space',
    status: 'scheduled', // scheduled for pickup
    pickupTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
    claimedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '6',
    title: 'Rice and Beans',
    quantity: '20 kg',
    description: 'Cooked rice and beans',
    donorName: 'Mexican Restaurant',
    status: 'completed', // already picked up
    pickupTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    claimedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
  },
  {
    id: '7',
    title: 'Sandwich Platters',
    quantity: '30 sandwiches',
    description: 'Assorted sandwiches from conference',
    donorName: 'Corporate Office',
    status: 'completed',
    pickupTime: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
    claimedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 72 hours ago
  },
];

// Dummy impact stats
const DUMMY_IMPACT = {
  totalCollected: 35,
  mealsProvided: 450,
  peopleServed: 175,
  wasteReduced: 320, // in kg
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

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let variant = 'secondary';
  if (status === 'scheduled') variant = 'primary';
  if (status === 'completed') variant = 'success';
  if (status === 'missed') variant = 'danger';

  return <Badge bg={variant} className="text-uppercase">{status}</Badge>;
};

// Interface for display posts with added UI properties
interface DisplayFoodPost extends Omit<FoodPost, 'checklist'> {
  distance?: string; // Added for UI display
  tags?: string[]; // Added for UI filtering
}

// Interface for claimed donations
interface ClaimedDonation {
  id: string;
  title: string;
  quantity: string;
  description: string;
  donorName: string;
  postedByName?: string; // Optional for compatibility
  status: string;
  pickupTime: Date;
  claimedAt: Date;
}

const NgoDashboard = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [availableFood, setAvailableFood] = useState<DisplayFoodPost[]>([]);
  const [claimedDonations, setClaimedDonations] = useState<ClaimedDonation[]>(DUMMY_CLAIMED_DONATIONS);
  const [impact, setImpact] = useState(DUMMY_IMPACT);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistance, setFilterDistance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSeedingData, setIsSeedingData] = useState(false);

  // Redirect if not logged in or not an NGO
  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/ngo/dashboard');
    } else if (currentUser.role !== 'ngo') {
      router.push('/');
    }
  }, [currentUser, router]);

  // Function to add distance to posts (would be server-side in production)
  const addDistanceToPost = (post: FoodPost): DisplayFoodPost => {
    // Generate a random distance for demo purposes
    // In a real app, this would be calculated based on user's location
    const randomDistance = (Math.random() * 10).toFixed(1) + ' km';
    
    // Extract tags from post properties
    const tags = [];
    if (post.isVegetarian) tags.push('vegetarian');
    if (post.isNonVegetarian) tags.push('non-vegetarian');
    if (post.isGlutenFree) tags.push('gluten-free');
    
    // Omit the checklist property
    const { checklist, ...postWithoutChecklist } = post;
    
    return {
      ...postWithoutChecklist,
      distance: randomDistance,
      tags
    };
  };

  // Load real food posts from Firebase
  useEffect(() => {
    if (!currentUser) return;
    
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Using dummy data for NGO dashboard');
        
        // Always use dummy data for now
        setAvailableFood(DUMMY_AVAILABLE_FOOD);
        setLoading(false);
      } catch (err) {
        console.error('Error loading food posts for NGO dashboard:', err);
        setError('Failed to load food donations. Please try again later.');
        
        // Fall back to dummy data in case of error
        console.log('Falling back to dummy data due to error');
        setAvailableFood(DUMMY_AVAILABLE_FOOD);
        setLoading(false);
      }
    };
    
    loadPosts();
  }, [currentUser]);

  // Filter available food based on search term and distance
  const filteredFood = availableFood.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesDistance = filterDistance === '' || 
      (filterDistance === '1' && parseFloat(String(item.distance)) <= 1) ||
      (filterDistance === '5' && parseFloat(String(item.distance)) <= 5) ||
      (filterDistance === '10' && parseFloat(String(item.distance)) <= 10);
    
    return matchesSearch && matchesDistance;
  });

  // Sort donations by pickup time
  const scheduledDonations = claimedDonations
    .filter(d => d.status === 'scheduled')
    .sort((a, b) => a.pickupTime.getTime() - b.pickupTime.getTime());
  
  const completedDonations = claimedDonations
    .filter(d => d.status === 'completed')
    .sort((a, b) => b.pickupTime.getTime() - a.pickupTime.getTime());

  // Function to seed test data for development
  const handleSeedTestData = async () => {
    if (!confirm('This will add test food posts to the database. Continue?')) {
      return;
    }
    
    try {
      setIsSeedingData(true);
      await seedFoodPosts();
      alert('Test data has been added. Refreshing dashboard...');
      window.location.reload();
    } catch (error) {
      console.error('Error seeding test data:', error);
      alert('Failed to seed test data. Check console for details.');
    } finally {
      setIsSeedingData(false);
    }
  };

  // Render loading state
  if (loading && !availableFood.length) {
    return (
      <Layout title="Loading - MealMatch">
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Loading food donations...</p>
        </Container>
      </Layout>
    );
  }

  // Render error state
  if (error && !availableFood.length) {
    return (
      <Layout title="Error - MealMatch">
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
            <Button 
              variant="outline-danger" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Alert>
        </Container>
      </Layout>
    );
  }

  if (!currentUser || currentUser.role !== 'ngo') {
    return (
      <Layout title="Loading - MealMatch">
        <Container className="py-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="NGO Dashboard - MealMatch" description="Find and claim available food donations">
      <Container className="py-5">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="mb-0">NGO Dashboard</h1>
            <p className="text-muted mb-0">Welcome back, {currentUser.name}</p>
          </Col>
        </Row>

        {/* Impact Stats */}
        <Row className="mb-4">
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4 text-center">
                <div className="display-4 fw-bold text-success mb-2">{impact.totalCollected}</div>
                <Card.Text className="text-muted mb-0">Donations Collected</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4 text-center">
                <div className="display-4 fw-bold text-primary mb-2">{impact.mealsProvided}</div>
                <Card.Text className="text-muted mb-0">Meals Provided</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4 text-center">
                <div className="display-4 fw-bold text-info mb-2">{impact.peopleServed}</div>
                <Card.Text className="text-muted mb-0">People Served</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4 text-center">
                <div className="display-4 fw-bold text-success mb-2">{impact.wasteReduced} kg</div>
                <Card.Text className="text-muted mb-0">Food Waste Reduced</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <Row>
                  <Col md={8} className="mb-3 mb-md-0">
                    <InputGroup>
                      <InputGroup.Text className="bg-white">
                        <FaSearch className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by food type, description or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={filterDistance}
                      onChange={(e) => setFilterDistance(e.target.value)}
                      aria-label="Filter by distance"
                    >
                      <option value="">All Distances</option>
                      <option value="1">Within 1 km</option>
                      <option value="5">Within 5 km</option>
                      <option value="10">Within 10 km</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Available Food Posts */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FaSearch className="text-success me-2" size={20} />
                    <h2 className="h5 fw-bold mb-0">Available Donations</h2>
                  </div>
                  
                  {/* Only show in development and if no posts found */}
                  {process.env.NODE_ENV !== 'production' && !loading && availableFood.length === 0 && (
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={handleSeedTestData}
                      disabled={isSeedingData}
                    >
                      {isSeedingData ? 'Adding Test Data...' : 'Add Test Data'}
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {loading && (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="success" size="sm" />
                    <p className="mt-2 mb-0">Loading donations...</p>
                  </div>
                )}
                
                {!loading && filteredFood.length === 0 ? (
                  <Alert variant="light" className="text-center">
                    No available food donations match your search criteria.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table className="align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th>Food Items</th>
                          <th>Quantity</th>
                          <th>Donor</th>
                          <th>Location</th>
                          <th>Distance</th>
                          <th>Expires</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFood.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div className="fw-medium">{item.title}</div>
                              <small className="text-muted d-block">{item.description}</small>
                              {item.tags && item.tags.map(tag => (
                                <Badge key={tag} bg="light" text="dark" className="me-1 mt-1">{tag}</Badge>
                              ))}
                            </td>
                            <td>{item.quantity}</td>
                            <td>{item.postedByName}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FaMapMarkerAlt className="text-danger me-1" size={14} />
                                {item.location?.address || 'Unknown location'}
                              </div>
                            </td>
                            <td>{item.distance}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FaRegClock className="text-warning me-1" size={14} />
                                {formatDate(item.expiryTime)}
                              </div>
                            </td>
                            <td>
                              <Link href={`/ngo/claim/${item.id}`}>
                                <Button size="sm" variant="success">Claim</Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Scheduled Pickups */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                <div className="d-flex align-items-center">
                  <FaClipboardCheck className="text-primary me-2" size={20} />
                  <h2 className="h5 fw-bold mb-0">Scheduled Pickups</h2>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {scheduledDonations.length === 0 ? (
                  <Alert variant="light" className="text-center">
                    No scheduled pickups at the moment.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table className="align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th>Food Items</th>
                          <th>Quantity</th>
                          <th>Donor</th>
                          <th>Pickup Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduledDonations.map(item => (
                          <tr key={item.id}>
                            <td className="fw-medium">{item.title}</td>
                            <td>{item.quantity}</td>
                            <td>{item.postedByName || item.donorName}</td>
                            <td>{formatDate(item.pickupTime)}</td>
                            <td><StatusBadge status={item.status} /></td>
                            <td>
                              <Link href={`/ngo/pickup/${item.id}`}>
                                <Button size="sm" variant="outline-primary">Details</Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Completed Pickups */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                <div className="d-flex align-items-center">
                  <FaHistory className="text-success me-2" size={20} />
                  <h2 className="h5 fw-bold mb-0">Completed Pickups</h2>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {completedDonations.length === 0 ? (
                  <Alert variant="light" className="text-center">
                    No completed pickups yet.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table className="align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th>Food Items</th>
                          <th>Quantity</th>
                          <th>Donor</th>
                          <th>Pickup Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedDonations.map(item => (
                          <tr key={item.id}>
                            <td className="fw-medium">{item.title}</td>
                            <td>{item.quantity}</td>
                            <td>{item.postedByName || item.donorName}</td>
                            <td>{formatDate(item.pickupTime)}</td>
                            <td><StatusBadge status={item.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default NgoDashboard; 