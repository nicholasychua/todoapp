import { useState, useEffect, useCallback } from "react";
import { Plus, X, Edit, ExternalLink, Settings, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTabGroupService } from "@/hooks/useTabGroupService";
import { TabGroup, TabItem } from "@/lib/tabgroups";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function TabGroupManager() {
  const { createTabGroup, updateTabGroup, deleteTabGroup, subscribeToTabGroups, launchTabGroup } = useTabGroupService();
  const [tabGroups, setTabGroups] = useState<TabGroup[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [editTabs, setEditTabs] = useState<TabItem[]>([]);

  // Function to manually refresh tab groups data
  const refreshTabGroups = useCallback(() => {
    console.log("Manually refreshing tab groups");
    const unsubscribe = subscribeToTabGroups((newTabGroups) => {
      console.log("Manual refresh received tab groups:", newTabGroups);
      setTabGroups(newTabGroups);
    });
    
    // We don't need to keep this subscription active, just get the data once
    setTimeout(() => {
      unsubscribe();
    }, 1000);
  }, [subscribeToTabGroups]);

  // Subscribe to tab groups
  useEffect(() => {
    console.log("Setting up tab groups subscription");
    try {
      // Log current initialization status
      console.log("Tab Group Manager initialized with user");
      
      const unsubscribe = subscribeToTabGroups((newTabGroups) => {
        console.log("Received new tab groups:", newTabGroups);
        setTabGroups(newTabGroups);
      });
      
      return () => {
        console.log("Cleaning up tab groups subscription");
        unsubscribe();
      };
    } catch (error) {
      console.error("Error subscribing to tab groups:", error);
    }
  }, [subscribeToTabGroups]);

  // Reset form after creating/editing
  const resetForm = () => {
    setNewGroupName("");
    setNewUrl("");
    setNewTitle("");
    setEditTabs([]);
    setIsCreating(false);
    setIsEditing(null);
  };

  // Handle creating a new tab group
  const handleCreateTabGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (editTabs.length === 0) {
      toast.error("Please add at least one tab");
      return;
    }

    try {
      console.log("Creating tab group:", { name: newGroupName, tabs: editTabs });
      const result = await createTabGroup({
        name: newGroupName,
        tabs: editTabs,
        createdAt: new Date(),
      });
      console.log("Tab group created result:", result);
      toast.success("Tab group created!");
      
      // Force a refresh by making a direct check after creation
      console.log("Current tab groups before reset:", tabGroups);
      // Make sure we exit creation mode
      setIsCreating(false);
      resetForm();
      
      // Manually refresh the tab groups after a short delay
      setTimeout(() => {
        refreshTabGroups();
      }, 500);
    } catch (error) {
      console.error("Failed to create tab group:", error);
      toast.error("Failed to create tab group");
    }
  };

  // Handle updating a tab group
  const handleUpdateTabGroup = async () => {
    if (!isEditing) return;
    
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (editTabs.length === 0) {
      toast.error("Please add at least one tab");
      return;
    }

    try {
      await updateTabGroup(isEditing, {
        name: newGroupName,
        tabs: editTabs,
      });
      toast.success("Tab group updated!");
      setIsEditing(null);
      resetForm();
      
      // Manually refresh the tab groups after a short delay
      setTimeout(() => {
        refreshTabGroups();
      }, 500);
    } catch (error) {
      console.error("Failed to update tab group:", error);
      toast.error("Failed to update tab group");
    }
  };

  // Handle deleting a tab group
  const handleDeleteTabGroup = async (id: string) => {
    try {
      await deleteTabGroup(id);
      toast.success("Tab group deleted!");
      
      // Manually refresh the tab groups after a short delay
      setTimeout(() => {
        refreshTabGroups();
      }, 500);
    } catch (error) {
      console.error("Failed to delete tab group:", error);
      toast.error("Failed to delete tab group");
    }
  };

  // Start editing a tab group
  const startEditingTabGroup = (tabGroup: TabGroup) => {
    setIsEditing(tabGroup.id);
    setNewGroupName(tabGroup.name);
    setEditTabs([...tabGroup.tabs]);
  };

  // Add a tab to the current editing session
  const addTab = () => {
    if (!newUrl.trim() || !newTitle.trim()) {
      toast.error("Please enter both URL and title");
      return;
    }

    // Validate URL
    try {
      new URL(newUrl);
    } catch (e) {
      toast.error("Please enter a valid URL");
      return;
    }

    setEditTabs([...editTabs, { url: newUrl, title: newTitle }]);
    setNewUrl("");
    setNewTitle("");
  };

  // Remove a tab from the current editing session
  const removeTab = (index: number) => {
    const newTabs = [...editTabs];
    newTabs.splice(index, 1);
    setEditTabs(newTabs);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">My Tab Groups ({tabGroups.length})</h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={refreshTabGroups}
            title="Refresh tab groups"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => {
              console.log("Current tab groups:", tabGroups);
              setIsCreating(true);
              setIsEditing(null);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(isCreating || isEditing) ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-3 mb-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">
                    {isEditing ? "Edit Group" : "New Group"}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={resetForm}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  className="text-sm h-8"
                />

                <div className="space-y-2">
                  <div className="text-xs font-medium">Tabs</div>
                  <div className="space-y-2">
                    {editTabs.map((tab, index) => (
                      <div key={index} className="flex items-center gap-2 bg-accent/50 p-2 rounded-md">
                        <div className="flex-1 text-xs truncate">
                          <div className="font-medium">{tab.title}</div>
                          <div className="text-muted-foreground">{tab.url}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeTab(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Tab title"
                      className="text-xs h-7"
                    />
                    <Input
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="URL (https://...)"
                      className="text-xs h-7"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7"
                      onClick={addTab}
                    >
                      Add Tab
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full text-xs h-8"
                  onClick={isEditing ? handleUpdateTabGroup : handleCreateTabGroup}
                >
                  {isEditing ? "Update Group" : "Create Group"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="group-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {tabGroups.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No tab groups yet. Create one to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {tabGroups.map((group) => (
                  <Card key={group.id} className="p-3 overflow-hidden">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">{group.name}</h4>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => launchTabGroup(group)}
                            title="Launch all tabs"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => startEditingTabGroup(group)}
                            title="Edit group"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTabGroup(group.id)}
                            title="Delete group"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {group.tabs.map((tab, idx) => (
                          <div 
                            key={idx} 
                            className="text-xs flex items-center gap-2 hover:bg-accent/50 p-1 rounded cursor-pointer transition-colors"
                            onClick={() => window.open(tab.url, '_blank')}
                          >
                            <div className="w-1 h-5 bg-primary rounded-full opacity-70"></div>
                            <div className="truncate">{tab.title}</div>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-7 mt-2"
                        onClick={() => launchTabGroup(group)}
                      >
                        Launch All Tabs ({group.tabs.length})
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 