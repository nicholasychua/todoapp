import { useAuth } from '@/lib/auth-context';
import {
  createTabGroupFirestore,
  updateTabGroupFirestore,
  deleteTabGroupFirestore,
  subscribeToTabGroupsFirestore,
  TabGroup,
  TabItem
} from '@/lib/tabgroups';

export function useTabGroupService() {
  const { user } = useAuth();

  async function createTabGroup(tabGroup: Omit<TabGroup, 'id' | 'userId'>) {
    if (!user) throw new Error('Not signed in');
    return createTabGroupFirestore(tabGroup, user.uid);
  }

  async function updateTabGroup(tabGroupId: string, updates: Partial<TabGroup>) {
    if (!user) throw new Error('Not signed in');
    return updateTabGroupFirestore(tabGroupId, updates);
  }

  async function deleteTabGroup(tabGroupId: string) {
    if (!user) throw new Error('Not signed in');
    return deleteTabGroupFirestore(tabGroupId);
  }

  function subscribeToTabGroups(cb: (tabGroups: TabGroup[]) => void) {
    if (!user) throw new Error('Not signed in');
    return subscribeToTabGroupsFirestore(user.uid, cb);
  }

  // Helper function to launch all tabs in a group
  function launchTabGroup(tabGroup: TabGroup) {
    // Alert the user about popup blockers if there are multiple tabs
    if (tabGroup.tabs.length > 1) {
      alert("Please allow popups to open all tabs. If some tabs didn't open, click the button again.");
    }
    
    // Add a slight delay between opening tabs to help with popup blockers
    tabGroup.tabs.forEach((tab, index) => {
      setTimeout(() => {
        window.open(tab.url, '_blank');
      }, index * 300); // 300ms delay between each tab opening
    });
  }

  return { 
    createTabGroup, 
    updateTabGroup, 
    deleteTabGroup, 
    subscribeToTabGroups,
    launchTabGroup
  };
} 