"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: Status;
  priority: Priority;
  dueDate?: string | null;
  assignee?: { id: string; name: string | null; image: string | null } | null;
}

export default function TasksPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Status>("TODO");
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM" as Priority, dueDate: "" });

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/tasks?workspaceId=${workspaceId}`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, status: Status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const handleAddTask = (status: Status) => {
    setDefaultStatus(status);
    setShowForm(true);
  };

  const handleCreateTask = async () => {
    if (!form.title.trim()) { toast("Title is required", "error"); return; }
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: defaultStatus, workspaceId }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks(prev => [...prev, task]);
      setShowForm(false);
      setForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
      toast("Task created", "success");
    } else {
      toast("Failed to create task", "error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast("Task deleted", "success");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Tasks" subtitle="Manage your team's work" />
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onTaskClick={() => {}}
            onAddTask={handleAddTask}
          />
        )}
      </div>

      {/* Create Task Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New Task</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Task title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <Input
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent</option>
              </select>
              <Input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={handleCreateTask}>
                  <Plus className="mr-1 h-4 w-4" /> Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
