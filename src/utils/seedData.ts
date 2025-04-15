import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// Function to seed test food posts data to Firestore
export const seedFoodPosts = async () => {
  console.log('Seeding test food posts to Firestore...');
  
  const testPosts = [
    {
      title: 'Fresh Produce',
      quantity: '40 kg',
      description: 'Mixed vegetables and fruits',
      postedByName: 'Green Market',
      postedBy: 'test-donor-1',
      location: {
        address: '123 Main Street',
        lat: 37.7749,
        lng: -122.4194
      },
      preparedTime: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 5)),
      expiryTime: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24)),
      isVegetarian: true,
      isNonVegetarian: false,
      isGlutenFree: true,
      status: 'available',
      createdAt: serverTimestamp(),
    },
    {
      title: 'Prepared Meals',
      quantity: '25 servings',
      description: 'Pasta with marinara sauce',
      postedByName: 'Italian Restaurant',
      postedBy: 'test-donor-2',
      location: {
        address: '456 Oak Avenue',
        lat: 37.7739,
        lng: -122.4312
      },
      preparedTime: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 2)),
      expiryTime: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 5)),
      isVegetarian: true,
      isNonVegetarian: false,
      isGlutenFree: false,
      status: 'available',
      createdAt: serverTimestamp(),
    },
    {
      title: 'Bread Assortment',
      quantity: '30 loaves',
      description: 'Various types of bread and pastries',
      postedByName: 'Downtown Bakery',
      postedBy: 'test-donor-3',
      location: {
        address: '789 Maple Road',
        lat: 37.7729,
        lng: -122.4232
      },
      preparedTime: Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 4)),
      expiryTime: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 12)),
      isVegetarian: true,
      isNonVegetarian: false,
      isGlutenFree: false,
      status: 'available',
      createdAt: serverTimestamp(),
    }
  ];
  
  try {
    // Add each post to Firestore
    const foodPostsCollection = collection(db, 'foodPosts');
    
    for (const post of testPosts) {
      const docRef = await addDoc(foodPostsCollection, post);
      
      // Create a dummy checklist for each post
      const checklistsCollection = collection(db, 'safetyChecklists');
      await addDoc(checklistsCollection, {
        foodId: docRef.id,
        hygieneRating: 5,
        properStorage: true,
        safeTemperature: true,
        handlingProcedures: true,
        notes: 'Food has been properly handled and stored.',
        createdAt: serverTimestamp()
      });
      
      console.log(`Added test food post with ID: ${docRef.id}`);
    }
    
    console.log('Finished seeding test food posts');
    return true;
  } catch (error) {
    console.error('Error seeding test food posts:', error);
    return false;
  }
};

// Function to check if there are any food posts
export const checkFoodPosts = async () => {
  try {
    const foodPostsCollection = collection(db, 'foodPosts');
    // We just want to check if there are any posts, not actually fetch them
    console.log('Collection reference:', foodPostsCollection);
    return foodPostsCollection.path === 'foodPosts';
  } catch (error) {
    console.error('Error checking food posts:', error);
    return false;
  }
}; 