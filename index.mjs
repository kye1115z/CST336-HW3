import express from "express";
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.render("home");
});

app.post("/country", (req, res) => {
  const countryName = req.body.country;
  res.redirect(`/country/${encodeURIComponent(countryName)}`);
});

app.get("/country/:countryName", (req, res) => {
  const { countryName } = req.params;
  res.render("country", { countryName });
});

app.listen(10040, () => {
  console.log("server started");
});
