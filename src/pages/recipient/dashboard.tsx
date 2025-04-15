import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaFilter, FaListUl, FaThLarge } from 'react-icons/fa';
import { getFoodPosts, updateFoodPostStatus } from '@/services/foodPostService';
import { FoodPost as FoodPostType } from '@/types';
import Image from 'next/image';

// Custom styles
const styles = {
  card: {
    transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
    transform: 'translateY(0)',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    border: 'none',
    boxShadow: '0 4px 24px rgba(149, 157, 165, 0.15)',
  },
  hoverCard: {
    transform: 'translateY(-12px)',
    boxShadow: '0 24px 38px rgba(149, 157, 165, 0.18), 0 9px 12px rgba(149, 157, 165, 0.13)',
  },
  pillBadge: {
    borderRadius: '50px',
    padding: '0.5rem 1rem',
    fontWeight: '600',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(6px)',
    backgroundColor: 'rgba(25, 135, 84, 0.9)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  },
  secondaryBadge: {
    borderRadius: '50px',
    padding: '0.5rem 1rem',
    fontWeight: '600',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(6px)',
    backgroundColor: 'rgba(108, 117, 125, 0.9)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  },
  avatarCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '42px',
    height: '42px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.07)',
    transition: 'all 0.2s ease',
    backgroundColor: 'rgba(13, 110, 253, 0.1)',
    border: '1px solid rgba(13, 110, 253, 0.05)',
  },
  avatarCircleWarning: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '42px',
    height: '42px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.07)',
    transition: 'all 0.2s ease',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid rgba(255, 193, 7, 0.05)',
  },
  cardTitle: {
    fontSize: '1.4rem',
    marginBottom: '1rem',
    fontWeight: '700',
    color: '#2c3e50',
    lineHeight: '1.3',
    letterSpacing: '-0.01em',
  },
  cardText: {
    color: '#6c757d', 
    fontSize: '0.95rem',
    lineHeight: '1.6',
    fontWeight: '400',
  },
  badgeStyle: {
    backgroundColor: 'rgba(13, 110, 253, 0.08)',
    color: '#0d6efd',
    fontWeight: '600',
    padding: '0.35rem 0.85rem',
    borderRadius: '50px',
    fontSize: '0.75rem',
    boxShadow: '0 2px 4px rgba(13, 110, 253, 0.1)',
  },
  quantityBadge: {
    backgroundColor: 'rgba(13, 202, 240, 0.1)',
    color: '#0dcaf0',
    fontWeight: '600',
    padding: '0.35rem 0.85rem',
    borderRadius: '50px',
    fontSize: '0.75rem',
    boxShadow: '0 2px 4px rgba(13, 202, 240, 0.1)',
  },
  distanceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 135, 84, 0.1)',
    color: '#198754',
    fontWeight: '600',
    padding: '0.35rem 0.85rem',
    borderRadius: '50px',
    fontSize: '0.75rem',
    boxShadow: '0 2px 4px rgba(25, 135, 84, 0.1)',
  },
  cardImage: {
    borderRadius: '8px 8px 0 0',
    objectFit: 'cover' as const,
    height: '100%',
    width: '100%',
    transition: 'transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)',
  },
  cardImageHover: {
    transform: 'scale(1.07)',
  },
  cardOverlay: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
    zIndex: 1,
    borderRadius: '16px 16px 0 0',
  },
  claimButton: {
    borderRadius: '50px',
    padding: '0.6rem 1.2rem',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(25, 135, 84, 0.25)',
    transition: 'all 0.3s ease',
    background: 'linear-gradient(135deg, #20b270 0%, #198754 100%)',
    border: 'none',
  },
  claimButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 18px rgba(25, 135, 84, 0.3)',
  },
  infoRow: {
    display: 'flex' as const,
    alignItems: 'center',
    marginBottom: '1rem',
  },
};

// Types for food posts with UI-specific properties
interface DisplayFoodPost extends Omit<FoodPostType, 'checklist'> {
  distance?: number; // Added for UI display
  tags?: string[]; // Added for UI filtering
  claimedBy?: string;
  claimedAt?: Date;
}

const RecipientDashboard = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<DisplayFoodPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<DisplayFoodPost[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<DisplayFoodPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [claimNotes, setClaimNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistance, setFilterDistance] = useState<number | ''>('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hoverCardId, setHoverCardId] = useState<string | null>(null);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format relative time for display
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMins > 0) {
      return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };
  
  // Time remaining until expiry
  const timeUntilExpiry = (expiryDate: Date): string => {
    const now = new Date();
    const diffInMs = expiryDate.getTime() - now.getTime();
    
    if (diffInMs <= 0) {
      return 'Expired';
    }
    
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInMins > 0) {
      return `${diffInMins} minute${diffInMins > 1 ? 's' : ''}`;
    } else {
      return 'Less than a minute';
    }
  };
  
  // Extract tags from food posts - used for filtering options
  const extractTags = (foodPosts: DisplayFoodPost[]): string[] => {
    const tagSet = new Set<string>();
    
    foodPosts.forEach(post => {
      // Extract dietary preferences as tags
      if (post.isVegetarian) tagSet.add('vegetarian');
      if (post.isNonVegetarian) tagSet.add('non-vegetarian');
      if (post.isGlutenFree) tagSet.add('gluten-free');
    });
    
    return Array.from(tagSet);
  };
  
  // Calculate approximate distance from a post (simplified for demo)
  // In a real app, this would use the user's location and geolocation APIs
  const addDistanceToPost = (post: FoodPostType): DisplayFoodPost => {
    // Simulate distance by using a random value between 0.5 and 15 km
    // In a real app, you'd use the user's location and the post location
    const randomDistance = Math.round((Math.random() * 14.5 + 0.5) * 10) / 10;
    
    // Create display-ready tags from the food post properties
    const tags: string[] = [];
    if (post.isVegetarian) tags.push('vegetarian');
    if (post.isNonVegetarian) tags.push('non-vegetarian');
    if (post.isGlutenFree) tags.push('gluten-free');
    
    // Omit the checklist property from the returned object
    const { checklist, ...postWithoutChecklist } = post;
    
    return {
      ...postWithoutChecklist,
      distance: randomDistance,
      tags
    };
  };
  
  // Load posts and check user authentication
  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/recipient/dashboard');
      return;
    }
    
    // Check for valid role - NGO users can also view this page
    if (currentUser.role !== 'ngo' && currentUser.role !== 'donor' && currentUser.role !== 'admin') {
      router.push('/');
      return;
    }
    
    loadPosts();
  }, [currentUser, router]);
  
  // Load actual food posts from Firebase
  const loadPosts = async () => {
    try {
      setLoading(true);
      console.log('Using dummy data for recipient dashboard');
      
      // Create dummy posts
      const dummyPosts = [
        {
          id: '1',
          title: 'Fresh Produce',
          quantity: '40 kg',
          description: 'Mixed vegetables and fruits',
          postedByName: 'Green Market',
          postedBy: 'dummy-donor-1',
          location: {
            address: '123 Main Street',
            lat: 37.7749,
            lng: -122.4194
          },
          expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
          preparedTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
          status: 'available' as const,
          isVegetarian: true,
          isNonVegetarian: false,
          isGlutenFree: false,
          checklist: {
            id: 'dummy-1',
            foodId: '1',
            hygieneRating: 5,
            properStorage: true,
            safeTemperature: true,
            handlingProcedures: true,
            notes: 'Properly handled and stored'
          }
        },
        {
          id: '2',
          title: 'Prepared Meals',
          quantity: '25 servings',
          description: 'Pasta with marinara sauce',
          postedByName: 'Italian Restaurant',
          postedBy: 'dummy-donor-2',
          location: {
            address: '456 Oak Avenue',
            lat: 37.7739,
            lng: -122.4312
          },
          expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 5),
          preparedTime: new Date(Date.now() - 1000 * 60 * 60 * 1),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
          status: 'available' as const,
          isVegetarian: false,
          isNonVegetarian: true,
          isGlutenFree: false,
          checklist: {
            id: 'dummy-2',
            foodId: '2',
            hygieneRating: 5,
            properStorage: true,
            safeTemperature: true,
            handlingProcedures: true,
            notes: 'Restaurant quality'
          }
        },
        {
          id: '3',
          title: 'Bread Assortment',
          quantity: '30 loaves',
          description: 'Various types of bread and pastries',
          postedByName: 'Downtown Bakery',
          postedBy: 'dummy-donor-3',
          location: {
            address: '789 Maple Road',
            lat: 37.7729,
            lng: -122.4232
          },
          expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 12),
          preparedTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
          status: 'available' as const,
          isVegetarian: true,
          isNonVegetarian: false,
          isGlutenFree: false,
          checklist: {
            id: 'dummy-3',
            foodId: '3',
            hygieneRating: 5,
            properStorage: true,
            safeTemperature: true,
            handlingProcedures: true,
            notes: 'Fresh baked'
          }
        }
      ] as FoodPostType[];
      
      // Add display data to dummy posts
      const displayPosts = dummyPosts.map(post => addDistanceToPost(post));
      setPosts(displayPosts);
      setFilteredPosts(displayPosts);
      const tags = extractTags(displayPosts);
      setFilterTags(tags);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading food posts:', err);
      setError('Failed to load food donations. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle search and filter changes
  useEffect(() => {
    if (!posts.length) return;
    
    let result = [...posts];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(term) ||
        post.description.toLowerCase().includes(term) ||
        post.postedByName.toLowerCase().includes(term) ||
        post.tags?.some(tag => tag.toLowerCase().includes(term)) || false
      );
    }
    
    // Filter by distance
    if (filterDistance !== '') {
      result = result.filter(post => post.distance !== undefined && post.distance <= filterDistance);
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      result = result.filter(post => 
        selectedTags.some(tag => {
          if (tag === 'vegetarian') return post.isVegetarian;
          if (tag === 'non-vegetarian') return post.isNonVegetarian;
          if (tag === 'gluten-free') return post.isGlutenFree;
          return post.tags?.includes(tag) || false;
        })
      );
    }
    
    setFilteredPosts(result);
  }, [searchTerm, filterDistance, selectedTags, posts]);
  
  // Handle claiming a food post
  const handleClaimPost = async () => {
    if (!selectedPost) return;
    
    setIsClaiming(true);
    
    try {
      // Update post status in Firebase
      await updateFoodPostStatus(selectedPost.id, 'claimed');
      
      // Update the posts array with the claimed post
      const updatedPosts = posts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            status: 'claimed' as const,
            claimedBy: currentUser?.id,
            claimedAt: new Date()
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      
      // Update filtered posts as well
      const updatedFilteredPosts = filteredPosts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            status: 'claimed' as const,
            claimedBy: currentUser?.id,
            claimedAt: new Date()
          };
        }
        return post;
      });
      
      setFilteredPosts(updatedFilteredPosts);
      setShowModal(false);
      setClaimNotes('');
      setSelectedPost(null);
    } catch (err) {
      console.error('Error claiming food post:', err);
      setError('Failed to claim food donation. Please try again later.');
    } finally {
      setIsClaiming(false);
    }
  };
  
  // Handle tag selection for filtering
  const handleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Render loading state
  if (loading && !posts.length) {
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
  if (error && !posts.length) {
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
  
  return (
    <Layout title="Available Donations - MealMatch" description="Find and claim available food donations">
      <Container fluid className="py-4">
        {/* Dashboard Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="h3">Available Food Donations</h1>
            <p className="text-muted">
              Find and claim food donations from local businesses and individuals.
            </p>
          </Col>
        </Row>
        
        {/* Search and Filter Bar */}
        <Row className="mb-4">
          <Col md={6} lg={4} className="mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <Form.Control
                type="text"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Col>
          
          <Col md={3} lg={2} className="mb-3 mb-md-0">
            <div className="input-group">
              <span className="input-group-text">
                <FaMapMarkerAlt />
              </span>
              <Form.Select
                value={filterDistance === '' ? '' : filterDistance.toString()}
                onChange={(e) => setFilterDistance(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">Distance (Any)</option>
                <option value="1">Within 1 km</option>
                <option value="3">Within 3 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
              </Form.Select>
            </div>
          </Col>
          
          <Col md={3} lg={2} className="mb-3 mb-md-0">
            <div className="d-flex">
              <Button 
                variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} 
                className="me-2"
                onClick={() => setViewMode('grid')}
              >
                <FaThLarge />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('list')}
              >
                <FaListUl />
              </Button>
            </div>
          </Col>
        </Row>
        
        {/* Tags Filter */}
        {filterTags.length > 0 && (
          <Row className="mb-4">
            <Col>
              <div className="d-flex align-items-center flex-wrap">
                <div className="me-3 mb-2">
                  <FaFilter className="me-2" />
                  <span>Filter by:</span>
                </div>
                {filterTags.map(tag => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={selectedTags.includes(tag) ? 'primary' : 'outline-primary'}
                    className="me-2 mb-2 text-capitalize"
                    onClick={() => handleTagSelection(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        )}
        
        {/* No Results */}
        {filteredPosts.length === 0 && !loading && (
          <Alert variant="info" className="text-center">
            No food donations found matching your criteria.
            {selectedTags.length > 0 || searchTerm || filterDistance !== '' ? (
              <div className="mt-2">
                <Button variant="outline-primary" size="sm" onClick={() => {
                  setSearchTerm('');
                  setFilterDistance('');
                  setSelectedTags([]);
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : null}
          </Alert>
        )}
        
        {/* Grid View */}
        {viewMode === 'grid' && filteredPosts.length > 0 && (
          <Row>
            {filteredPosts.map(post => (
              <Col key={post.id} md={6} lg={4} xl={3} className="mb-4">
                <Card 
                  className="h-100"
                  style={{
                    ...styles.card,
                    ...(hoverCardId === post.id ? styles.hoverCard : {})
                  }}
                  onMouseEnter={() => setHoverCardId(post.id)}
                  onMouseLeave={() => setHoverCardId(null)}
                >
                  <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                    {post.imageUrl ? (
                      <>
                        <div style={styles.cardOverlay}></div>
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          style={{ 
                            ...styles.cardImage,
                            ...(hoverCardId === post.id ? styles.cardImageHover : {})
                          }}
                          className="card-img-top"
                        />
                      </>
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center h-100 position-relative">
                        <div style={styles.cardOverlay}></div>
                        <div className="position-relative z-3 p-3 text-center">
                          <div className="bg-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <span className="material-symbols-outlined fs-2 text-secondary">restaurant</span>
                          </div>
                          <p className="text-white mb-0 fw-semibold">No image available</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="position-absolute top-0 end-0 m-3 z-2">
                      <Badge 
                        style={post.status === 'available' ? styles.pillBadge : styles.secondaryBadge}
                        className="opacity-90"
                      >
                        {post.status === 'available' ? 'Available' : 'Claimed'}
                      </Badge>
                    </div>
                    
                    <div className="position-absolute bottom-0 start-0 m-3 z-2">
                      <span style={styles.quantityBadge} className="d-inline-block">
                        {post.quantity}
                      </span>
                    </div>
                  </div>
                  
                  <Card.Body className="d-flex flex-column p-4">
                    <Card.Title style={styles.cardTitle}>{post.title}</Card.Title>
                    
                    <Card.Text style={styles.cardText} className="mb-4">
                      {post.description.length > 100 
                        ? `${post.description.substring(0, 100)}...` 
                        : post.description}
                    </Card.Text>
                    
                    <div style={styles.infoRow}>
                      <div style={styles.avatarCircle} className="me-3">
                        <FaMapMarkerAlt className="text-primary fs-5" />
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {post.location && typeof post.location === 'object' 
                            ? post.location.address 
                            : String(post.location)}
                        </div>
                        {post.distance && (
                          <div style={styles.distanceBadge} className="mt-1">
                            <FaMapMarkerAlt className="me-1" style={{ fontSize: '0.7rem' }} /> {post.distance} km
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={styles.infoRow}>
                      <div style={styles.avatarCircleWarning} className="me-3">
                        <FaCalendarAlt className="text-warning fs-5" />
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>Expires in</div>
                        <div className="text-warning fw-bold">{timeUntilExpiry(post.expiryTime)}</div>
                      </div>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-4">
                        {post.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            bg="light" 
                            text="dark" 
                            className="me-2 mb-2 text-capitalize"
                            style={styles.pillBadge}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-auto">
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2" style={styles.avatarCircle}>
                          <span className="text-primary fw-bold">{post.postedByName.charAt(0)}</span>
                        </div>
                        <div>
                          <span className="text-primary fw-semibold">{post.postedByName}</span>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{formatRelativeTime(post.createdAt)}</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant={post.status === 'available' ? 'success' : 'secondary'} 
                        className="w-100 py-2 d-flex align-items-center justify-content-center"
                        onClick={() => {
                          setSelectedPost(post);
                          setShowModal(true);
                        }}
                        disabled={post.status !== 'available'}
                        style={{
                          ...(post.status === 'available' ? styles.claimButton : {}),
                          ...(post.status === 'available' && hoverCardId === post.id ? styles.claimButtonHover : {})
                        }}
                      >
                        {post.status === 'available' ? (
                          <>
                            <span className="material-symbols-outlined me-2">shopping_cart_checkout</span>
                            Claim Now
                          </>
                        ) : (
                          'Already Claimed'
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        
        {/* List View */}
        {viewMode === 'list' && filteredPosts.length > 0 && (
          <div className="list-view">
            {filteredPosts.map(post => (
              <Card 
                key={post.id} 
                className="mb-4"
                style={{
                  ...styles.card,
                  ...(hoverCardId === post.id ? styles.hoverCard : {})
                }}
                onMouseEnter={() => setHoverCardId(post.id)}
                onMouseLeave={() => setHoverCardId(null)}
              >
                <Card.Body className="p-0">
                  <Row className="g-0">
                    <Col md={3} className="position-relative" style={{ overflow: 'hidden', borderRadius: '16px 0 0 16px' }}>
                      {post.imageUrl ? (
                        <>
                          <div style={{ ...styles.cardOverlay, borderRadius: '16px 0 0 16px' }}></div>
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            style={{ 
                              ...styles.cardImage,
                              borderRadius: '16px 0 0 16px',
                              ...(hoverCardId === post.id ? styles.cardImageHover : {})
                            }}
                          />
                          <div className="position-absolute top-0 start-0 m-3 z-2">
                            <Badge 
                              style={post.status === 'available' ? styles.pillBadge : styles.secondaryBadge}
                              className="opacity-90"
                            >
                              {post.status === 'available' ? 'Available' : 'Claimed'}
                            </Badge>
                          </div>
                          
                          <div className="position-absolute bottom-0 start-0 m-3 z-2">
                            <span style={styles.quantityBadge} className="d-inline-block">
                              {post.quantity}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center h-100" style={{ minHeight: '200px', borderRadius: '16px 0 0 16px' }}>
                          <div style={{ ...styles.cardOverlay, borderRadius: '16px 0 0 16px' }}></div>
                          <div className="position-relative z-3 text-center p-3">
                            <div className="bg-white rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                              <span className="material-symbols-outlined fs-3 text-secondary">restaurant</span>
                            </div>
                            <p className="text-white mb-0 small">No image</p>
                          </div>
                          
                          <div className="position-absolute top-0 start-0 m-3 z-2">
                            <Badge 
                              style={post.status === 'available' ? styles.pillBadge : styles.secondaryBadge}
                              className="opacity-90"
                            >
                              {post.status === 'available' ? 'Available' : 'Claimed'}
                            </Badge>
                          </div>
                          
                          <div className="position-absolute bottom-0 start-0 m-3 z-2">
                            <span style={styles.quantityBadge} className="d-inline-block">
                              {post.quantity}
                            </span>
                          </div>
                        </div>
                      )}
                    </Col>
                    
                    <Col md={9}>
                      <div className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 style={styles.cardTitle} className="mb-0">{post.title}</h5>
                          
                          <div style={styles.distanceBadge}>
                            <FaMapMarkerAlt className="me-1" style={{ fontSize: '0.7rem' }} /> {post.distance} km
                          </div>
                        </div>
                        
                        <p style={styles.cardText} className="mb-4">
                          {post.description.length > 200 
                            ? `${post.description.substring(0, 200)}...` 
                            : post.description}
                        </p>
                        
                        <div className="row">
                          <div className="col-lg-8">
                            <div className="d-flex mb-3">
                              <div style={styles.avatarCircle} className="me-3">
                                <FaMapMarkerAlt className="text-primary fs-5" />
                              </div>
                              <div>
                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Location</div>
                                <div style={{ fontWeight: '500' }}>
                                  {post.location && typeof post.location === 'object' 
                                    ? post.location.address 
                                    : String(post.location)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="d-flex mb-3">
                              <div style={styles.avatarCircleWarning} className="me-3">
                                <FaCalendarAlt className="text-warning fs-5" />
                              </div>
                              <div>
                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Expires in</div>
                                <div className="text-warning fw-bold">{timeUntilExpiry(post.expiryTime)}</div>
                              </div>
                            </div>
                            
                            {post.tags && post.tags.length > 0 && (
                              <div className="mb-3 d-flex flex-wrap">
                                {post.tags.map(tag => (
                                  <Badge 
                                    key={tag} 
                                    bg="light" 
                                    text="dark" 
                                    className="me-2 mb-2 text-capitalize"
                                    style={styles.pillBadge}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="col-lg-4 d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center mb-3">
                              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2" style={styles.avatarCircle}>
                                <span className="text-primary fw-bold">{post.postedByName.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="text-primary fw-semibold">{post.postedByName}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{formatRelativeTime(post.createdAt)}</div>
                              </div>
                            </div>
                            
                            <Button 
                              variant={post.status === 'available' ? 'success' : 'secondary'} 
                              className="py-2 d-flex align-items-center justify-content-center w-100"
                              onClick={() => {
                                setSelectedPost(post);
                                setShowModal(true);
                              }}
                              disabled={post.status !== 'available'}
                              style={{
                                ...(post.status === 'available' ? styles.claimButton : {}),
                                ...(post.status === 'available' && hoverCardId === post.id ? styles.claimButtonHover : {})
                              }}
                            >
                              {post.status === 'available' ? (
                                <>
                                  <span className="material-symbols-outlined me-2">shopping_cart_checkout</span>
                                  Claim Now
                                </>
                              ) : (
                                'Already Claimed'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
        
        {/* Claim Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Claim Food Donation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPost && (
              <>
                <h5 className="mb-3">{selectedPost.title}</h5>
                
                <div className="mb-3">
                  <p>{selectedPost.description}</p>
                </div>
                
                <div className="mb-3">
                  <strong>Quantity:</strong> {selectedPost.quantity}
                </div>
                
                <div className="mb-3">
                  <strong>Posted by:</strong> {selectedPost.postedByName}
                </div>
                
                <div className="mb-3">
                  <strong>Location:</strong>&nbsp;
                  {selectedPost.location && typeof selectedPost.location === 'object' 
                    ? selectedPost.location.address 
                    : String(selectedPost.location)}
                  {selectedPost.distance && ` (${selectedPost.distance} km)`}
                </div>
                
                <div className="mb-3">
                  <strong>Expires:</strong> {formatDate(selectedPost.expiryTime)}
                </div>
                
                <Form.Group className="mb-3">
                  <Form.Label>Add a note (optional)</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    value={claimNotes}
                    onChange={(e) => setClaimNotes(e.target.value)}
                    placeholder="Add any details about your pickup plans, questions for the donor, etc."
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handleClaimPost}
              disabled={isClaiming}
            >
              {isClaiming ? (
                <>
                  <Spinner 
                    as="span" 
                    animation="border" 
                    size="sm" 
                    role="status" 
                    aria-hidden="true" 
                    className="me-2" 
                  />
                  Claiming...
                </>
              ) : (
                'Confirm Claim'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default RecipientDashboard; 