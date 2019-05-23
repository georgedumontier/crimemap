const mymap = L.map("mapid").setView([33.749, -84.388], 13);
let data = null;
let div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
let checked = ["LARCENY-NON VEHICLE"];

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
  .attr("id", "leaflet-overlay");

let crimeDots = svg.append("g").attr("class", "leaflet-zoom-hide");
// g = svg.append("g").attr("class", "leaflet-zoom-hide");

async function addMarkers() {
  try {
    // data = await d3.json("../json/COBRA-2019.json");
    let data = await d3.json("COBRA-2019.json");

    //filter data based on the checked array
    data = data.filter(d => {
      return checked.includes(d.UCRliteral);
    });

    //give the data a Leaflet.js-friendly LatLng object
    data.forEach(object => {
      object.LatLng = new L.LatLng(object.latitude, object.longitude);
    });

    let circles = crimeDots.selectAll("circle").data(data);

    circles
      .enter()
      .append("circle")
      .style("stroke", "red")
      .style("opacity", 0.6)
      .style("fill", "red")
      .attr("r", 5)
      .style("transition", "0.3s ease all")
      .on("mouseover", function(d) {
        d3.select(this)
          .style("fill", "blue")
          .style("opacity", 1)
          .attr("r", 8);
        div
          .transition()
          .duration(100)
          .style("opacity", 0.9);
        div
          .html(
            `<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .style("fill", "red")
          .style("opacity", 0.6)
          .attr("r", 5);
        div
          .transition()
          .duration(100)
          .style("opacity", 0);
      })
      .on("touchstart", d => {
        div
          .transition()
          .duration(100)
          .style("opacity", 0.9);
        div
          .html(
            `<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
      });

    circles.exit().remove();

    //reposition map when zoomed or dragged
    mymap.on("zoomstart", () => repositionMap(circles));
    mymap.on("moveend", () => repositionMap(circles));
    repositionMap(circles);
  } catch (err) {
    console.error(err);
  }
}

let repositionMap = circles => {
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
let handleFilters = cb => {
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

//initialize
addMarkers();
