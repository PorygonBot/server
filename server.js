const express = require('express');

let app = express();
let message = "";

app.use(express.text());

app.get('/', function (req, res) {
	res.send(`This is <a href="https://github.com/PorygonBot/kills-site">PorygonBot/kills-site</a> 's home.`);
});

app.post('/:id', (req, res) => {
    message = req.body;
    res.send({status: 200, id: req.params.id});
});
app.get("/:id", (req, res) => {
    res.send(message);
})

app.listen(process.env.PORT);
