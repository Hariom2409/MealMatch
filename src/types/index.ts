// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'ngo' | 'admin';
  phone?: string;
  address?: string;
  profileImage?: string;
  organizationName?: string;
  organizationDetails?: string;
  createdAt: Date;
  emailVerified?: boolean;
}

// Food post types
export interface FoodPost {
  id: string;
  title: string;
  quantity: string;
  description: string;
  imageUrl?: string;
  preparedTime: Date;
  expiryTime: Date;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  isVegetarian: boolean;
  isNonVegetarian: boolean;
  isGlutenFree: boolean;
  postedBy: string; // user id of donor
  postedByName: string; // name of donor
  status: 'available' | 'claimed' | 'picked' | 'expired';
  createdAt: Date;
  checklist: SafetyChecklist;
}

// Safety checklist
export interface SafetyChecklist {
  id: string;
  foodId: string;
  hygieneRating: number; // 1-5
  properStorage: boolean;
  safeTemperature: boolean;
  handlingProcedures: boolean;
  notes?: string;
}

// Claim types
export interface Claim {
  id: string;
  foodId: string;
  claimedBy: string; // user id of NGO
  claimedByName: string; // name of NGO
  status: 'claimed' | 'in-transit' | 'delivered' | 'cancelled';
  claimedAt: Date;
  pickupTime?: Date;
  deliveredTime?: Date;
  verificationCode?: string;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  relatedFoodId?: string;
  relatedClaimId?: string;
  createdAt: Date;
  isRead: boolean;
}

// Analytics types
export interface AnalyticsData {
  totalFoodSaved: number;
  totalActiveDonors: number;
  totalActiveNGOs: number;
  foodSavedByMonth: { month: string; amount: number }[];
  mostActiveDonors: { id: string; name: string; count: number }[];
  mostActiveNGOs: { id: string; name: string; count: number }[];
} 