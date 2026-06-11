"use client";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { Avatar } from "@/components/ui/misc";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: Status) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

const columns: { id: Status; label: string; color: string }[] = [
  { id: "TODO", label: "To Do", color: "border-gray-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-blue-500" },
  { id: "DONE", label: "Done", color: "border-green-500" },
];

const priorityStyles: Record<Priority, string> = {
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "danger",
  URGENT: "danger",
};

export function KanbanBoard({ tasks, onStatusChange, onTaskClick, onAddTask }: KanbanBoardProps) {
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDrop = (status: Status) => {
    if (dragging) {
      onStatusChange(dragging, status);
      setDragging(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id}
            className={cn("rounded-xl border-t-4 bg-gray-50 dark:bg-gray-800/50 min-h-[400px] p-3", col.color)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">{col.label}</h3>
                <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {colTasks.length}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddTask(col.id)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {colTasks.map((task) => (
                <Card key={task.id}
                  draggable
                  onDragStart={() => setDragging(task.id)}
                  onDragEnd={() => setDragging(null)}
                  className={cn("cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
                    dragging === task.id && "opacity-50")}
                  onClick={() => onTaskClick(task)}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{task.title}</p>
                      <Badge variant={priorityStyles[task.priority] as any} className="shrink-0 text-[10px]">
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.dueDate), "MMM d")}
                        </div>
                      )}
                      {task.assignee && (
                        <Avatar src={task.assignee.image} name={task.assignee.name || ""} size="sm" className="ml-auto" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
