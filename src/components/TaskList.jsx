import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";

export default function TaskList() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
  });

  useEffect(() => {
    console.log("TaskList - Fetching tasks");
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        const data = await response.json();
        console.log("TaskList - Fetched tasks:", data);
        setTasks(data);
        setIsLoading(false);
      } catch (error) {
        console.error("TaskList - Error fetching tasks:", error);
        setError(error);
        setIsLoading(false);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);

  const createTask = async (newTask) => {
    try {
      const response = await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }
      const data = await response.json();
      setTasks([...tasks, data]);
      setNewTask({ title: "", description: "", status: "pending" });
    } catch (error) {
      console.error("TaskList - Error creating task:", error);
      setError(error);
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      const response = await fetch(
        `http://54.213.24.98:8080/api/tasks/${updatedTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTask),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }
      const data = await response.json();
      setTasks(
        tasks.map((task) => (task.id === data.id ? { ...task, ...data } : task))
      );
      setEditingTask(null);
    } catch (error) {
      console.error("TaskList - Error updating task:", error);
      setError(error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `http://54.213.24.98:8080/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("TaskList - Error deleting task:", error);
      setError(error);
    }
  };

  if (error) {
    return (
      <div>
        Error: {error.message}
        <button onClick={() => setError(null)}>Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createTask(newTask);
            }}
            className="flex gap-4"
          >
            <Input
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              placeholder="Task title"
              required
            />
            <Input
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              placeholder="Description"
            />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="pt-6">
              {editingTask?.id === task.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateTask(editingTask);
                  }}
                  className="flex gap-4"
                >
                  <Input
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    required
                  />
                  <Input
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                  />
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, status: e.target.value })
                    }
                    className="border rounded px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Button type="submit">Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingTask(null)}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-gray-600">{task.description}</p>
                    <span className="text-sm text-gray-500">
                      Status: {task.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingTask(task)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
