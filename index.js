import axios from "axios";
import admZip from "adm-zip";
import csv from "csvtojson";
import fs from "fs";

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
    let zippedFile = await getFile(
      "http://www.atlantapd.org/Home/ShowDocument?id=2646"
    );
    zippedFile = zippedFile.data;
    let zip = new admZip(zippedFile);
    await zip.extractEntryTo("COBRA-2019.csv", "./rawdata", true, true);
    const jsonArray = await csv().fromFile("./rawdata/COBRA-2019.csv");
    const cleanJSON = await cleanData(jsonArray);
    await fs.writeFile(
      "./json/COBRA-2019.json",
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
