const prisma = require("../config/prisma");

const validStatuses = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED"
];

const validPriorities = [
    "LOW",
    "MEDIUM",
    "HIGH"
];
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            dueDate
        } = req.body;

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        // Check required field
        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        // Get logged-in user's ID from JWT
        const userId = req.user.userId;

        // Create task
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
                userId
            }
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create task"
        });
    }
};
    const getTasks = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { status, priority, page = 1, limit = 10 } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const skip = (pageNumber - 1) * limitNumber;

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                message: "Page must be a positive number"
            });
        }

        if (
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                message: "Limit must be between 1 and 100"
            });
        }

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        const tasks = await prisma.task.findMany({
            where: {
                userId: userId,

                ...(status && {
                    status: status
                }),

                ...(priority && {
                    priority: priority
                })
            },

            skip: skip,

            take: limitNumber,

            orderBy: {
                createdAt: "desc"
            }
        });

        // IMPORTANT: successful response goes HERE
        res.status(200).json({
            message: "Tasks fetched successfully",
            page: pageNumber,
            limit: limitNumber,
            tasks
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const taskId = Number(req.params.id);

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId: userId
            }
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task fetched successfully",
            task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch task"
        });
    }
};
const updateTask = async (req, res) => {
    try {
        const userId = req.user.userId;
        const taskId = Number(req.params.id);

        const {
            title,
            description,
            status,
            priority,
            dueDate
        } = req.body;

        // Check whether the task belongs to the logged-in user
        const existingTask = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId: userId
            }
        });

        if (!existingTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Update only the fields that were provided
        const task = await prisma.task.update({
            where: {
                id: taskId
            },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(status !== undefined && { status }),
                ...(priority !== undefined && { priority }),
                ...(dueDate !== undefined && {
                    dueDate: dueDate ? new Date(dueDate) : null
                })
            }
        });

        res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update task"
        });
    }
};
const deleteTask = async (req, res) => {
    try {
        const userId = req.user.userId;
        const taskId = Number(req.params.id);

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId: userId
            }
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        await prisma.task.delete({
            where: {
                id: taskId
            }
        });

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete task"
        });
    }
};
module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};