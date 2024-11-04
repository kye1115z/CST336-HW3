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
  const countryId = req.body.country;
  res.redirect(`/country/${encodeURIComponent(countryId)}`);
});

app.get("/country/:countryId?", async (req, res) => {
  const countryId = req.params.countryId;

  try {
    // get all of the countries
    const countries = await fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) =>
        data
          .map((country) => ({
            name: country.name.common,
            cca2: country.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

    const defaultCountry =
      countries.find((country) => country.cca2 === countryId) ||
      countries.find((country) => country.cca2 === "US");

    const countryDetails = await fetch(
      `https://restcountries.com/v3.1/alpha/${defaultCountry.cca2}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (!data || !data[0]) {
          throw new Error("Country data is not available");
        }

        const countryData = data[0];

        return {
          name: countryData.name.common,
          cca2: countryData.cca2,
          capital: countryData.capital ? countryData.capital[0] : "N/A",
          area: countryData.area,
          population: countryData.population,
          languages: countryData.languages
            ? Object.values(countryData.languages).join(", ")
            : "N/A",
          currencies: countryData.currencies
            ? Object.values(countryData.currencies)
                .map((curr) => `${curr.name} (${curr.symbol})`)
                .join(", ")
            : "N/A",
          maps: countryData.maps ? countryData.maps.googleMaps : "N/A",
          flag: countryData.flags ? countryData.flags.svg : "N/A",
        };
      });

    console.log(countryDetails);

    res.render("country", { defaultCountry, countries, countryDetails });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).send("Error fetching countries");
  }
});

app.listen(10040, () => {
  console.log("server started");
});
