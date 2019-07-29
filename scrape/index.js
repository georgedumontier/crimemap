// Handlesthe scraping and parsing of the data. Look at the go() function to see where this all gets started.

import axios from "axios"; // axios is how I sent the request for the atlanta PD webpage
import admZip from "adm-zip"; // adm-zip unzips the csv
import csv from "csvtojson"; // converts the unzipped csv to json
import fs from "fs"; //  built-in node library for saving files
import cheerio from "cheerio"; // cheerio is a library that makes navigating raw html much easier

// the current year is important for grabbing the right file from the website.
let thisYear = new Date().getFullYear();

async function getUrl() {
  try {
    // Uses axios to request the webpage where our data lives
    let webpage = await axios.get(
      "http://www.atlantapd.org/i-want-to/crime-data-downloads"
    );
    let html = webpage.data;

    // Cheerio provides methods for navigatin a raw html page
    const $ = cheerio.load(html);
    let links = $(html).find("a.content_link"); //find all the links with class 'content_link'
    let myLink = null;
    // loop through the links and find the one called 'COBRA-2019' or whatever the current year is
    let objectKeys = Object.keys(links);
    for (let key in objectKeys) {
      if (
        $(links[key])
          .text()
          .startsWith(`COBRA-${thisYear}`)
      ) {
        myLink = links[key];
        break;
      }
    }
    // Return the href attached to that link to get the actual link to the csv
    return `http://www.atlantapd.org${$(myLink).attr("href")}`;
  } catch (err) {
    console.error(err);
  }
}

// A second request that grabs the actual csv file
async function getFile(file) {
  try {
    let zippedFile = axios.get(file, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/zip",
        ContentType: "multipart/form-data"
      }
    });
    return zippedFile;
  } catch (err) {
    console.error(err);
  }
}

async function cleanData(jsonArray) {
  let newArray = jsonArray.map(object => {
    let newObject = {};
    newObject.latitude = object["Latitude"];
    newObject.longitude = object["Longitude"];
    newObject.UCRliteral = object["UCR Literal"];
    newObject.location = object["Location"];
    newObject.occurDate = object["Occur Date"];
    return newObject;
  });
  return newArray;
}

async function go() {
  try {
    let url = await getUrl(); // get the url of csv file
    let zippedFile = await getFile(url); // grab the actual zipped csv file
    //unizp the file
    zippedFile = zippedFile.data;
    let zip = new admZip(zippedFile);
    await zip.extractEntryTo("COBRA-2019.csv", "./rawdata", true, true);
    const jsonArray = await csv().fromFile("./rawdata/COBRA-2019.csv"); // convert to json
    const cleanJSON = await cleanData(jsonArray); //clean up data
    // save the fresh data
    await fs.writeFile(
      `./map/COBRA-${thisYear}.json`,
      JSON.stringify(cleanJSON),
      err => {
        if (err) {
          console.error(err);
        }
      }
    );
  } catch (err) {
    console.error(err);
  }
}
// this kicks it all off
go();
