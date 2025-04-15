import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLeaf, FaUsers, FaHandHoldingHeart, FaCheck, FaChevronDown } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!mounted) return null;

  return (
    <Layout title="MealMatch - Connecting Surplus Food to Those in Need">
      <Head>
        <title>MealMatch - Reducing Food Waste, Feeding Communities</title>
        <meta name="description" content="Our platform connects food donors with recipients, making it easy to share surplus food with those who need it most." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="min-vh-100 d-flex align-items-center position-relative overflow-hidden">
        <div className="hero-accent"></div>
        <div className="hero-accent-2"></div>
        
        <div className="container py-5">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-6 pe-lg-5">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-4 mb-lg-0"
              >
                <h1 className="display-3 fw-bold mb-4 text-gradient">
                  Reducing Food Waste,<br />Feeding Communities
                </h1>
                
                <p className="lead mb-5 text-secondary">
                  Our platform connects food donors with organizations to ensure surplus food 
                  reaches those who need it most, creating a sustainable solution for food redistribution.
                </p>
                
                <div className="d-flex flex-wrap gap-3 mb-5">
                  {!user ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/register')}
                      className="btn btn-primary btn-lg px-4 py-3 rounded-pill d-flex align-items-center"
                    >
                      Get Started <FaArrowRight className="ms-2" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push(user.role === 'donor' ? '/donor/dashboard' : '/recipient/dashboard')}
                      className="btn btn-primary btn-lg px-4 py-3 rounded-pill d-flex align-items-center"
                    >
                      Dashboard <FaArrowRight className="ms-2" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/about')}
                    className="btn btn-outline-primary btn-lg px-4 py-3 rounded-pill"
                  >
                    Learn More
                  </motion.button>
                </div>
                
                <div className="d-flex flex-wrap stats-row">
                  <motion.div 
                    className="me-5 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="h1 fw-bold mb-0 text-primary counter-animated">250+</div>
                    <p className="text-muted mb-1">Active Donors</p>
                    <div className="stat-bar"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="me-5 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <div className="h1 fw-bold mb-0 text-primary counter-animated">120+</div>
                    <p className="text-muted mb-1">Partner NGOs</p>
                    <div className="stat-bar"></div>
                  </motion.div>
                  
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <div className="h1 fw-bold mb-0 text-primary counter-animated">5,000+</div>
                    <p className="text-muted mb-1">Meals Saved</p>
                    <div className="stat-bar"></div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-lg-6 d-flex justify-content-center">
              <motion.div
                className="premium-svg-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <svg className="premium-svg" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                  {/* Background elements */}
                  <circle cx="400" cy="300" r="250" fill="#f8fafb" />
                  <ellipse cx="600" cy="200" rx="150" ry="100" fill="#e9fcf5" opacity="0.8" />
                  <ellipse cx="200" cy="400" rx="120" ry="80" fill="#e9fcf5" opacity="0.8" />
                  
                  {/* Decorative elements */}
                  <path d="M100,300 Q250,150 400,300 T700,300" stroke="#00A86B" strokeWidth="2" fill="transparent" opacity="0.2" />
                  <path d="M100,320 Q250,170 400,320 T700,320" stroke="#00A86B" strokeWidth="2" fill="transparent" opacity="0.2" />
                  <path d="M100,340 Q250,190 400,340 T700,340" stroke="#00A86B" strokeWidth="2" fill="transparent" opacity="0.2" />
                  
                  {/* Main elements - donation flow */}
                  <g className="food-box" transform="translate(300, 240)">
                    {/* Food box with gradient */}
                    <rect x="0" y="0" width="200" height="150" rx="15" fill="url(#boxGradient)" />
                    <rect x="10" y="10" width="180" height="130" rx="10" fill="white" />
                    
                    {/* Food items in box */}
                    <circle cx="50" cy="50" r="20" fill="#FF6B6B" />
                    <circle cx="90" cy="60" r="15" fill="#FFD166" />
                    <rect x="120" y="40" width="30" height="40" rx="5" fill="#118AB2" />
                    <rect x="160" y="50" width="20" height="30" rx="3" fill="#EF476F" />
                  </g>
                  
                  {/* People */}
                  <g className="simple-people">
                    {/* Donor */}
                    <g transform="translate(180, 300)">
                      <circle cx="0" cy="-40" r="35" fill="#e6f5f0" />
                      <circle cx="0" cy="-40" r="25" fill="#00A86B" opacity="0.8" />
                      <path d="M-25,0 h50 v60 a25,25 0 0 1 -50,0 z" fill="#00A86B" opacity="0.6" />
                    </g>
                    
                    {/* Recipient */}
                    <g transform="translate(620, 300)">
                      <circle cx="0" cy="-40" r="35" fill="#e6f2fc" />
                      <circle cx="0" cy="-40" r="25" fill="#3B82F6" opacity="0.8" />
                      <path d="M-25,0 h50 v60 a25,25 0 0 1 -50,0 z" fill="#3B82F6" opacity="0.6" />
                    </g>
                  </g>
                  
                  {/* Connection arrows */}
                  <path d="M230,300 C270,250 280,250 290,300" stroke="#00A86B" strokeWidth="3" fill="transparent" strokeLinecap="round" />
                  <path d="M510,300 C570,250 580,250 590,300" stroke="#3B82F6" strokeWidth="3" fill="transparent" strokeLinecap="round" />
                  
                  {/* Info badges */}
                  <g transform="translate(550, 150)">
                    <rect width="140" height="50" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                    <circle cx="25" cy="25" r="15" fill="#00A86B" opacity="0.8" />
                    <text x="50" y="30" fontSize="16" fontWeight="500" fill="#333">Save Food</text>
                  </g>
                  
                  <g transform="translate(160, 450)">
                    <rect width="160" height="50" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                    <circle cx="25" cy="25" r="15" fill="#3B82F6" opacity="0.8" />
                    <text x="50" y="30" fontSize="16" fontWeight="500" fill="#333">Help Community</text>
                  </g>
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00A86B" />
                      <stop offset="100%" stopColor="#33C68D" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
        
        <motion.div 
          className="scroll-chevron"
          onClick={scrollToFeatures}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <FaChevronDown />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-6">
        <div className="container py-5">
          <div className="row text-center mb-5">
            <div className="col-lg-8 mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h6 className="text-uppercase text-primary fw-semibold mb-3">How It Works</h6>
                <h2 className="display-5 fw-bold mb-4">Making Food Sharing Simple</h2>
                <p className="lead text-secondary">Our platform streamlines the process of donating surplus food, ensuring it reaches those who need it most.</p>
              </motion.div>
            </div>
          </div>
          
          <div className="row g-5">
            <div className="col-md-4">
              <motion.div 
                className="process-card p-5 h-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <div className="text-center">
                  <div className="process-icon-circle bg-primary-subtle mx-auto mb-4">
                    <FaHandHoldingHeart className="text-primary fs-3" />
                  </div>
                  <h3 className="h4 mb-3">Donate Food</h3>
                  <p className="text-secondary mb-0">Easily post surplus food for donation. Share details about quantity, type, and pickup options all in one place.</p>
                </div>
              </motion.div>
            </div>
            
            <div className="col-md-4">
              <motion.div 
                className="process-card p-5 h-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <div className="text-center">
                  <div className="process-icon-circle bg-primary-subtle mx-auto mb-4">
                    <FaUsers className="text-primary fs-3" />
                  </div>
                  <h3 className="h4 mb-3">Connect</h3>
                  <p className="text-secondary mb-0">Our platform matches donations with nearby recipients, creating meaningful connections within your community.</p>
                </div>
              </motion.div>
            </div>
            
            <div className="col-md-4">
              <motion.div 
                className="process-card p-5 h-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <div className="text-center">
                  <div className="process-icon-circle bg-primary-subtle mx-auto mb-4">
                    <FaLeaf className="text-primary fs-3" />
                  </div>
                  <h3 className="h4 mb-3">Reduce Waste</h3>
                  <p className="text-secondary mb-0">Track your impact with detailed metrics on how your donations have helped reduce food waste and feed those in need.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section py-6">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <motion.div 
                className="cta-card text-center p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="display-5 fw-bold text-white mb-4">Ready to Make a Difference?</h2>
                <p className="lead text-white mb-5">Join our community of food donors and recipients today.</p>
                
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/register')}
                    className="btn btn-light btn-lg px-5 py-3 rounded-pill d-flex align-items-center"
                  >
                    Join Now <FaArrowRight className="ms-2" />
                  </motion.button>
                </div>
                
                <div className="d-flex justify-content-center gap-4 mt-5">
                  <div className="d-flex align-items-center text-white">
                    <FaCheck className="me-2 text-light" />
                    <span>Free to use</span>
                  </div>
                  <div className="d-flex align-items-center text-white">
                    <FaCheck className="me-2 text-light" />
                    <span>Simple process</span>
                  </div>
                  <div className="d-flex align-items-center text-white">
                    <FaCheck className="me-2 text-light" />
                    <span>Local impact</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}