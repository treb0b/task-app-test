const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task.mjs");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true, //unique email entry with index
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Please enter a valid email!");
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 7,
			validate(value) {
				if (value.toLowerCase().includes("password")) {
					throw new Error("Your password cannot contain 'password'");
				}
			},
		},
		age: {
			type: Number,
			default: 0,
			validate(value) {
				if (value < 0) {
					throw new Error("Age must be a positive number");
				}
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		avatar: {
			type: Buffer,
		},
	},
	{
		timestamps: true,
	}
);

// virtual property to setup a user -> tasks relationship
// virutal properties are not stored in db, only in mongoose
userSchema.virtual("tasks", {
	ref: "Task",
	localField: "_id",
	foreignField: "owner",
});

// middleware, there is also userSchema.post(), for both post and update the password is hashed upon user model save

// Hash plain text password before saving
userSchema.pre("save", async function (next) {
	const user = this;

	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	// console.log("just before saving");

	next();
});

// this binding with explicit function () call, this is a method that operates on User INSTANCE
// this is a trick with JSON.stringify()
userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.avatar;

	return userObject;
};

// we need "this" binding, hence standard "function" keyword, methods are on INSTANCE
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign(
		{ _id: user._id.toString() },
		process.env.JWT_SECRET
	);

	// add token to db
	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
};

// statics are on entire User SCHEMA
userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error("Unable to login!");
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		throw new Error("Unable to login!");
	}

	return user;
};

// cascade delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
	const user = this;
	await Task.deleteMany({ owner: user._id });
	next();
});

// setup user model
const User = mongoose.model("User", userSchema);

module.exports = User;
