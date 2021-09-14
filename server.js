const express = require("express");
const request = require("request");
const qs = require("querystring");
const axios = require("axios");
require("dotenv").config();

let app = express();

app.use(express.text());

//Redirect for Patreon OAuth
app.get("/patreon-redirect", async (req, res) => {
    const code = req.query.code;
    const discordID = req.query.state;

    //Exchange Token
    const data = qs.stringify({
        code: code,
        grant_type: "authorization_code",
        client_id: process.env.PATREON_CLIENT_ID,
        client_secret: process.env.PATREON_CLIENT_SECRET,
        redirect_uri: "https://kills.porygonbot.xyz/patreon-redirect",
    });
    const newRes = await axios.post(
        `https://www.patreon.com/api/oauth2/token?${data}`,
        { headers: { "Content-Type": "application/x-www-form-url" } }
    );
    const access_token = newRes.data.access_token;

    //Making the Patreon request
    const newData = qs.stringify({
        fields: { member: "patron_status", user: "full_name" },
        include: "memberships",
    });

    axios({
        url: `https://www.patreon.com/api/oauth2/v2/identity?${newData}`,
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}` },
    })
        .then((userRes) => {
            //Posting to JSONBase API
            const baseData = {};
            baseData[discordID] = userRes.data;
            console.log(baseData);
            let baseRes = request({
                url: `https://jsonbase.com/PorygonBot/patreon-user`,
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(baseData),
            });

            res.send("Done! You may now go back to Discord.");
        })
        .catch((e) => {
            console.error(e);
        });
});

//Home page
app.get("/", function (req, res) {
    res.send(
        `This is <a href="https://github.com/PorygonBot/server">Porygon's general-purpose webserver</a>.`
    );
});

//When bot posts
app.post("/kills/:id", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    let response = request({
        url: `https://jsonbase.com/PorygonBot/${req.params.id}`,
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ msg: req.body }),
    });
    res.send({ status: 200, id: req.params.id });
});

//When people get
app.get("/kills/:id", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    //Sending te message
    if (req.params.id !== "favicon.ico") {
        let message = request.get(
            `https://jsonbase.com/PorygonBot/${req.params.id}`,
            (err, response, body) => {
                if (!body.startsWith("<")) {
                    //Separating each part of the history
                    const history = JSON.parse(body).msg.split("<br>");
                    let kills = history.filter((line) =>
                        line.includes("was killed by")
                    );
                    let crits = history.filter((line) =>
                        line.includes("critical hit")
                    );
                    let misses = history.filter((line) =>
                        line.includes("missed")
                    );
                    let statuses = history.filter((line) =>
                        line.includes("caused")
                    );
                    let hazards = history.filter(
                        (line) =>
                            line.includes("Stealth Rock") ||
                            line.includes("Spikes")
                    );
                    let other = history.filter(
                        (line) =>
                            !(
                                kills.includes(line) ||
                                crits.includes(line) ||
                                misses.includes(line) ||
                                statuses.includes(line) ||
                                hazards.includes(line)
                            )
                    );

                    //Making the message
                    const message = `
                    <strong>Kills</strong>
                    <br>
                    ${kills.join("<br>")}
                    <br>
                    <br>
                    <strong>Critical Hits</strong>
                    <br>
                    ${crits.join("<br>")}
                    <br>
                    <br>
                    <strong>Misses</strong>
                    <br>
                    ${misses.join("<br>")}
                    <br>
                    <br>
                    <strong>Statuses</strong>
                    <br>
                    ${statuses.join("<br>")}
                    <br>
                    <br>
                    <strong>Hazards</strong>
                    <br>
                    ${hazards.join("<br>")}
                    <br>
                    <br>
                    <strong>Other</strong>
                    <br>
                    ${other.join("<br>")}
                `;
                    res.send(message);
                }
            }
        );
    }
});

app.listen(process.env.PORT);
