import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
	{
		description: {
			type: String,
			required: true,
			trim: true,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User", // create reference to User model
		},
	},
	{
		timestamps: true,
	}
);

// setup task model
const Task = mongoose.model("Task", taskSchema);

export default Task;
