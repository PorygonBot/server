const express = require('express');
const fetch = require('node-fetch');

let app = express();

app.use(express.text());

app.get('/', function (req, res) {
	res.send(`This is <a href="https://github.com/PorygonBot/kills-site">PorygonBot/kills-site</a> 's home.`);
});

app.post('/:id', async (req, res) => {
    let response = await fetch(`https://jsonbase.com/PorygonBot/${req.params.id}`, {method: "POST", body: req.body});
    res.send({status: 200, id: req.params.id});
});
app.get("/:id", async (req, res) => {
    let message = await fetch(`https://jsonbase.com/PorygonBot/${req.params.id}`);
    res.send(message);
});

app.listen(process.env.PORT);
