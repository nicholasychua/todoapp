import { createTabGroupFirestore } from './tabgroups';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Define default tab groups that all new users will get
const DEFAULT_TAB_GROUPS = [
  {
    name: "Work Essentials",
    tabs: [
      { url: "https://gmail.com", title: "Gmail" },
      { url: "https://calendar.google.com", title: "Google Calendar" },
      { url: "https://chatgpt.com/", title: "ChatGPT" },
    ]
  },
];

/**
 * Check if a user has any existing tab groups
 */
async function hasExistingTabGroups(userId: string): Promise<boolean> {
  try {
    const tabGroupsQuery = query(
      collection(db, 'tabGroups'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(tabGroupsQuery);
    return querySnapshot.docs.length > 0;
  } catch (error) {
    console.error('Error checking existing tab groups:', error);
    return false;
  }
}

/**
 * Create default tab groups for a new user
 */
export async function setupDefaultTabGroups(userId: string): Promise<void> {
  try {
    console.log('Setting up default tab groups for user:', userId);
    
    // Check if user already has tab groups
    const hasExisting = await hasExistingTabGroups(userId);
    
    if (hasExisting) {
      console.log('User already has tab groups, skipping default setup');
      return;
    }
    
    // Create default tab groups
    const promises = DEFAULT_TAB_GROUPS.map(async (group) => {
      try {
        const result = await createTabGroupFirestore({
          name: group.name,
          tabs: group.tabs,
          createdAt: new Date(),
        }, userId);
        console.log(`Created default tab group: ${group.name}`);
        return result;
      } catch (error) {
        console.error(`Failed to create default tab group ${group.name}:`, error);
        throw error;
      }
    });
    
    await Promise.all(promises);
    console.log('Successfully set up all default tab groups');
    
  } catch (error) {
    console.error('Error setting up default tab groups:', error);
    throw error;
  }
}

/**
 * Setup default data for a new user (can be extended with more defaults)
 */
export async function setupNewUserDefaults(userId: string): Promise<void> {
  try {
    console.log('Setting up defaults for new user:', userId);
    
    // Set up default tab groups
    await setupDefaultTabGroups(userId);
    
    // Add more default setups here in the future (categories, tasks, etc.)
    
    console.log('Successfully set up all defaults for new user');
  } catch (error) {
    console.error('Error setting up new user defaults:', error);
    // Don't throw error to avoid breaking the user experience
    // Just log it and continue
  }
} 