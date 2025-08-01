"use client";

import FocusSession from "../../components/ui/FocusSession";
import { useTaskService } from "../../hooks/useTaskService";
import { useTabGroupService } from "../../hooks/useTabGroupService";
import { useState, useEffect } from "react";
import { Task } from "../../lib/tasks";
import { TabGroup } from "../../lib/tabgroups";
import { useAuth } from "../../lib/auth-context";
import { NavigationSidebar } from "../../components/ui/navigation-sidebar";

export default function FocusPage() {
  const { user, loading } = useAuth();
  const { subscribeToTasks, updateTask, deleteTask } = useTaskService();
  const { subscribeToTabGroups, launchTabGroup } = useTabGroupService();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tabGroups, setTabGroups] = useState<TabGroup[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    if (loading || !user) return;
    const unsubscribeTasks = subscribeToTasks(setTasks);
    const unsubscribeTabGroups = subscribeToTabGroups(setTabGroups);
    return () => {
      unsubscribeTasks();
      unsubscribeTabGroups();
    };
  }, [subscribeToTasks, subscribeToTabGroups, user, loading]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to view this page.</div>;

  return (
    <div className="relative min-h-screen flex">
      <NavigationSidebar currentPage="focus" />
      <div className="flex-1">
        <FocusSession
          tasks={tasks}
          toggleTaskCompletion={(id) => updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed })}
          deleteTask={deleteTask}
          formatTextWithTags={(text) => text}
          updateTaskDate={(id, date) => updateTask(id, { createdAt: date })}
          tabGroups={tabGroups}
          allTags={[]}
          completedTaskIds={completedTaskIds}
          getTagTextColor={() => "text-gray-500"}
        />
      </div>
    </div>
  );
} 