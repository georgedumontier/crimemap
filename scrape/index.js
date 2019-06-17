import axios from "axios";
import admZip from "adm-zip";
import csv from "csvtojson";
import fs from "fs";
import cheerio from "cheerio";

let thisYear = new Date().getFullYear();

async function getUrl() {
  try {
    let webpage = await axios.get(
      "http://www.atlantapd.org/i-want-to/crime-data-downloads"
    );
    // console.log(webpage.data);
    let html = webpage.data;
    const $ = cheerio.load(html);
    let links = $(html).find("a.content_link");
    let myLink = null;
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
    return `http://www.atlantapd.org${$(myLink).attr("href")}`;
  } catch (err) {
    console.error(err);
  }
}

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
    // let UCRliteral = object["UCR Literal"];
    // newObject[UCRliteral] = {};
    // newObject[UCRliteral].latitude = object.Latitude;
    // newObject[UCRliteral].longitude = object.Longitude;
    // newObject[UCRliteral].location = object.Location;
    // newObject[UCRliteral].occurDate = object["Occur Date"];
    // newObject[UCRliteral].UCRliteral = object["UCR Literal"];
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
    let url = await getUrl();
    let zippedFile = await getFile(url);
    zippedFile = zippedFile.data;
    let zip = new admZip(zippedFile);
    await zip.extractEntryTo("COBRA-2019.csv", "./rawdata", true, true);
    const jsonArray = await csv().fromFile("./rawdata/COBRA-2019.csv");
    const cleanJSON = await cleanData(jsonArray);
    await fs.writeFile(
      `./scrape/json/COBRA-${thisYear}.json`,
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

go();
