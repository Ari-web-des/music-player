import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const clientId = "YOUR_CLIENT_ID";
const clientSecret = "YOUR_CLIENT_SECRET";
const redirectUri = "http://localhost:3000/callback";

// Step 1: Login URL
app.get("/login", (req, res) => {
  const scope = "user-top-read playlist-modify-private";
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scope)}`;
  res.redirect(authUrl);
});

// Step 2: Callback (exchange code for tokens)
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });
  const data = await response.json();
  // data contains { access_token, refresh_token, expires_in }
  res.json(data);
});

// Step 3: Refresh token
app.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  const data = await response.json();
  res.json(data); // { access_token, expires_in }
});

app.listen(4000, () =>
  console.log("Server running on http://localhost:4000")
);
