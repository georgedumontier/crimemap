const mymap = L.map("mapid").setView([33.749, -84.388], 13);
// const data = require("../scrape/json/COBRA-2019.json");

L.tileLayer(
  "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken:
      "pk.eyJ1IjoiZ2VvcmdlZHVtb250aWVyIiwiYSI6ImNqdnBpbjkxNzI5OWM0M211amVkaHFoZncifQ.8ZUHKNHHj7tm9UuMvZZigg"
  }
).addTo(mymap);

function addMarkers(json) {
  json.forEach((object, i) => {
    let marker = L.marker([object.latitude, object.longitude]).addTo(mymap);
    marker.bindPopup(
      `<p>${object.occurDate}</p><p>${object.location}</p><p>${
        object.UCRliteral
      }</p>`
    ).openPopup;
  });
}

async function getData() {
  const data = await fetch("../json/COBRA-2019.json");
  const json = await data.json();
  addMarkers(json);
}
getData();
