import jwt from "jsonwebtoken";
import User from "../models/user.mjs";

const auth = async (req, res, next) => {
	// console.log("auth middleware");
	// next();

	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// findOne() instead of findById()
		const user = await User.findOne({
			_id: decoded._id,
			"tokens.token": token,
		});
		if (!user) {
			throw new Error();
		}

		req.token = token;
		req.user = user;
		next();
		// console.log(token);
	} catch (e) {
		res.status(401).send({ error: "Please authenticate" });
	}
};

export default auth;
