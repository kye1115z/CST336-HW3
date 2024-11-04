import express from "express";
const planets = (await import("npm-solarsystem")).default;
const ACCESS_KEY = "LZTg9NbqauEpUq14vj8GhthqOF3aXTcqYqf2_UfB2_s";
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.get("/", async (req, res) => {
  res.render("home");
});

app.post("/country", (req, res) => {
  const countryName = req.body.country;
  console.log("Country received: ", countryName);
  res.redirect(`/country/${encodeURIComponent(countryName)}`);
});

app.listen(10040, () => {
  console.log("server started");
});
