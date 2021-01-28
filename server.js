const express = require("express");
const request = require("request");
const qs = require("querystring");
const axios = require("axios");

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
    // const userRes = request.get(
    //     `https://www.patreon.com/api/oauth2/v2/identity?${newData}`,
    //     {
    //         auth: {
    //             bearer: access_token,
    //         },
    //     },
    //     (err, response, body) => {
    //         //Posting to JSONBase API
    //         const baseData = {};
    //         baseData[discordID] = body.data;
    //         console.log(baseData);
    //         let baseRes = request({
    //             url: `https://jsonbase.com/PorygonBot/patreon-user`,
    //             method: "PUT",
    //             headers: { "content-type": "application/json" },
    //             body: JSON.stringify(baseData),
    //         });

    //         res.send("Done! You may now go back to Discord.");
    //     }
    // );

    axios({
        url: `https://www.patreon.com/api/oauth2/v2/identity?${newData}`,
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}` },
    })
        .then((userRes) => {
            //Posting to JSONBase API
            const baseData = {};
            baseData[discordID] = body.data;
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
        `This is <a href="https://github.com/PorygonBot/kills-site">PorygonBot/kills-site</a> 's home for kills histories.`
    );
});

//When bot posts
app.post("/:id", async (req, res) => {
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
app.get("/:id", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
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
