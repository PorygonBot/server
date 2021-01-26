const express = require("express");
const patreon = require("patreon");
const request = require("request");

const patreonAPI = patreon.patreon;
const patreonOAuth = patreon.oauth;
const patreonOAuthClient = patreonOAuth(
	process.env.PATREON_CLIENT_ID,
	process.env.PATREON_CLIENT_SECRET
);
//Redirect for Patreon OAuth
app.get("/patreon-redirect", async (req, res) => {
	const code = req.query.code;
	const discordID = req.query.state;

	console.log("I'm here 1!");

	await patreonOAuthClient
		.getTokens(code, "https://kills.porygonbot.xyz/patreon-redirect")
		.then(async (response) => {
			console.log("I'm here 2!");

			const patreonAPIClient = patreonAPI(response.access_token);
			return patreonAPIClient("/current_user");
		})
		.then(async (result) => {
			console.log("I'm here 3!");

			const store = result.store;
			const user = store.findAll("user").map((user) => user.serialize());
			let newData = {};
			newData[discordID] = user;

			let response = await request({
				url: `https://jsonbase.com/PorygonBot/patreon-user`,
				method: "PUT",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(newData),
			});

			res.end("Done, baby!");
		})
		.catch((err) => {
			console.log("I'm here error!");
			console.error(err);
			res.end(err);
		});
});

let app = express();

app.use(express.text());

app.get("/", (req, res) => {
	res.send(
		`This is <a href="https://github.com/PorygonBot/kills-site">PorygonBot/kills-site</a> 's home.`
	);
});


app.post("/:id", async (req, res) => {
	let response = await request({
		url: `https://jsonbase.com/PorygonBot/${req.params.id}`,
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ msg: req.body }),
	});
	res.send({ status: 200, id: req.params.id });
});

app.get("/:id", async (req, res) => {
	if (req.params.id !== "favicon.ico") {
		let message = request.get(
			`https://jsonbase.com/PorygonBot/${req.params.id}`,
			(err, response, body) => {
				res.send(JSON.parse(body).msg);
			}
		);
	}
});

app.listen(process.env.PORT);
