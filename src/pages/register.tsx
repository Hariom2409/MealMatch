import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf(['donor', 'ngo'], 'Please select a valid role')
    .required('Role is required'),
  phone: Yup.string(),
  address: Yup.string(),
  organizationName: Yup.string().when('role', {
    is: 'ngo',
    then: (schema) => schema.required('Organization name is required for NGOs'),
  }),
  organizationDetails: Yup.string(),
});

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the role from query parameter
  const defaultRole = (router.query.role as string) || 'donor';

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: defaultRole as 'donor' | 'ngo',
      phone: '',
      address: '',
      organizationName: '',
      organizationDetails: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        setIsLoading(true);
        
        const userData = {
          name: values.name,
          role: values.role as 'donor' | 'ngo',
          phone: values.phone,
          address: values.address,
          organizationName: values.organizationName,
          organizationDetails: values.organizationDetails,
        };
        
        await register(values.email, values.password, userData);
        
        // Redirect to verification page instead of dashboard
        router.push('/verify-email');
      } catch (err: any) {
        console.error('Registration error:', err);
        setError(err.message || 'Failed to register');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Layout title="Register - MealMatch" description="Register for a MealMatch account">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 p-md-5">
                <h1 className="text-center mb-4 fw-bold">Register</h1>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={formik.handleSubmit}>
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>I am a:</Form.Label>
                        <div>
                          <Form.Check
                            inline
                            type="radio"
                            label="Food Donor"
                            name="role"
                            id="donor"
                            value="donor"
                            checked={formik.values.role === 'donor'}
                            onChange={() => formik.setFieldValue('role', 'donor')}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            label="NGO / Charity"
                            name="role"
                            id="ngo"
                            value="ngo"
                            checked={formik.values.role === 'ngo'}
                            onChange={() => formik.setFieldValue('role', 'ngo')}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Enter your name"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={!!(formik.touched.name && formik.errors.name)}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Enter your email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={!!(formik.touched.email && formik.errors.email)}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          id="password"
                          name="password"
                          placeholder="Create password"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={!!(formik.touched.password && formik.errors.password)}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          isInvalid={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          id="phone"
                          name="phone"
                          placeholder="Enter phone number"
                          value={formik.values.phone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          id="address"
                          name="address"
                          placeholder="Enter your address"
                          value={formik.values.address}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {formik.values.role === 'ngo' && (
                    <>
                      <Row>
                        <Col md={12} className="mb-3">
                          <Form.Group>
                            <Form.Label>Organization Name</Form.Label>
                            <Form.Control
                              type="text"
                              id="organizationName"
                              name="organizationName"
                              placeholder="Enter organization name"
                              value={formik.values.organizationName}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              isInvalid={!!(formik.touched.organizationName && formik.errors.organizationName)}
                            />
                            <Form.Control.Feedback type="invalid">
                              {formik.errors.organizationName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={12} className="mb-3">
                          <Form.Group>
                            <Form.Label>Organization Details</Form.Label>
                            <Form.Control
                              as="textarea"
                              id="organizationDetails"
                              name="organizationDetails"
                              placeholder="Brief description of your organization"
                              value={formik.values.organizationDetails}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              style={{ height: '100px' }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}

                  <Button 
                    variant="success" 
                    type="submit" 
                    className="w-100 py-2 mt-3" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Register'}
                  </Button>
                </Form>
                
                <div className="mt-4 text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link href="/login" className="text-success">
                      Login here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
} 