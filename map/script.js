const mymap = L.map("mapid").setView([33.749, -84.388], 13);
let data = null;
let div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

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
          .style("top", d3.event.pageY + "px");
      })
      .on("mouseout", d => {
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

    mymap.on("zoomstart", () => {
      update(feature);
    });

    mymap.on("moveend", () => {
      update(feature);
    });

    update(feature);
  } catch (err) {
    console.error(err);
  }
}

let update = feature => {
  feature.attr("transform", function(d) {
    return `translate(${
      mymap.latLngToLayerPoint(d.LatLng).x
    }, ${mymap.latLngToLayerPoint(d.LatLng).y})`;
  });
  let group = document.querySelector(".leaflet-zoom-hide");
  let groupBounds = group.getBBox();
  svg
    .attr("width", groupBounds.width)
    .attr("height", groupBounds.height)
    .attr("style", `top:${groupBounds.y}px; left:${groupBounds.x}px;`);

  let d3Group = d3.select(".leaflet-zoom-hide");
  d3Group.attr(
    "style",
    `transform:translate(${-groupBounds.x}px, ${-groupBounds.y}px`
  );
};
let checked = [];
let handleFilters = cb => {
  console.log(cb.checked);
  if (cb.checked == true) {
    checked.push(cb.name);
  } else {
    let position = checked.indexOf(cb.name);
    if (~position) {
      checked.splice(position, 1);
    }
  }
  console.log(checked);
  let feature = d3
    .select("g")
    .selectAll("circle")
    .data(
      data.filter(function(d) {
        // return d.UCRliteral == "LARCENY-FROM VEHICLE";
        return checked.includes(d.UCRliteral);
      })
    )
    .exit()
    .remove()
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
        .html(`<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", d => {
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
        .html(`<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    });

  update(feature);
};

addMarkers();
