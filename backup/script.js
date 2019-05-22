const mymap = L.map("mapid").setView([33.749, -84.388], 13);
let data = null;
let div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

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

let svg = d3
    .select(mymap.getPanes().overlayPane)
    .append("svg")
    .attr("id", "leaflet-overlay"),
  g = svg.append("g").attr("class", "leaflet-zoom-hide");

async function addMarkers() {
  try {
    // data = await d3.json("../json/COBRA-2019.json");
    data = await d3.json("COBRA-2019.json");
    data.forEach(object => {
      object.LatLng = new L.LatLng(object.latitude, object.longitude);
    });

    let feature = g
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .style("stroke", "red")
      .style("opacity", 0.6)
      .style("fill", "red")
      .attr("r", 5)
      .on("mouseover", d => {
        div
          .transition()
          .duration(100)
          .style("opacity", 0.9);
        div
          .html(
            `<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", d => {
        div
          .transition()
          .duration(100)
          .style("opacity", 0);
      });

    mymap.on("zoomstart", () => {
      updateMove(feature);
    });

    mymap.on("moveend", () => {
      updateMove(feature);
    });

    updateMove(feature);
  } catch (err) {
    console.error(err);
  }
}

function updateMove(feature) {
  console.log("map was dragged");
  let newBoundingBox = mymap.getBounds();
  let bottomLeft = mymap.latLngToLayerPoint(newBoundingBox._southWest);
  let topRight = mymap.latLngToLayerPoint(newBoundingBox._northEast);
  // x = x.x;
  // y = y.y;

  svg
    .attr("width", topRight.x - bottomLeft.x)
    .attr("height", bottomLeft.y - topRight.y)
    .style("left", bottomLeft.x + "px")
    .style("top", topRight.y + "px");
  // svg.attr("transform", () => {
  //   return `translate(${x},${y})`;
  // });
  // let overlay = document.querySelector("#leaflet-overlay");
  // overlay.style.cssText = `top:${y};left:${x}`;

  feature.attr("transform", function(d) {
    return `translate(${mymap.latLngToLayerPoint(d.LatLng).x -
      bottomLeft.x}, ${mymap.latLngToLayerPoint(d.LatLng).y - topRight.y})`;
  });
}

// function updateZoom(feature) {
//   feature.attr("transform", function(d) {
//     return `translate(${
//       mymap.latLngToLayerPoint(d.LatLng).x
//     }, ${mymap.latLngToLayerPoint(d.LatLng).y})`;
//   });
// }

addMarkers();
// async function getData() {
//   const data = await fetch("../json/COBRA-2019.json");
//   const json = await data.json();
//   addMarkers(json);
// }
// getData();
