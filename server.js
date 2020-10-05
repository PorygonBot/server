const express = require("express");
const request = require("request");

let app = express();

app.use(express.text());

//Home page
app.get("/", function (req, res) {
	res.send(
		`This is <a href="https://github.com/PorygonBot/kills-site">PorygonBot/kills-site</a> 's home for kills histories.`
	);
});

//When bot posts
app.post("/:id", async (req, res) => {
	res.header('Access-Control-Allow-Origin', '*');
	let response = await request({
		url: `https://jsonbase.com/PorygonBot/${req.params.id}`,
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ msg: req.body }),
	});
	res.send({ status: 200, id: req.params.id });
});

//When people get
app.get("/:id", async (req, res) => {
	res.header('Access-Control-Allow-Origin', '*');
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
