import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/utils/firebase';
import { FoodPost, SafetyChecklist } from '@/types';

// Types for function parameters
type CreateFoodPostData = Omit<FoodPost, 'id' | 'createdAt' | 'status' | 'checklist'> & {
  checklist: Omit<SafetyChecklist, 'id' | 'foodId'>
};

// Create a new food post
export const createFoodPost = async (
  postData: CreateFoodPostData,
  image?: File
): Promise<string> => {
  console.log('Creating food post with data:', postData);
  console.log('Posted by user ID:', postData.postedBy);

  try {
    // Upload image if provided
    let imageUrl = '';
    if (image) {
      console.log('Uploading image to Firebase Storage');
      
      // Create a unique file path with timestamp and random string to avoid collisions
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const filename = `${timestamp}-${randomString}-${image.name}`;
      const storageRef = ref(storage, `food-images/${filename}`);
      
      // Set upload timeout to 60 seconds
      const uploadPromise = new Promise<string>(async (resolve, reject) => {
        try {
          // Check file size (limit to 5MB)
          if (image.size > 5 * 1024 * 1024) {
            throw new Error('Image file is too large. Maximum size is 5MB.');
          }
          
          // Upload with metadata for better caching and content type
          const metadata = {
            contentType: image.type,
            cacheControl: 'public,max-age=86400',
          };
          
          // Compress image if needed (could be expanded)
          const snapshot = await uploadBytes(storageRef, image, metadata);
          console.log('Image uploaded successfully');
          
          // Get download URL with timeout
          const url = await getDownloadURL(snapshot.ref);
          resolve(url);
        } catch (err) {
          console.error('Error in image upload process:', err);
          reject(err);
        }
      });
      
      // Set a timeout for the upload
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Image upload timed out. Please try again with a smaller image.'));
        }, 60000); // 60 seconds timeout
      });
      
      // Race the upload against the timeout
      try {
        imageUrl = await Promise.race([uploadPromise, timeoutPromise]);
        console.log('Image uploaded, URL:', imageUrl);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        throw uploadError;
      }
    }

    // Create food post document
    const foodPostData = {
      ...postData,
      imageUrl,
      status: 'available',
      createdAt: serverTimestamp(),
      preparedTime: Timestamp.fromDate(postData.preparedTime),
      expiryTime: Timestamp.fromDate(postData.expiryTime),
    };

    console.log('Adding food post to Firestore with final data:', foodPostData);
    const docRef = await addDoc(collection(db, 'foodPosts'), foodPostData);
    
    // Create safety checklist document
    console.log('Adding safety checklist to Firestore');
    await addDoc(collection(db, 'safetyChecklists'), {
      ...postData.checklist,
      foodId: docRef.id,
      createdAt: serverTimestamp(),
    });

    console.log('Food post created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating food post:', error);
    throw error;
  }
};

// Get all food posts with optional filters
export const getFoodPosts = async (filters?: {
  status?: string;
  foodType?: string;
  userId?: string;
  nearExpiry?: boolean;
}): Promise<FoodPost[]> => {
  try {
    console.log('Getting food posts from Firestore with filters:', filters);
    
    let q = collection(db, 'foodPosts');
    
    // Apply filters
    const constraints = [];
    
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
      console.log('Added status filter:', filters.status);
    }
    
    if (filters?.foodType === 'vegetarian') {
      constraints.push(where('isVegetarian', '==', true));
      console.log('Added vegetarian filter');
    } else if (filters?.foodType === 'non-vegetarian') {
      constraints.push(where('isNonVegetarian', '==', true));
      console.log('Added non-vegetarian filter');
    } else if (filters?.foodType === 'gluten-free') {
      constraints.push(where('isGlutenFree', '==', true));
      console.log('Added gluten-free filter');
    }
    
    if (filters?.userId) {
      console.log('Adding postedBy filter with user ID:', filters.userId);
      constraints.push(where('postedBy', '==', filters.userId));
    }
    
    // Order by creation date
    constraints.push(orderBy('createdAt', 'desc'));
    console.log('Added orderBy createdAt desc');
    
    console.log('Final query constraints:', JSON.stringify(constraints));
    
    const querySnapshot = await getDocs(query(q, ...constraints));
    
    console.log(`Found ${querySnapshot.size} food posts in Firestore`);
    if (querySnapshot.size === 0) {
      console.log('No posts found. Collection might be empty or filters too restrictive');
    }
    
    let foodPosts: FoodPost[] = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Get safety checklist
      const checklistQuery = query(
        collection(db, 'safetyChecklists'),
        where('foodId', '==', doc.id),
        limit(1)
      );
      
      const checklistSnapshot = await getDocs(checklistQuery);
      let checklist: SafetyChecklist | null = null;
      
      if (!checklistSnapshot.empty) {
        const checklistData = checklistSnapshot.docs[0].data();
        checklist = {
          id: checklistSnapshot.docs[0].id,
          foodId: doc.id,
          hygieneRating: checklistData.hygieneRating,
          properStorage: checklistData.properStorage,
          safeTemperature: checklistData.safeTemperature,
          handlingProcedures: checklistData.handlingProcedures,
          notes: checklistData.notes,
        };
      }
      
      const post: FoodPost = {
        id: doc.id,
        title: data.title,
        quantity: data.quantity,
        description: data.description,
        imageUrl: data.imageUrl,
        preparedTime: data.preparedTime.toDate(),
        expiryTime: data.expiryTime.toDate(),
        location: data.location,
        isVegetarian: data.isVegetarian,
        isNonVegetarian: data.isNonVegetarian,
        isGlutenFree: data.isGlutenFree,
        postedBy: data.postedBy,
        postedByName: data.postedByName,
        status: data.status,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        checklist: checklist as SafetyChecklist,
      };
      
      // Filter near expiry items if requested
      if (filters?.nearExpiry) {
        const now = new Date();
        const expiryTime = post.expiryTime;
        // Consider "near expiry" as within 3 hours
        const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        
        if (expiryTime < threeHoursFromNow && expiryTime > now) {
          foodPosts.push(post);
        }
      } else {
        foodPosts.push(post);
      }
    }
    
    return foodPosts;
  } catch (error) {
    console.error('Error fetching food posts:', error);
    throw error;
  }
};

// Get a single food post by ID
export const getFoodPostById = async (id: string): Promise<FoodPost | null> => {
  try {
    console.log('Getting food post by ID from Firestore:', id);
    
    const docRef = doc(db, 'foodPosts', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('Food post not found in Firestore');
      return null;
    }
    
    const data = docSnap.data();
    
    // Get safety checklist
    const checklistQuery = query(
      collection(db, 'safetyChecklists'),
      where('foodId', '==', id),
      limit(1)
    );
    
    const checklistSnapshot = await getDocs(checklistQuery);
    let checklist: SafetyChecklist | null = null;
    
    if (!checklistSnapshot.empty) {
      const checklistData = checklistSnapshot.docs[0].data();
      checklist = {
        id: checklistSnapshot.docs[0].id,
        foodId: id,
        hygieneRating: checklistData.hygieneRating,
        properStorage: checklistData.properStorage,
        safeTemperature: checklistData.safeTemperature,
        handlingProcedures: checklistData.handlingProcedures,
        notes: checklistData.notes,
      };
    }
    
    const post: FoodPost = {
      id,
      title: data.title,
      quantity: data.quantity,
      description: data.description,
      imageUrl: data.imageUrl,
      preparedTime: data.preparedTime.toDate(),
      expiryTime: data.expiryTime.toDate(),
      location: data.location,
      isVegetarian: data.isVegetarian,
      isNonVegetarian: data.isNonVegetarian,
      isGlutenFree: data.isGlutenFree,
      postedBy: data.postedBy,
      postedByName: data.postedByName,
      status: data.status,
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      checklist: checklist as SafetyChecklist,
    };
    
    return post;
  } catch (error) {
    console.error('Error fetching food post by ID:', error);
    throw error;
  }
};

// Update an existing food post
export const updateFoodPost = async (
  id: string,
  postData: Partial<FoodPost>,
  image?: File
): Promise<void> => {
  try {
    console.log('Updating food post with ID:', id);
    
    const docRef = doc(db, 'foodPosts', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Food post not found');
    }
    
    // Upload new image if provided
    let imageUrl = '';
    if (image) {
      console.log('Uploading new image to Firebase Storage');
      const storageRef = ref(storage, `food-images/${Date.now()}-${image.name}`);
      const snapshot = await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(snapshot.ref);
      console.log('New image uploaded, URL:', imageUrl);
      
      // Add imageUrl to update data
      postData.imageUrl = imageUrl;
    }
    
    // Convert date fields to Firestore timestamps
    const updateData: Record<string, any> = { ...postData };
    
    if (postData.preparedTime) {
      updateData.preparedTime = Timestamp.fromDate(postData.preparedTime);
    }
    
    if (postData.expiryTime) {
      updateData.expiryTime = Timestamp.fromDate(postData.expiryTime);
    }
    
    // Remove checklist from updateData as it's updated separately
    if (updateData.checklist) {
      delete updateData.checklist;
    }
    
    // Update food post document
    await updateDoc(docRef, updateData);
    
    // Update safety checklist if provided
    if (postData.checklist) {
      const checklistQuery = query(
        collection(db, 'safetyChecklists'),
        where('foodId', '==', id),
        limit(1)
      );
      
      const checklistSnapshot = await getDocs(checklistQuery);
      
      if (!checklistSnapshot.empty) {
        const checklistRef = doc(db, 'safetyChecklists', checklistSnapshot.docs[0].id);
        const checklistData = {
          hygieneRating: postData.checklist.hygieneRating,
          properStorage: postData.checklist.properStorage,
          safeTemperature: postData.checklist.safeTemperature,
          handlingProcedures: postData.checklist.handlingProcedures,
          notes: postData.checklist.notes
        };
        await updateDoc(checklistRef, checklistData);
      }
    }
    
    console.log('Food post updated successfully');
  } catch (error) {
    console.error('Error updating food post:', error);
    throw error;
  }
};

// Delete a food post
export const deleteFoodPost = async (id: string): Promise<void> => {
  try {
    console.log('Deleting food post with ID:', id);
    
    // Delete the food post document
    await deleteDoc(doc(db, 'foodPosts', id));
    
    // Delete associated safety checklist
    const checklistQuery = query(
      collection(db, 'safetyChecklists'),
      where('foodId', '==', id),
      limit(1)
    );
    
    const checklistSnapshot = await getDocs(checklistQuery);
    
    if (!checklistSnapshot.empty) {
      await deleteDoc(doc(db, 'safetyChecklists', checklistSnapshot.docs[0].id));
    }
    
    console.log('Food post and related documents deleted successfully');
  } catch (error) {
    console.error('Error deleting food post:', error);
    throw error;
  }
};

// Update food post status to expired
export const updateFoodPostStatus = async (id: string, status: string): Promise<void> => {
  try {
    console.log(`Updating food post ${id} status to: ${status}`);
    
    const docRef = doc(db, 'foodPosts', id);
    await updateDoc(docRef, {
      status: status
    });
    
    console.log('Food post status updated successfully');
  } catch (error) {
    console.error('Error updating food post status:', error);
    throw error;
  }
}; 