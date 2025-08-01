"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useTaskService } from "@/hooks/useTaskService"
import type { Task } from "@/lib/tasks"
import { toast } from "sonner"
import {
  Category,
  subscribeToCategories,
  addCategory,
  deleteCategory,
} from "@/lib/categories"
import { NavigationSidebar } from "@/components/ui/navigation-sidebar"

// Create a custom styled checkbox component
function StyledCheckbox({ checked, onCheckedChange, className }: { 
  checked: boolean; 
  onCheckedChange: () => void;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "h-4 w-4 min-h-4 min-w-4 rounded-full border border-gray-300 flex items-center justify-center transition-colors cursor-pointer",
        checked ? "border-gray-400" : "bg-white",
        className
      )}
      onClick={onCheckedChange}
      data-task-checkbox
    >
      {checked && (
        <div className="h-3.5 w-3.5 rounded-full bg-gray-400" style={{ boxShadow: '0 0 0 1px white inset' }} />
      )}
    </div>
  );
}

export default function SubspacesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { createTask, updateTask, deleteTask, subscribeToTasks } = useTaskService();
  
  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState<string>("");
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [pendingCompletions, setPendingCompletions] = useState<Record<string, NodeJS.Timeout>>({});
  const [cardStates, setCardStates] = useState<Record<string, { showAdd: boolean, input: string, date?: Date }>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/coming-soon')
    }
  }, [user, loading, router])

  // Subscribe to tasks
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToTasks((newTasks: Task[]) => {
      setTasks(newTasks)
    })

    return () => unsubscribe()
  }, [user, subscribeToTasks])

  // Subscribe to categories
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCategories(user.uid, (cats) => setCategories(cats));
    return () => unsubscribe();
  }, [user]);

  // Parse tags from text (words starting with #)
  const parseTagsFromText = (text: string): string[] => {
    const tagRegex = /#(\w+)/g
    const matches = text.match(tagRegex) || []
    return matches.map((tag) => tag.substring(1))
  }

  // Format text with colored tags
  const formatTextWithTags = (text: string) => {
    // Remove all #tags from the text
    return text.replace(/#\w+/g, '').replace(/\s{2,}/g, ' ').trim();
  };

  // Toggle task completion with delay
  const toggleTaskCompletion = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isPending = !!pendingCompletions[taskId];

    if (isPending) {
      // If the task is in the pending state, cancel the completion
      clearTimeout(pendingCompletions[taskId]);
      setPendingCompletions((prev) => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
      setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
    } else if (task.completed) {
      // If the task is already completed, uncheck it
      try {
        await updateTask(taskId, { completed: false });
      } catch (error) {
        toast.error("Failed to uncheck task.");
      }
    } else {
      // If the task is not completed, check it and start the timer
      setCompletedTaskIds((prev) => [...prev, taskId]);

      const timeoutId = setTimeout(async () => {
        try {
          await updateTask(taskId, { completed: true });

          setTimeout(() => {
            setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
            setPendingCompletions((prev) => {
              const updated = { ...prev };
              delete updated[taskId];
              return updated;
            });
          }, 100);
        } catch (error) {
          toast.error("Failed to complete task.");
          // Revert pending state on error
          setCompletedTaskIds((prev) => prev.filter((id) => id !== taskId));
          setPendingCompletions((prev) => {
            const updated = { ...prev };
            delete updated[taskId];
            return updated;
          });
        }
      }, 4000);

      setPendingCompletions((prev) => ({
        ...prev,
        [taskId]: timeoutId,
      }));
    }
  };

  // Get all unique tags with their counts
  const tagCounts = tasks.reduce((acc, task) => {
    task.tags.forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Merge tags from tasks and categories
  const allTags = Array.from(new Set([
    ...Object.keys(tagCounts),
    ...categories.map((cat) => cat.name),
  ]))
    .filter(tag => tag !== 'tag' && tag !== 'shopping')
    .sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0));

  // Helper function to get color for a tag
  const getTagTextColor = (tag: string) => {
    const categoryColors = [
      'text-orange-500',
      'text-blue-500',
      'text-green-500',
      'text-red-500',
      'text-purple-500',
      'text-yellow-500',
      'text-pink-500',
      'text-cyan-500',
      'text-indigo-500',
      'text-amber-500',
    ];
    const index = allTags.indexOf(tag);
    if (index === -1) return "text-gray-500";
    const colorIndex = index % categoryColors.length;
    return categoryColors[colorIndex];
  };

  // Helper to get state for a card
  const getCardState = (catName: string) => cardStates[catName] || { showAdd: false, input: "", date: undefined };

  // Handler to update state for a card
  const setCardState = (catName: string, newState: Partial<{ showAdd: boolean, input: string, date?: Date }>) => {
    setCardStates(prev => ({
      ...prev,
      [catName]: { ...getCardState(catName), ...newState }
    }));
  };

  // Handler to open modal
  const openCategoryModal = (catName: string) => setSelectedCategory(catName);
  
  // Handler to close modal
  const closeCategoryModal = () => {
    setSelectedCategory(null);
    setEditTaskId(null);
    setEditTaskText("");
  };

  // Handler for editing a task
  const startEditTask = (task: Task) => {
    setEditTaskId(task.id);
    setEditTaskText(task.text);
  };
  
  const saveEditTask = async (task: Task) => {
    if (editTaskText.trim() && editTaskText !== task.text) {
      await updateTask(task.id, { text: editTaskText });
    }
    setEditTaskId(null);
    setEditTaskText("");
  };

  // State for card order
  const initialOrder = [...categories.map(c => c.name), "Uncategorized"];
  const [categoryOrder, setCategoryOrder] = useState<string[]>(initialOrder);
  
  // Keep order in sync with categories
  useEffect(() => {
    setCategoryOrder([...categories.map(c => c.name), "Uncategorized"]);
  }, [categories.length]);

  // Create a single drag control for all cards
  const dragControls = useDragControls();

  // Helper function to distribute items into columns
  const distributeIntoColumns = (items: string[], numColumns: number = 3) => {
    const columns: string[][] = Array(numColumns).fill(null).map(() => []);
    items.forEach((item, index) => {
      columns[index % numColumns].push(item);
    });
    return columns;
  };

  const columns = distributeIntoColumns(categoryOrder, 3);

  // Handle reordering
  const handleReorder = (newOrder: string[]) => {
    setCategoryOrder(newOrder);
    // TODO: Persist order to backend if needed
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="relative min-h-screen flex bg-gray-50">
      <NavigationSidebar currentPage="subspaces" />
      
      <div className="flex-1 ml-48 p-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Subspaces</h1>
            <p className="text-gray-500 text-sm">Your complete task brain dump and management center</p>
          </div>

          {/* Create a new list (category) */}
          <div className="flex justify-center">
            <Card className="p-4 mb-4 max-w-lg w-full">
              <form
                className="flex gap-2 items-center"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newTaskText.trim() && !allTags.includes(newTaskText.trim()) && user) {
                    await addCategory(newTaskText.trim(), user.uid);
                    setNewTaskText("");
                  }
                }}
              >
                <Input
                  placeholder="Create a new list..."
                  className="flex-1 text-sm rounded-lg"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setNewTaskText('');
                  }}
                />
                <Button type="submit" size="sm" className="text-xs">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </form>
            </Card>
          </div>

          {/* Category Cards Grid - Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {columns.map((column, columnIndex) => (
              <Reorder.Group
                key={columnIndex}
                axis="y"
                values={column}
                onReorder={(newColumnOrder) => {
                  const newOrder = [...categoryOrder];
                  // Update the positions based on the new column order
                  column.forEach((item, oldIndex) => {
                    const newIndex = newColumnOrder.indexOf(item);
                    if (newIndex !== oldIndex) {
                      const globalOldIndex = categoryOrder.indexOf(item);
                      const globalNewIndex = columnIndex * Math.ceil(categoryOrder.length / 3) + newIndex;
                      if (globalOldIndex !== -1) {
                        newOrder.splice(globalOldIndex, 1);
                        newOrder.splice(globalNewIndex, 0, item);
                      }
                    }
                  });
                  handleReorder(newOrder);
                }}
                className="space-y-6"
              >
                {column.map((catName) => {
                  const isUncategorized = catName === "Uncategorized";
                  const catTasks = isUncategorized
                    ? filteredAndSortedTasks.filter(t => t.tags.length === 0)
                    : filteredAndSortedTasks.filter(t => t.tags[0] === catName);
                  const cardState = getCardState(catName);
                  
                  return (
                    <Reorder.Item
                      key={catName}
                      value={catName}
                      dragListener={true}
                      dragControls={dragControls}
                      whileDrag={{ 
                        scale: 1.05, 
                        rotate: 2,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)", 
                        zIndex: 1000,
                        cursor: "grabbing"
                      }}
                      dragTransition={{ 
                        bounceStiffness: 300, 
                        bounceDamping: 20 
                      }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col p-4 relative cursor-pointer select-none hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h2
                          className="text-lg font-semibold text-gray-900 truncate flex-1 cursor-pointer"
                          onClick={() => openCategoryModal(catName)}
                        >
                          {catName}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            {catTasks.length}
                          </span>
                          <button
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                            title="Drag to reorder"
                            onPointerDown={(e) => {
                              dragControls.start(e);
                            }}
                            tabIndex={0}
                            aria-label="Drag card"
                            type="button"
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                              <circle cx="5" cy="6" r="1.5" fill="currentColor"/>
                              <circle cx="5" cy="10" r="1.5" fill="currentColor"/>
                              <circle cx="5" cy="14" r="1.5" fill="currentColor"/>
                              <circle cx="10" cy="6" r="1.5" fill="currentColor"/>
                              <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                              <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
                              <circle cx="15" cy="6" r="1.5" fill="currentColor"/>
                              <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
                              <circle cx="15" cy="14" r="1.5" fill="currentColor"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div 
                        className="flex flex-col gap-2 mb-3 min-h-[60px] cursor-pointer flex-1" 
                        onClick={() => openCategoryModal(catName)}
                      >
                        {catTasks.length === 0 && (
                          <div className="flex items-center justify-center h-16 text-gray-400">
                            <div className="text-center">
                              <div className="text-2xl mb-1">📝</div>
                              <span className="text-xs">No tasks yet</span>
                            </div>
                          </div>
                        )}
                        <AnimatePresence initial={false}>
                          {catTasks.slice(0, 3).map((task, idx) => (
                            <motion.div
                              key={task.id}
                              layout="position"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className={cn(
                                "flex items-start px-3 py-2 min-h-[36px] group hover:bg-gray-50 transition-colors relative rounded-lg border border-gray-100",
                                completedTaskIds.includes(task.id) || task.completed ? "bg-gray-50 opacity-60" : ""
                              )}
                            >
                              <StyledCheckbox
                                checked={completedTaskIds.includes(task.id) || task.completed}
                                onCheckedChange={() => toggleTaskCompletion(task.id)}
                                className="flex-shrink-0 mt-0.5"
                              />
                              <div className="flex flex-1 flex-row min-w-0 ml-3 items-start">
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className={cn(
                                    "text-sm font-normal leading-relaxed transition-colors duration-200",
                                    completedTaskIds.includes(task.id) || task.completed ? "text-gray-500 line-through" : "text-gray-900"
                                  )}>
                                    {formatTextWithTags(task.text)}
                                  </span>
                                  {task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {task.tags.slice(0, 2).map((tag) => (
                                        <span key={tag} className="text-xs font-medium flex items-center gap-0.5">
                                          <span className="text-gray-400">{tag}</span> 
                                          <span className={getTagTextColor(tag)}>#</span>
                                        </span>
                                      ))}
                                      {task.tags.length > 2 && (
                                        <span className="text-xs text-gray-400">+{task.tags.length - 2}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {catTasks.length > 3 && (
                          <div className="text-xs text-gray-400 text-center py-2 border-t border-gray-100">
                            +{catTasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                      
                      {/* Quick add button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCategoryModal(catName);
                        }}
                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-gray-300"
                      >
                        + Add task
                      </button>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            ))}
          </div>

          {/* Statistics */}
          <Card className="p-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => !t.completed).length}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{allTags.length}</div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
            </div>
          </Card>

          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={closeCategoryModal}
            >
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-card text-card-foreground border border-border shadow-xl rounded-xl w-full max-w-md mx-4 relative"
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                <div className="rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">{selectedCategory}</h2>
                    <button onClick={closeCategoryModal} className="text-muted-foreground hover:text-foreground p-1 rounded-full focus:outline-none">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 mb-4 max-h-80 overflow-y-auto">
                    {filteredAndSortedTasks.filter(t => (selectedCategory === "Uncategorized" ? t.tags.length === 0 : t.tags[0] === selectedCategory)).map(task => (
                      <div key={task.id} className="flex items-center group rounded-lg px-3 py-2 transition-colors hover:bg-muted">
                        <StyledCheckbox
                          checked={completedTaskIds.includes(task.id) || task.completed}
                          onCheckedChange={() => toggleTaskCompletion(task.id)}
                          className="mr-2"
                        />
                        {editTaskId === task.id ? (
                          <input
                            className="flex-1 bg-transparent border-b border-input text-foreground px-1 py-0.5 outline-none"
                            value={editTaskText}
                            onChange={e => setEditTaskText(e.target.value)}
                            onBlur={() => saveEditTask(task)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEditTask(task);
                              if (e.key === 'Escape') { setEditTaskId(null); setEditTaskText(""); }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="flex-1 text-sm cursor-pointer"
                            onClick={() => startEditTask(task)}
                          >
                            {task.text}
                          </span>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="ml-2 text-muted-foreground hover:text-destructive p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                          aria-label="Delete task"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Add Task Input */}
                  <form
                    className="flex gap-2 items-center mt-2"
                    onSubmit={async e => {
                      e.preventDefault();
                      if (!user || !cardStates[selectedCategory]?.input?.trim()) return;
                      const tags = selectedCategory === "Uncategorized" ? [] : [selectedCategory];
                      await createTask({
                        text: cardStates[selectedCategory]?.input,
                        completed: false,
                        tags,
                        createdAt: cardStates[selectedCategory]?.date || new Date(),
                        group: "master"
                      });
                      setCardState(selectedCategory, { input: "", date: undefined });
                    }}
                  >
                    <Input
                      placeholder="Add a task..."
                      className="flex-1 text-xs rounded-lg"
                      value={cardStates[selectedCategory]?.input || ""}
                      onChange={e => setCardState(selectedCategory, { input: e.target.value })}
                    />
                    <Button type="submit" size="sm" className="text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 