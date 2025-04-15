import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, sendVerificationEmail as firebaseSendVerificationEmail } from '@/utils/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  loading: boolean;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: () => boolean;
  refreshUserState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Force refresh Firebase user to check for updated email verification status
  const refreshUserState = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      
      // Update the current user state if the user exists
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          // Get existing user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser({
              ...userData,
              id: firebaseUser.uid,
              email: firebaseUser.email || userData.email,
              name: firebaseUser.displayName || userData.name,
              emailVerified: firebaseUser.emailVerified,
            });
          }
        } catch (error) {
          console.error('Error refreshing user state:', error);
        }
      }
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed: User is logged in:', user.email);
        
        try {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser({
              ...userData,
              id: user.uid,
              email: user.email || userData.email,
              name: user.displayName || userData.name,
              emailVerified: user.emailVerified,
            });
          } else {
            // Basic user data if Firestore document doesn't exist
            console.log('No user document found in Firestore, creating basic user object');
            setCurrentUser({
              id: user.uid,
              email: user.email || '',
              name: user.displayName || '',
              role: 'donor', // Default role
              createdAt: new Date(),
              emailVerified: user.emailVerified,
            });
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
          // Fallback to basic user info from auth
          setCurrentUser({
            id: user.uid,
            email: user.email || '',
            name: user.displayName || '',
            role: 'donor', // Default role
            createdAt: new Date(),
            emailVerified: user.emailVerified,
          });
        }
      } else {
        console.log('Auth state changed: No user is logged in');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    console.log('Registering new user:', email, userData);
    
    try {
      // Create user in Firebase Auth
      console.log('Creating user in Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User created in Firebase Auth:', user.uid);
      
      // Send email verification
      console.log('Sending verification email...');
      await firebaseSendVerificationEmail(user);
      
      // Set display name
      if (userData.name) {
        console.log('Setting display name:', userData.name);
        await updateProfile(user, { displayName: userData.name });
      }
      
      // Create user document in Firestore
      const newUser: User = {
        id: user.uid,
        name: userData.name || '',
        email: email,
        role: userData.role || 'donor',
        phone: userData.phone || '',
        address: userData.address || '',
        profileImage: userData.profileImage || '',
        organizationName: userData.organizationName || '',
        organizationDetails: userData.organizationDetails || '',
        createdAt: new Date(),
        emailVerified: user.emailVerified,
      };
      
      console.log('Saving user document to Firestore');
      try {
        await setDoc(doc(db, 'users', user.uid), newUser);
        console.log('User document saved to Firestore');
      } catch (firestoreError) {
        console.error('Error saving user to Firestore:', firestoreError);
        // Continue since the auth user was created
      }
      
      setCurrentUser(newUser);
      console.log('User registration complete');
    } catch (error: any) {
      console.error('Error during registration:', error);
      if (error.code) {
        console.error('Firebase error code:', error.code);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    console.log('Attempting login for:', email);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    console.log('Attempting Google login');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        console.log('Creating new user document for Google user');
        // Create a new user document for first-time Google sign-in
        const newUser: User = {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          role: 'donor', // Default role for Google users
          profileImage: user.photoURL || '',
          createdAt: new Date(),
          emailVerified: user.emailVerified,
        };
        
        await setDoc(doc(db, 'users', user.uid), newUser);
      }
      
      console.log('Google login successful');
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    console.log('Logging out user');
    
    try {
      await signOut(auth);
      setCurrentUser(null);
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (data: Partial<User>) => {
    if (!currentUser) {
      console.error('Cannot update user data: No user is logged in');
      return;
    }
    
    setLoading(true);
    console.log('Updating user data for:', currentUser.id);
    
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await setDoc(userRef, { ...data }, { merge: true });
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      
      // Update display name in Auth if included
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }
      
      console.log('User data updated successfully');
    } catch (error: any) {
      console.error('Error updating user data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add password reset functionality
  const resetPassword = async (email: string) => {
    setLoading(true);
    console.log('Sending password reset email to:', email);
    
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No user is logged in');
    }
    
    try {
      await firebaseSendVerificationEmail(auth.currentUser);
      console.log('Verification email sent');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  };

  // Check if email is verified
  const isEmailVerified = () => {
    return auth.currentUser?.emailVerified || false;
  };

  const value = {
    user: currentUser,
    currentUser,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUserData,
    resetPassword,
    sendVerificationEmail,
    isEmailVerified,
    refreshUserState
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 