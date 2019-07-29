import regeneratorRuntime from "regenerator-runtime"; //babel needs this
import leaflet from "leaflet"; //mapping library with lots of useful methods
import * as d3 from "d3"; //library that links svg elements to large datasets

// browserify lets you make your own modules and import them where needed
import addMarkers from "./modules/AddMarkers";
import handleFilters from "./modules/HandleFilters";
import map from "./modules/Map.js";

const { mymap } = map; //grab the map itself see the Map.js module for more info

//add map tiles. It's using the Stamen Designs toner map right now. These are free to use!
L.tileLayer(
  // "https://api.tiles.mapbox.com/styles/mapbox/streets-v11/{z}/{x}/{y}.png?access_token={accessToken}",
  // "https://api.mapbox.com/styles/v1/georgedumontier/cjw9i8dg505h71cnui04lw1dz/tiles/{z}/{x}/{y}?access_token={accessToken}",
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",

  //"https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    //These attributions are required by law. Don't delete them.
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Map tiles by <a href="https://stamen.com/">Stamen Design</a> under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.',
    //'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken:
      "pk.eyJ1IjoiZ2VvcmdlZHVtb250aWVyIiwiYSI6ImNqdnBpbjkxNzI5OWM0M211amVkaHFoZncifQ.8ZUHKNHHj7tm9UuMvZZigg"
  }
).addTo(mymap);

//initialize by position the svg overlay and adding the markers. See /modules/AddMarkers.js for more info.
addMarkers();

//address searching stuff --(not working)--
/*let addressSearchBar = document.querySelector(".filterByAddress");
let waitASec = false;
let startTimer = () => {
  waitASec = true;
  setTimeout(function() {
    waitASec = false;
  }, 500);
};
addressSearchBar.addEventListener("click", function() {
  console.log("click");
  if (waitASec) {
    return false;
  } else {
    console.log("starting timer");
    startTimer();
  }
});
let sendAddressQuery = async function() {
  let query = addressSearchBar.value;
  let response = await fetch(
    `https://nominatim.openstreetmap.org/search/${query} ATLANTA?format=json`
  );
  response = await response.json();

  console.log(response);
};
addressSearchBar.addEventListener("keyup", function() {
  if (waitASec) {
    return false;
  } else {
    console.log("send a request");
    sendAddressQuery();
    startTimer();
  }
});
let handleAddressFilter = () => {
  let addressInput = document.querySelector(".filterByAddress");
  let addressInputValue = addressInput.value;
  goGetResults(addressInputValue);
};*/

// the rest is just event listeners

//handle check box clicks to update data
let handleCrimeFilters = cb => {
  handleFilters.crimes.updateChecked(cb);
  addMarkers();
};

//crime filter event listener
let crimeFilters = document.querySelectorAll(".crimeFilter");
Array.from(crimeFilters).forEach(function(element) {
  element.addEventListener("click", function() {
    handleCrimeFilters(element);
  });
});

//let dateSelector = document.querySelector(".dateSelector");
let filterByDate = document.querySelector(".filterByDate");
filterByDate.addEventListener("change", function(element) {
  handleFilters.dates.updateDates(element.currentTarget.value);
  addMarkers();
});

//custom date range functions
let fromDatePicker = document.querySelector(".dateSelectorFrom");
fromDatePicker.addEventListener("change", function(element) {
  handleFilters.dates.changeFromRange(element.currentTarget.value);
  addMarkers();
});

// date picker event listener
let toDatePicker = document.querySelector(".dateSelectorTo");
toDatePicker.addEventListener("change", function(element) {
  handleFilters.dates.changeToRange(element.currentTarget.value);
  addMarkers();
});

// legend event listeners
let legend = document.querySelector("#key");
let filterButton = document.querySelector("#key h4");
let caret = document.querySelector(".caret");
filterButton.addEventListener("click", () => {
  legend.classList.toggle("open");
  caret.classList.toggle("caret-close");
});
