require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const request = require("supertest");
const path = require("path");
const img1Url = path.join(__dirname, "..", "img", "house_1.png");
const img2Url = path.join(__dirname, "..", "img", "house_2.png");

const createServer = require("../config/server");
const Agency = require("../models/Agency");

const app = createServer();

describe("Users", () => {
	let access_token1, access_token2, id1, id2;
	let email1 = "testAgency1@email.com";
	let email2 = "testAgency2@email.com";

	let password = "test";

	beforeAll(async () => {
		const connection = await mongoose.connect(globalThis.__MONGO_URI__, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		if (!connection) {
			console.log("we can't connect to the database");
		}
	});

	afterAll(async () => {
		await mongoose.disconnect();
		await mongoose.connection.close();
	});

	it("should create a new agent 1 and send statuscode 201", async () => {
		const res = await request(app).post("/signin/agent").send({
			email: email1,
			password: password,
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body.success).toEqual(
			`New agent with email: ${email1} created!`
		);

		let user = await User.findOne({ email: email1 }).exec();

		expect(user.email).toEqual(email1);
		expect(user.user_type).toEqual("agent");
		id1 = user._id;
	});

	it("should create a new agent 2 and send statuscode 201", async () => {
		const res = await request(app).post("/signin/candidate").send({
			email: email2,
			password: password,
		});
		expect(res.statusCode).toEqual(201);
		expect(res.body.success).toEqual(
			`New candidate with email: ${email2} created!`
		);

		let user = await User.findOne({ email: email2 }).exec();

		expect(user.email).toEqual(email2);
		expect(user.user_type).toEqual("candidate");
		id2 = user._id;
	});

	it("should create a new asset and send statuscode 201", async () => {
		let res = await request(app).post("/auth").send({
			email: email1,
			password: password,
		});
		expect(res.statusCode).toEqual(200);
		expect(res.body.accessToken).toBeDefined();
		access_token1 = res.body.accessToken;
		const name = "A agency";
		res = await request(app)
			.post("/agency")
			.set("Content-Type", "multipart/form-data")
			.set("Authorization", `Bearer ${access_token1}`)
			.field("name", name)
			.attach("logo", img1Url);

		expect(res.statusCode).toEqual(201);

		const id = res.body._id;

		let agency = await Agency.findById(id).exec();

		expect(agency.name).toEqual(name);
	});
});
