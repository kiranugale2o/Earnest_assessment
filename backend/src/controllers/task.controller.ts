import { Response } from "express";
import { AppDataSource } from "../data-source";
import { Task, TaskStatus } from "../entities/Task";
import { AuthRequest } from "../middleware/auth.middleware";
import { ILike } from "typeorm";

const taskRepo = () => AppDataSource.getRepository(Task);

export const getTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.userId!;
  const { status, search, page = "1", limit = "10" } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { userId };
  if (status) where.status = status;
  if (search) where.title = ILike(`%${search}%`);

  const [tasks, total] = await taskRepo().findAndCount({
    where,
    order: { createdAt: "DESC" },
    skip,
    take: limitNum,
  });

  res.json({
    tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const task = await taskRepo().findOne({
    where: { id: req.params.id, userId: req.userId! },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.json(task);
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { title, description, priority, dueDate } = req.body;

  if (!title) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  const task = taskRepo().create({
    title,
    description,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
    userId: req.userId!,
  });

  await taskRepo().save(task);
  res.status(201).json(task);
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const task = await taskRepo().findOne({
    where: { id: req.params.id, userId: req.userId! },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const { title, description, status, priority, dueDate } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

  await taskRepo().save(task);
  res.json(task);
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const task = await taskRepo().findOne({
    where: { id: req.params.id, userId: req.userId! },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  await taskRepo().remove(task);
  res.json({ message: "Task deleted successfully" });
};

export const toggleTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const task = await taskRepo().findOne({
    where: { id: req.params.id, userId: req.userId! },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  task.status =
    task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;

  await taskRepo().save(task);
  res.json(task);
};
