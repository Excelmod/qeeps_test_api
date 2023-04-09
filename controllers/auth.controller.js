const User = require("../model/User");
const jwt = require("jsonwebtoken");

const refreshAccessToken = async (req, res) => {
	const cookies = req.cookies;
	if (!cookies?.jwt) return res.sendStatus(401);

	const refreshToken = cookies.jwt;

	const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
	if (!foundUser) return res.sendStatus(403);
	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,
		(err, decoded) => {
			if (err || foundUser.email !== decoded.email)
				return res.sendStatus(403);
			const accessToken = jwt.sign(
				{
					UserInfo: {
						id: foundUser._id,
						email: foundUser.email,
						user_type: foundUser.user_type,
					},
				},
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: "1m" }
			);
			res.json({ accessToken });
		}
	);
};

module.exports = { refreshAccessToken };
