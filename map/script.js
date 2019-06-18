const mymap = L.map("mapid").setView([33.749, -84.388], 13);
console.log(new Date(new Date().setDate(new Date().getDate() - 10000)));
// console.log(new Date(new Date("02-04-1992").getDate() + 10000));
console.log(
  new Date(
    new Date("02-04-1992").setDate(new Date("02-04-1992").getDate() + 10000)
  )
);

let data = null;
let div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
let checked = ["LARCENY-NON VEHICLE"];
let justMoved = false;

L.tileLayer(
  // "https://api.tiles.mapbox.com/styles/mapbox/streets-v11/{z}/{x}/{y}.png?access_token={accessToken}",
  // "https://api.mapbox.com/styles/v1/georgedumontier/cjw9i8dg505h71cnui04lw1dz/tiles/{z}/{x}/{y}?access_token={accessToken}",
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",

  //"https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Map tiles by <a href="https://stamen.com/">Stamen Design</a> under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.',
    //'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken:
      "pk.eyJ1IjoiZ2VvcmdlZHVtb250aWVyIiwiYSI6ImNqdnBpbjkxNzI5OWM0M211amVkaHFoZncifQ.8ZUHKNHHj7tm9UuMvZZigg"
  }
).addTo(mymap);
// const layer = new L.StamenTileLayer("toner");
// mymap.addLayer(L.StamenTileLayer("toner", { detectRetina: true }));

let svg = d3
  .select(mymap.getPanes().overlayPane)
  .append("svg")
  .attr("id", "leaflet-overlay");

//address search setup with leaflet-geosearch
let leafletGeosearch = require("leaflet-geosearch");
let OpenStreetMapProvider = leafletGeosearch.OpenStreetMapProvider;
const provider = new OpenStreetMapProvider();
const searchControl = leafletGeosearch.GeoSearchControl({ provider: provider });
mymap.addControl(searchControl);
let goGetResults = async function(input) {
  const results = await provider.search({ query: `${input} ATLANTA, GEORGIA` });
  console.log(results);
  let coords = [results[0].y, results[0].x];
  console.log(coords);

  mymap.setView(coords);
  return results;
};
window.handleAddressFilter = () => {
  let addressInput = document.querySelector(".filterByAddress");
  let addressInputValue = addressInput.value;
  //validate input

  console.log(addressInputValue);
  goGetResults(addressInputValue);
};

let crimeDots = svg.append("g").attr("class", "leaflet-zoom-hide");

async function addMarkers() {
  try {
    data = await d3.json("COBRA-2019.json");

    //filter data based on the checked array
    data = data.filter(d => {
      return checked.includes(d.UCRliteral);
    });

    //filter data based on date
    data = data.filter(d => {
      return (
        moment(d.occurDate)
          .tz("America/New_York")
          .isSameOrAfter(dateRange[0], "day") &&
        moment(d.occurDate)
          .tz("America/New_York")
          .isSameOrBefore(dateRange[1], "day")
      );
    });

    //give the data a Leaflet.js-friendly LatLng object
    data.forEach(object => {
      object.LatLng = new L.LatLng(object.latitude, object.longitude);
    });

    let circles = crimeDots.selectAll("circle").data(data);
    let colors = {
      "LARCENY-FROM VEHICLE": "#e41a1c",
      "LARCENY-NON VEHICLE": "#377eb8",
      "ROBBERY-PEDESTRIAN": "#4daf4a",
      "AUTO THEFT": "#984ea3",
      "AGG ASSAULT": "#ff7f00",
      "ROBBERY-COMMERCIAL": "#ffd92f",
      "ROBBERY-RESIDENCE": "#a65628",
      "BURGLARY-RESIDENCE": "#f781bf"
    };

    //hide box when user clicks off circle
    d3.select("#mapid").on("touchend", function() {
      if (justMoved == false) {
        div.style("opacity", 0);
        d3.select(".selected-dot").attr("class", "");
      } else {
        justMoved = false;
      }
    });

    circles
      .enter()
      .append("circle")
      .on("mouseenter", function(d) {
        d3.select(this).attr("class", "selected-dot");
        div
          .transition()
          .duration(100)
          .style("opacity", 1);
        div
          .html(
            `<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
      })
      .on("mouseleave", function(d) {
        d3.select(this).attr("class", "");
        div.style("opacity", 0).style("top", "-500px");
      })
      .on("click touchstart", function(d) {
        d3.select(".selected-dot").attr("class", "");
        d3.select(this).attr("class", "selected-dot");
        div
          .transition()
          .duration(100)
          .style("opacity", 1);
        div
          .html(
            `<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
      });

    d3.selectAll("circle").style("fill", d => {
      return colors[d.UCRliteral];
    });
    circles.exit().remove();

    //reposition map when zoomed or dragged
    mymap.on("zoomstart", () => repositionMap(circles));
    mymap.on("moveend", () => repositionMap(circles));
    mymap.on("move", repositionToolTip);
    mymap.on("zoomstart", () => {
      div.style("opacity", 0);
    });
    mymap.on("zoomend", () => {
      div.style("opacity", 1);
    });
    repositionMap(circles);
  } catch (err) {
    console.error(err);
  }
}

let repositionToolTip = () => {
  justMoved = true;
  div.style("opacity", 1);
  let selectedDot = d3.select("circle.selected-dot");

  if (selectedDot._groups[0][0] !== null) {
    let toolTipLayerPoint = mymap.latLngToLayerPoint(
      selectedDot._groups[0][0].__data__.LatLng
    );
    let toolTipPxCoords = mymap.layerPointToContainerPoint(toolTipLayerPoint);

    div.style("top", toolTipPxCoords.y + "px");
    div.style("left", toolTipPxCoords.x + "px");
  }
};

let repositionMap = () => {
  crimeDots.selectAll("circle").attr("transform", d => {
    return `translate(${mymap.latLngToLayerPoint(d.LatLng).x}, ${
      mymap.latLngToLayerPoint(d.LatLng).y
    })`;
  });
  let group = document.querySelector(".leaflet-zoom-hide");
  let groupBounds = group.getBBox();
  svg
    .attr("width", groupBounds.width)
    .attr("height", groupBounds.height)
    .attr("style", `top:${groupBounds.y}px; left:${groupBounds.x}px;`);

  // let d3Group = d3.select(".leaflet-zoom-hide");
  crimeDots.attr(
    "style",
    `transform:translate(${-groupBounds.x}px, ${-groupBounds.y}px`
  );
};

//handle check box clicks to update data

let handleCrimeFilters = cb => {
  if (cb.checked == true) {
    checked.push(cb.name);
  } else {
    let position = checked.indexOf(cb.name);
    if (~position) {
      checked.splice(position, 1);
    }
  }
  addMarkers();
};

let crimeFilters = document.querySelectorAll(".crimeFilter");
Array.from(crimeFilters).forEach(function(element) {
  element.addEventListener("click", function() {
    handleCrimeFilters(element);
  });
});

let thisYear = new Date().getFullYear();
// handle date filtering
moment.tz.add("America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0");
let dateRange = [
  new moment(thisYear + "-01-01").tz("America/New_York").format(),
  moment()
    .tz("America/New_York")
    .format()
];

let dateSelector = document.querySelector(".dateSelector");
let filterByDate = document.querySelector(".filterByDate");
filterByDate.addEventListener("change", function(element) {
  handleDateFilters(element.currentTarget.value);
});

let handleDateFilters = dateSelection => {
  switch (dateSelection) {
    case "This year":
      dateRange[0] = moment
        .tz(thisYear + "-01-01", "America/New_York")
        .format();
      dateRange[1] = moment()
        .tz("America/New_York")
        .format();
      dateSelector.classList.remove("visible");
      break;
    case "Last 30 days":
      dateRange[0] = moment()
        .subtract(30, "days")
        .tz("America/New_York")
        .format();
      dateRange[1] = moment()
        .tz("America/New_York")
        .format();
      dateSelector.classList.remove("visible");
      break;
    case "Last 7 days":
      dateRange[0] = moment()
        .subtract(7, "days")
        .tz("America/New_York")
        .format();
      dateRange[1] = moment()
        .tz("America/New_York")
        .format();
      dateSelector.classList.remove("visible");
      break;
    case "Custom date range":
      dateSelector.classList.add("visible");
      break;
    default:
      alert(
        "Something went wrong when selecting a date, please refresh the page and try again."
      );
  }
  addMarkers();
};

//custom date range functions
let fromDatePicker = document.querySelector(".dateSelectorFrom");
fromDatePicker.addEventListener("change", function(element) {
  changeFromRange(element.currentTarget.value);
});
let changeFromRange = from => {
  dateRange[0] = moment.tz(from, "America/New_York").format();
  addMarkers();
};
let toDatePicker = document.querySelector(".dateSelectorTo");
toDatePicker.addEventListener("change", function(element) {
  changeToRange(element.currentTarget.value);
});
let changeToRange = to => {
  dateRange[1] = moment.tz(to, "America/New_York").format();
  addMarkers();
};

//initialize
addMarkers();

//event listeners
let legend = document.querySelector("#key");
let filterButton = document.querySelector("#key h4");
let caret = document.querySelector(".caret");
filterButton.addEventListener("click", () => {
  legend.classList.toggle("open");
  caret.classList.toggle("caret-close");
});
