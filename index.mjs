import express from "express";
import fetch from "node-fetch";
import { calculateTimeDifference } from "./timeUtils.mjs";

const UNSPLASH_ACCESS_KEY = `wSRuTGtsXXRrcqNaqhl-TT0ZoB2v6HfmVNZBzdu_IDo`;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// home
app.get("/", async (req, res) => {
  res.render("home");
});

// country info
app.post("/country", (req, res) => {
  const countryId = req.body.country;
  res.redirect(`/country/${encodeURIComponent(countryId)}`);
});

app.get("/country/:countryId?", async (req, res) => {
  const countryId = req.params.countryId;

  try {
    // get all of the countries
    const countries = await fetchCountries();

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

// timezone
app.get("/timezone", async (req, res) => {
  const countryId1 = req.query.countryId1 || "America/Los_Angeles";
  const countryId2 = req.query.countryId2 || "Asia/Seoul";

  try {
    const [timeData1, timeData2] = await Promise.all([
      fetch(`http://worldtimeapi.org/api/timezone/${countryId1}`).then((res) =>
        res.json()
      ),
      fetch(`http://worldtimeapi.org/api/timezone/${countryId2}`).then((res) =>
        res.json()
      ),
    ]);

    const utcOffset1 = timeData1.utc_offset;
    const utcOffset2 = timeData2.utc_offset;

    const timeDifference = calculateTimeDifference(utcOffset1, utcOffset2);

    const date1 = new Date(timeData1.datetime);
    const date2 = new Date(timeData2.datetime);

    const localDate1 = new Date(
      date1.getTime() + parseInt(utcOffset1) * 3600 * 1000
    );
    const localDate2 = new Date(
      date2.getTime() + parseInt(utcOffset2) * 3600 * 1000
    );

    const formattedTime1 = date1.toTimeString().split(" ")[0];
    const formattedTime2 = date2.toTimeString().split(" ")[0];

    const regions = await fetch("http://worldtimeapi.org/api/timezone").then(
      (res) => res.json()
    );

    res.render("timezone", {
      regions,
      countryId1,
      countryId2,
      utcOffset1,
      utcOffset2,
      formattedTime1,
      formattedTime2,
      timeData1,
      timeData2,
      timeDifference,
      localDate1: localDate1.toLocaleDateString(),
      localDate2: localDate2.toLocaleDateString(),
    });
  } catch (error) {
    console.error("Error fetching timezone data:", error);
    res.status(500).send("Error fetching timezone data");
  }
});

app.get("/random-landscapes", async (req, res) => {
  const response = await fetch(
    `https://api.unsplash.com/photos/random?count=6&query=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  const data = await response.json();

  const images = data.map((image) => ({
    id: image.id,
    description: image.alt_description,
    url: image.urls.full,
  }));

  res.render("landscapes", { images });
});

app.listen(10040, () => {
  console.log("server started");
});

const getTime = async (timeZone) => {
  const response = await fetch(
    `https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(
      timeZone
    )}`
  );
  const data = await response.json();
  console.log(data);
  return data;
};

// Function to fetch all countries
const fetchCountries = async () => {
  const response = await fetch("https://restcountries.com/v3.1/all");
  const data = await response.json();
  return data
    .map((country) => ({
      name: country.name.common,
      cca2: country.cca2,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
