const express = require('express');

let app = express();
let message = "";

app.use(express.text());

app.get('/', function (req, res) {
	res.send("");
});

app.post('/:id', (req, res) => {
    message = req.body;
    res.send({status: 200, id: req.params.id});
});
app.get("/:id", (req, res) => {
    res.send(message);
})

app.listen(3000);
