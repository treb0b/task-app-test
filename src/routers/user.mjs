import express from "express";
import multer from "multer";
import sharp from "sharp";
import User from "../models/user.mjs";
import auth from "../middleware/auth.mjs";
import { sendWelcomeEmail, sendGoodbyeEmail } from "../emails/account.mjs";

const router = new express.Router();
// USER create
const userCreate = router.post("/users", async (req, res) => {
	const user = new User(req.body);
	// already assign logged in status
	const token = await user.generateAuthToken();

	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		res.status(201).send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

// USER login
const userLogin = router.post("/users/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password
		);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

// USER own profile
const userProfile = router.get("/users/me", auth, async (req, res) => {
	res.send(req.user);
});

// USER logout (single session)
const userLogoutAll = router.post("/users/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
});

// USER logout (all sessions)
const userLogout = router.post("/users/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
});

// USER update me
const userUpdateOwn = router.patch("/users/me", auth, async (req, res) => {
	const user = req.user;
	const updates = Object.keys(req.body);
	const allowedUpdates = ["name", "email", "password", "age"];
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send({ error: "Invalid updates!" });
	}

	try {
		// user[update] access the property to be updated dynamically
		updates.forEach((update) => (user[update] = req.body[update]));
		await user.save();
		res.status(200).send(user);
	} catch (e) {
		// assuming validation error, the status returned is 400
		res.status(400).send(e);
		// // assuming server error, the status returned is 500
		// res.status(500).send(e);
	}
});

// USER delete own Account (delete only own profile)
const userDeleteAccount = router.delete("/users/me", auth, async (req, res) => {
	const _id = req.user._id;
	try {
		sendGoodbyeEmail(req.user.email, req.user.name);
		await req.user.remove();
		res.status(200).send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});

// USER upload profile
// register multer middleware and the upload folder
const upload = multer({
	// dest: "avatars", // this is the destination folder, by omitting that multer middleware is gonna pass the file to the router function via req.file
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, callback) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return callback(
				new Error("Please upload a jpg/jpeg/png file up to 1MB size")
			);
		}
		callback(undefined, true);
	},
});

const userUploadAvatar = router.post(
	"/users/me/avatar",
	auth,
	upload.single("avatar"), // this is the request, form-data body key
	async (req, res) => {
		// req.user.avatar = req.file.buffer;
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.status(200).send("Profile avatar uploaded");
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

// USER delete own avatar
const userDeleteAvatar = router.delete(
	"/users/me/avatar",
	auth,
	async (req, res) => {
		const _id = req.user._id;
		try {
			req.user.avatar = undefined;
			await req.user.save();
			res.status(200).send("Avatar image deleted");
		} catch (e) {
			res.status(500).send(e);
		}
	}
);

// USER get own avatar
const userProfileAvatar = router.get(
	"/users/:id/avatar",
	// auth,
	async (req, res) => {
		try {
			const user = await User.findById(req.params.id);

			if (!user || !user.avatar) {
				throw new Error();
			}

			res.set("Content-Type", "image/png");
			res.send(user.avatar);
		} catch (e) {
			res.status(404).send();
		}
	}
);

export {
	userCreate,
	userDeleteAccount,
	userDeleteAvatar,
	userProfile,
	userLogout,
	userLogoutAll,
	userUpdateOwn,
	userUploadAvatar,
	userProfileAvatar,
};
