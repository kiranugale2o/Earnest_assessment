"use client";
import { Task } from "@/types";
import {
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDeleted: () => void;
  onToggled: () => void;
}

const priorityConfig = {
  low: { label: "Low", class: "bg-green-100 text-green-700" },
  medium: { label: "Medium", class: "bg-yellow-100 text-yellow-700" },
  high: { label: "High", class: "bg-red-100 text-red-700" },
};

const statusConfig = {
  todo: { label: "Todo", icon: Circle, class: "text-gray-400" },
  in_progress: { label: "In Progress", icon: Clock, class: "text-blue-500" },
  done: { label: "Done", icon: CheckCircle2, class: "text-green-500" },
};

export default function TaskCard({
  task,
  onEdit,
  onDeleted,
  onToggled,
}: Props) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success("Task deleted");
      onDeleted();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleToggle = async () => {
    try {
      await api.patch(`/tasks/${task.id}/toggle`);
      onToggled();
    } catch {
      toast.error("Failed to update task");
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${task.status === "done" ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={handleToggle}
            className={`mt-0.5 flex-shrink-0 ${status.class}`}
          >
            <StatusIcon size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium text-gray-900 text-sm truncate ${task.status === "done" ? "line-through text-gray-400" : ""}`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.class}`}
              >
                {priority.label}
              </span>
              {task.dueDate && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
