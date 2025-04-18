import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { FaUtensils, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaUpload, FaCheck, FaExclamationTriangle, FaMap, FaSearch } from 'react-icons/fa';
import { createFoodPost } from '@/services/foodPostService';
import { SafetyChecklist } from '@/types';
import AuthCheck from '@/components/auth/AuthCheck';
import Script from 'next/script';

// Dynamically import Google Maps component to avoid SSR issues
const MapWithMarkers = dynamic(
  () => import('@/components/map/GoogleMapComponents'),
  { ssr: false, loading: () => <div style={{ height: '300px', width: '100%', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner animation="border" /></div> }
);

const PostFoodDonation = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Progress tracking
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [preparedDate, setPreparedDate] = useState('');
  const [preparedTime, setPreparedTime] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [foodType, setFoodType] = useState<string[]>([]);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isNonVegetarian, setIsNonVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Safety checklist
  const [hygieneRating, setHygieneRating] = useState(3);
  const [properStorage, setProperStorage] = useState(true);
  const [safeTemperature, setSafeTemperature] = useState(true);
  const [handlingProcedures, setHandlingProcedures] = useState(true);
  const [safetyNotes, setSafetyNotes] = useState('');
  
  // Get today's date and format for date input min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Food type options
  const foodTypeOptions = [
    'fruits', 'vegetables', 'dairy', 'bakery', 'prepared meals', 
    'canned goods', 'grains', 'beverages', 'snacks', 'desserts'
  ];
  
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [useSimpleMap, setUseSimpleMap] = useState(false);
  
  // Add a ref for the autocomplete input
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [placesScriptLoaded, setPlacesScriptLoaded] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/donor/post');
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
    
    // Set default prepared time to now
    const now = new Date();
    setPreparedDate(now.toISOString().split('T')[0]);
    setPreparedTime(now.toTimeString().substring(0, 5));
    
    // Get user's current location for map center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a central location if geolocation fails
          setMapCenter({ lat: 0, lng: 0 });
        }
      );
    }
  }, [currentUser, router]);
  
  const validateImageFile = (file: File): boolean => {
    // Reset previous errors
    setImageError(null);
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image is too large. Maximum size is 5MB.');
      return false;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPEG, PNG, and WebP images are supported.');
      return false;
    }
    
    return true;
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate the file
      if (!validateImageFile(file)) {
        e.target.value = ''; // Clear the input
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFoodTypeToggle = (type: string) => {
    if (foodType.includes(type)) {
      setFoodType(foodType.filter(t => t !== type));
    } else {
      setFoodType([...foodType, type]);
    }
  };
  
  const simulateProgress = () => {
    // Simulate upload progress for user feedback
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 1;
      if (progress > 95) {
        clearInterval(interval);
        progress = 95; // Hold at 95% until complete
      }
      setUploadProgress(progress);
    }, 800);
    
    return () => clearInterval(interval);
  };
  
  const handleMapClick = (e: any) => {
    // This won't be directly called with our iframe implementation
    // But we keep it for compatibility with any future changes
    console.log('Map clicked event received:', e);
    
    if (e.latLng) {
      const newCoordinates = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      console.log('Setting new coordinates:', newCoordinates);
      setCoordinates(newCoordinates);
      
      // Geocode the address if Google Maps is available
      if (window.google && window.google.maps) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: newCoordinates }, (results: any, status: string) => {
            console.log('Geocoding results:', results);
            console.log('Geocoding status:', status);
            if (status === 'OK' && results?.[0]) {
              console.log('Setting location to:', results[0].formatted_address);
              setLocation(results[0].formatted_address);
            }
          });
        } catch (error) {
          console.error('Error during geocoding:', error);
        }
      }
    }
  };
  
  // Manual geocoding function (for when we need to convert an address to coordinates)
  const geocodeAddress = (address: string) => {
    // Open a new tab with Google Maps search for this address
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };
  
  // Add useEffect to initialize Places Autocomplete when script is loaded
  useEffect(() => {
    // Only try to initialize if the script is loaded and the input ref is available
    if (placesScriptLoaded && autocompleteInputRef.current && window.google) {
      try {
        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteInputRef.current,
          { types: ['address'] }
        );
        
        // Add listener for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          console.log('Selected place:', place);
          
          if (place.formatted_address) {
            setLocation(place.formatted_address);
          }
          
          if (place.geometry && place.geometry.location) {
            const newCoordinates = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            setCoordinates(newCoordinates);
            setMapCenter(newCoordinates);
          }
        });
      } catch (error) {
        console.error('Error initializing Places Autocomplete:', error);
      }
    }
  }, [placesScriptLoaded, autocompleteInputRef.current]);

  // Add this to handle when Google Places script loads
  const handlePlacesScriptLoad = () => {
    console.log('Places script loaded');
    setPlacesScriptLoaded(true);
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    // We don't need to manually geocode anymore since Places Autocomplete will handle this
    // Keep minimal logic in case Places isn't loaded
    if (newLocation && newLocation.trim().length > 3 && !placesScriptLoaded) {
      try {
        // Fallback geocoding if Places not loaded
        // ... existing geocoding code ...
      } catch (error) {
        console.error('Error during geocoding:', error);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadStatus('idle');
    
    try {
      // Form validation
      if (!title || !quantity || !description || !location || !expiryDate || !expiryTime) {
        throw new Error('Please fill in all required fields');
      }
      
      // Create combined datetime objects
      const preparedDateTime = new Date(`${preparedDate}T${preparedTime}`);
      const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
      
      if (expiryDateTime <= new Date()) {
        throw new Error('Expiry time must be in the future');
      }
      
      console.log('Current user in post creation:', currentUser);
      console.log('User ID for post:', currentUser?.id);
      
      // Create safety checklist (without id and foodId which will be set by the service)
      const safetyChecklist = {
        hygieneRating,
        properStorage,
        safeTemperature,
        handlingProcedures,
        notes: safetyNotes
      };
      
      // Create food post data object with coordinates
      const foodPostData = {
        title,
        quantity,
        description,
        location: {
          address: location,
          lat: coordinates.lat,
          lng: coordinates.lng
        },
        preparedTime: preparedDateTime,
        expiryTime: expiryDateTime,
        isVegetarian,
        isNonVegetarian,
        isGlutenFree,
        postedBy: currentUser?.id || '',
        postedByName: currentUser?.name || '',
        checklist: safetyChecklist
      };
      
      // If we have an image, start progress simulation
      if (imageFile) {
        setUploadStatus('uploading');
        const stopProgress = simulateProgress();
        
        try {
          // Create food post in Firebase
          console.log('Saving food post to Firebase with image:', foodPostData);
          const postId = await createFoodPost(foodPostData, imageFile);
          
          // Stop progress simulation and set to 100%
          stopProgress();
          setUploadProgress(100);
          setUploadStatus('success');
          
          console.log('Food post created with ID:', postId);
          setSuccess(true);
        } catch (uploadError: any) {
          stopProgress();
          setUploadStatus('error');
          throw new Error(`Image upload failed: ${uploadError.message || 'Unknown error'}`);
        }
      } else {
        // Create food post without image
        console.log('Saving food post to Firebase without image:', foodPostData);
        const postId = await createFoodPost(foodPostData);
        
        console.log('Food post created with ID:', postId);
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error in form submission:', err);
      setError(err.message || 'Failed to create food post. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setQuantity('');
    setDescription('');
    setLocation('');
    setFoodType([]);
    setIsVegetarian(false);
    setIsNonVegetarian(false);
    setIsGlutenFree(false);
    setPickupInstructions('');
    setImageFile(null);
    setImagePreview(null);
    setCurrentStep(1);
    setSuccess(false);
    setError(null);
  };
  
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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
  
  const renderImageUpload = () => (
    <Form.Group className="mb-3">
      <Form.Label>Food Photo</Form.Label>
      <div className="d-flex flex-column">
        <Form.Control
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          className="mb-2"
          disabled={loading}
        />
        
        {imageError && (
          <Alert variant="danger" className="my-2 py-2">
            <FaExclamationTriangle className="me-2" />
            {imageError}
          </Alert>
        )}
        
        <small className="text-muted mb-2">
          Recommended: Upload a clear image of the food. Max size: 5MB. 
          Supported formats: JPEG, PNG, WebP.
        </small>
        
        {imagePreview && (
          <div className="mt-2 position-relative" style={{ height: '200px' }}>
            <Image
              src={imagePreview}
              alt="Food preview"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded"
            />
          </div>
        )}
      </div>
    </Form.Group>
  );
  
  const renderFormActions = () => (
    <>
      {String(currentStep) === "3" && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <Button variant="outline-secondary" onClick={prevStep} disabled={loading}>
            Back
          </Button>
          
          <Button 
            variant="success" 
            type="submit" 
            disabled={loading}
            className="d-flex align-items-center"
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
              <>
                <FaCheck className="me-2" /> Post Food Donation
              </>
            )}
          </Button>
        </div>
      )}
      
      {uploadStatus === 'uploading' && (
        <div className="mt-3">
          <p className="text-center mb-1">Uploading image... {uploadProgress}%</p>
          <ProgressBar 
            animated 
            variant="success" 
            now={uploadProgress} 
            label={`${uploadProgress}%`}
            className="mt-2"
          />
          <p className="text-muted text-center mt-2 small">
            This may take a moment depending on your internet connection
          </p>
        </div>
      )}
    </>
  );
  
  useEffect(() => {
    if (showMap && mapCenter.lat === 0 && mapCenter.lng === 0) {
      console.log('No map center set, trying to get current location');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newCenter = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log('Setting map center to current location:', newCenter);
            setMapCenter(newCenter);
            
            // If no coordinates set yet, also set coordinates
            if (coordinates.lat === 0 && coordinates.lng === 0) {
              setCoordinates(newCenter);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    }
  }, [showMap, mapCenter, coordinates]);
  
  const renderMap = () => {
    if (!showMap) return null;
    
    // Check if API key is properly set
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    console.log('Google Maps API Key (first few chars):', apiKey ? apiKey.substring(0, 5) + '...' : 'missing');
    
    const isValidApiKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey !== '';
    
    if (!isValidApiKey) {
      return (
        <div 
          style={{ 
            height: '300px', 
            width: '100%', 
            backgroundColor: '#f8f9fa', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#dc3545'
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            <FaExclamationTriangle className="me-2" /> Google Maps API Key Not Configured
          </div>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            To use this feature, you need to add a valid Google Maps API key to your <code>.env.local</code> file.
            <br/><br/>
            Update the <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> value with your actual API key.
          </div>
        </div>
      );
    }
    
    // Ensure we have valid coordinates
    const validCenter = (mapCenter.lat !== 0 || mapCenter.lng !== 0) 
      ? mapCenter 
      : { lat: 40.712776, lng: -74.005974 }; // Default to NYC
    
    console.log('Rendering map with center:', validCenter);
    
    return (
      <div>
        <div style={{ height: '300px', width: '100%', marginBottom: '1rem' }}>
          <MapWithMarkers
            googleMapsApiKey={apiKey}
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={validCenter}
            zoom={15}
            onClick={handleMapClick}
            onLoad={() => {
              console.log('Map loaded successfully');
              setIsMapLoaded(true);
            }}
            markerPosition={coordinates.lat !== 0 ? coordinates : undefined}
          />
        </div>
        
        {/* Add a helper text to explain how to use the map */}
        <div className="text-muted mb-3 small">
          <div className="d-flex align-items-center mb-2">
            <FaInfoCircle className="me-2 text-primary" />
            <span>Click on the map to open Google Maps in a new tab and select a precise location.</span>
          </div>
          <div className="d-flex align-items-center">
            <FaSearch className="me-2 text-primary" />
            <span>You can also find a location by typing an address in the Address field above.</span>
          </div>
        </div>
        
        {/* Add a search button next to the address field */}
        <Button 
          variant="outline-primary"
          size="sm"
          className="mt-2"
          onClick={() => geocodeAddress(location)}
        >
          <FaMapMarkerAlt className="me-2" /> Find on Map
        </Button>
      </div>
    );
  };
  
  return (
    <Layout title="Post Food Donation - MealMatch" description="Share your excess food with those in need">
      {/* Google Places script loader */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={handlePlacesScriptLoad}
        strategy="afterInteractive"
      />
      
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                {success ? (
                  <div className="text-center py-4">
                    <div className="success-icon mb-3">
                      <FaCheck size={50} className="text-success" />
                    </div>
                    <h2 className="mb-3">Food Posted Successfully!</h2>
                    <p className="mb-4">
                      Your food donation has been posted and is now visible to recipients.
                      Thank you for helping reduce food waste!
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Button variant="primary" onClick={() => router.push('/donor/dashboard')}>
                        View My Listings
                      </Button>
                      <Button variant="outline-primary" onClick={resetForm}>
                        Post Another Donation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="mb-4 text-center">Post Food Donation</h2>
                    
                    {error && (
                      <Alert variant="danger" className="mb-4">
                        {error}
                      </Alert>
                    )}
                    
                    <Form onSubmit={handleSubmit}>
                      {/* Step 1: Basic Info */}
                      {currentStep === 1 && (
                        <>
                          <div className="mb-4">
                            <div className="step-indicator mb-4">
                              <div className="d-flex justify-content-between">
                                <div className="step active">
                                  <span className="step-number">1</span>
                                  <span className="step-title">Basic Info</span>
                                </div>
                                <div className="step">
                                  <span className="step-number">2</span>
                                  <span className="step-title">Time & Location</span>
                                </div>
                                <div className="step">
                                  <span className="step-number">3</span>
                                  <span className="step-title">Safety Checklist</span>
                                </div>
                              </div>
                            </div>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Fresh Bread Loaves, Leftover Catering Food"
                                required
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="text"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="E.g., 5 loaves, 10 servings, 2kg"
                                required
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the food items, condition, why you're donating, etc."
                                required
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Food Types</Form.Label>
                              <div className="d-flex flex-wrap gap-2">
                                {foodTypeOptions.map((type) => (
                                  <Button
                                    key={type}
                                    variant={foodType.includes(type) ? "primary" : "outline-primary"}
                                    size="sm"
                                    onClick={() => handleFoodTypeToggle(type)}
                                    className="text-capitalize"
                                  >
                                    {type}
                                  </Button>
                                ))}
                              </div>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Dietary Information</Form.Label>
                              <div className="d-flex flex-wrap gap-3">
                                <Form.Check
                                  type="checkbox"
                                  id="vegetarian"
                                  label="Vegetarian"
                                  checked={isVegetarian}
                                  onChange={(e) => setIsVegetarian(e.target.checked)}
                                />
                                <Form.Check
                                  type="checkbox"
                                  id="non-vegetarian"
                                  label="Non-Vegetarian"
                                  checked={isNonVegetarian}
                                  onChange={(e) => setIsNonVegetarian(e.target.checked)}
                                />
                                <Form.Check
                                  type="checkbox"
                                  id="gluten-free"
                                  label="Gluten-Free"
                                  checked={isGlutenFree}
                                  onChange={(e) => setIsGlutenFree(e.target.checked)}
                                />
                              </div>
                            </Form.Group>
                            
                            {renderImageUpload()}
                          </div>
                          
                          <div className="d-flex justify-content-end">
                            <Button variant="success" onClick={nextStep}>
                              Next: Time & Location
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {/* Step 2: Time and Location */}
                      {currentStep === 2 && (
                        <>
                          <div className="mb-4">
                            <div className="step-indicator mb-4">
                              <div className="d-flex justify-content-between">
                                <div className="step completed">
                                  <span className="step-number">1</span>
                                  <span className="step-title">Basic Info</span>
                                </div>
                                <div className="step active">
                                  <span className="step-number">2</span>
                                  <span className="step-title">Time & Location</span>
                                </div>
                                <div className="step">
                                  <span className="step-number">3</span>
                                  <span className="step-title">Safety Checklist</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h5 className="mb-3"><FaCalendarAlt className="me-2" /> Time Information</h5>
                              
                              <Row>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Prepared Date</Form.Label>
                                    <Form.Control
                                      type="date"
                                      value={preparedDate}
                                      onChange={(e) => setPreparedDate(e.target.value)}
                                      max={today}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Prepared Time</Form.Label>
                                    <Form.Control
                                      type="time"
                                      value={preparedTime}
                                      onChange={(e) => setPreparedTime(e.target.value)}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              
                              <Row>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Expiry Date <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                      type="date"
                                      value={expiryDate}
                                      onChange={(e) => setExpiryDate(e.target.value)}
                                      min={today}
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
                            
                            <div className="mb-4">
                              <h5 className="mb-3"><FaMapMarkerAlt className="me-2" /> Pickup Location</h5>
                              
                              <Form.Group className="mb-3">
                                <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                                <div className="d-flex gap-2 mb-2">
                                  <Form.Control
                                    type="text"
                                    value={location}
                                    onChange={handleLocationChange}
                                    placeholder="Enter the pickup location address"
                                    required
                                    ref={autocompleteInputRef}
                                  />
                                  <Button
                                    variant={showMap ? "primary" : "outline-primary"}
                                    onClick={() => setShowMap(!showMap)}
                                  >
                                    <FaMap className="me-2" />
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                  </Button>
                                </div>
                                {renderMap()}
                              </Form.Group>
                              
                              <Form.Group className="mb-3">
                                <Form.Label>Pickup Instructions</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  value={pickupInstructions}
                                  onChange={(e) => setPickupInstructions(e.target.value)}
                                  placeholder="E.g., Ring doorbell, call when arriving, etc."
                                />
                              </Form.Group>
                            </div>
                          </div>
                          
                          <div className="d-flex justify-content-between">
                            <Button variant="outline-secondary" onClick={prevStep}>
                              Back
                            </Button>
                            <Button variant="success" onClick={nextStep}>
                              Next: Safety Checklist
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {/* Step 3: Safety Checklist */}
                      {String(currentStep) === "3" && (
                        <>
                          <div className="mb-4">
                            <div className="step-indicator mb-4">
                              <div className="d-flex justify-content-between">
                                <div className="step completed">
                                  <span className="step-number">1</span>
                                  <span className="step-title">Basic Info</span>
                                </div>
                                <div className="step completed">
                                  <span className="step-number">2</span>
                                  <span className="step-title">Time & Location</span>
                                </div>
                                <div className="step active">
                                  <span className="step-number">3</span>
                                  <span className="step-title">Safety Checklist</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="safety-checklist-info mb-4">
                              <div className="d-flex align-items-center mb-3">
                                <FaInfoCircle className="me-2 text-primary" size={20} />
                                <h5 className="mb-0">Food Safety Declaration</h5>
                              </div>
                              <p className="text-muted">
                                Please confirm the following statements regarding the safety of the food you're donating.
                                This helps build trust between donors and recipients.
                              </p>
                            </div>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Hygiene Rating (1-5)</Form.Label>
                              <div className="d-flex align-items-center">
                                <Form.Range
                                  min={1}
                                  max={5}
                                  value={hygieneRating}
                                  onChange={(e) => setHygieneRating(parseInt(e.target.value))}
                                />
                                <span className="ms-2 rating-value">{hygieneRating}</span>
                              </div>
                              <Form.Text className="text-muted">
                                Rate the hygiene conditions in which the food was prepared/stored
                              </Form.Text>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Check
                                type="checkbox"
                                id="proper-storage"
                                label="Food has been properly stored"
                                checked={properStorage}
                                onChange={(e) => setProperStorage(e.target.checked)}
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Check
                                type="checkbox"
                                id="safe-temperature"
                                label="Food has been kept at safe temperatures"
                                checked={safeTemperature}
                                onChange={(e) => setSafeTemperature(e.target.checked)}
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Check
                                type="checkbox"
                                id="handling-procedures"
                                label="Proper food handling procedures were followed"
                                checked={handlingProcedures}
                                onChange={(e) => setHandlingProcedures(e.target.checked)}
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Additional Safety Notes</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={safetyNotes}
                                onChange={(e) => setSafetyNotes(e.target.value)}
                                placeholder="Any additional information about food safety"
                              />
                            </Form.Group>
                          </div>
                          
                          {renderFormActions()}
                        </>
                      )}
                    </Form>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

// Wrap the component with AuthCheck
export default function PostFoodDonationPage() {
  return (
    <AuthCheck requireVerified={true}>
      <PostFoodDonation />
    </AuthCheck>
  );
} 