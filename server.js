const express = require('express');
const fs = require("fs");

let app = express();

app.use(express.text());

app.get('/', function (req, res) {
	res.send(`This is <a href="https://github.com/PorygonBot/kills-site">PorygonBot/kills-site</a> 's home.`);
});

app.post('/:id', (req, res) => {
    let messages = JSON.parse(fs.readFileSync("messages.json"));
    messages[req.params.id] = req.body;
    fs.writeFileSync("messages.json", JSON.stringify(messages));
    res.send({status: 200, id: req.params.id});
});
app.get("/:id", (req, res) => {
    let messages = JSON.parse(fs.readFileSync("messages.json"));
    res.send(messages[req.params.id]);
})

app.listen(process.env.PORT);
