import React from 'react';
import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  fullWidth?: boolean;
  noTopPadding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'MealMatch - Connecting Food Donors with NGOs', 
  description = 'MealMatch helps connect food donors with NGOs to reduce food waste and fight hunger',
  fullWidth = false,
  noTopPadding = false
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#00A86B" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="d-flex flex-column min-vh-100">
        <Navigation />
        
        <main className={`flex-grow-1 ${noTopPadding ? '' : 'navbar-spacer'}`}>
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout; 