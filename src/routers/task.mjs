import express from "express";
import Task from "../models/task.mjs";
import auth from "../middleware/auth.mjs";

const router = new express.Router();
// TASK create
const taskCreate = router.post("/tasks", auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user._id,
	});
	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

// TASK find all of the authenticated user
const taskFindAll = router.get("/tasks", auth, async (req, res) => {
	const match = {};

	if (req.query.completed) {
		match.completed = req.query.completed === "true"; // /tasks?completed=true
	}

	const sort = {};
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(":"); // /tasks?sortBy=createdAt:desc
		sort[parts[0]] = parts[1] === "desc" ? -1 : 1; // 1 = ascending, -1 = descending, for mongoose
		// console.log(sort); // { createdAt: 1 }
	}

	try {
		const user = req.user;
		await user.populate([
			{
				path: "tasks",
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip), // /tasks?limit=3&skip=6
					sort,
				},
			},
		]);
		res.status(200).send(user.tasks);
	} catch (e) {
		res.status(500).send(e);
	}
});

// TASK find one
const taskFindOne = router.get("/tasks/:id", auth, async (req, res) => {
	const _id = req.params.id;
	if (_id.length !== 24) {
		return res.status(404).send("Task ID must be 24 characters long");
	}

	try {
		// const task = await Task.findById(_id); // mongoose automatically converts string id into object id
		// convert above to fetching a task the authenticated user actually owns
		const task = await Task.findOne({ _id, owner: req.user._id });
		if (!task) {
			return res.status(404).send("Task not found");
		}
		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

// TASK update own (single task)
const taskUpdateOwn = router.patch("/tasks/:id", auth, async (req, res) => {
	const _id = req.params.id;

	const updates = Object.keys(req.body);
	const allowedUpdates = ["description", "completed"];
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send({ error: "Invalid updates!" });
	}

	try {
		const task = await Task.findOne({ _id, owner: req.user._id });

		if (!task) {
			return res.status(404).send("Task not found");
		}
		updates.forEach((update) => (task[update] = req.body[update]));
		await task.save();
		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

// TASK delete one
const taskDeleteOne = router.delete("/tasks/:id", auth, async (req, res) => {
	const _id = req.params.id;
	if (_id.length !== 24) {
		return res.status(404).send("Task ID must be 24 characters long");
	}

	try {
		const task = await Task.findOneAndDelete({ _id, owner: req.user._id }); // mongoose automatically converts string id into object id
		if (!task) {
			return res.status(404).send("Task not found");
		}
		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

export { taskCreate, taskFindAll, taskFindOne, taskUpdateOwn, taskDeleteOne };
