import * as d3 from "d3";
import handleFilters from "./HandleFilters";
// import moment from "moment-timezone";
import map from "./Map.js";
const { mymap, svg, crimeDots } = map;
import reposition from "./Reposition";
import leaflet from "leaflet";
let data = null;
const div = d3.select(".tooltip");

async function addMarkers() {
  try {
    data = await d3.json("COBRA-2019.json");

    //filter data based on the checked array
    data = data.filter(d => {
      return handleFilters.crimes.checked.includes(d.UCRliteral);
    });

    //filter data based on date
    data = data.filter(d => {
      // return (
      //   moment(d.occurDate)
      //     .tz("America/New_York")
      //     .isSameOrAfter(handleFilters.dates.dateRange[0], "day") &&
      //   moment(d.occurDate)
      //     .tz("America/New_York")
      //     .isSameOrBefore(handleFilters.dates.dateRange[1], "day")
      // );
      let occurDate = new Date(d.occurDate.replace(/-/g, "/"));
      return (
        new Date(occurDate) > new Date(handleFilters.dates.dateRange[0]) &&
        new Date(occurDate) < new Date(handleFilters.dates.dateRange[1])
      );
    });

    //give the data a Leaflet.js-friendly LatLng object
    data.forEach(object => {
      object.LatLng = new L.LatLng(object.latitude, object.longitude);
    });

    //link data to circles via d3
    let circles = crimeDots.selectAll("circle").data(data);

    //colors of checkboxes --(should be moved into module probably)--
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
      if (reposition.justMoved == false) {
        div.style("opacity", 0);
        d3.select(".selected-dot").attr("class", "");
      } else {
        justMoved = false;
      }
    });

    //add a circle for every crime
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

    //get rid of any extra circles
    circles.exit().remove();

    //reposition map when zoomed or dragged
    mymap.on("zoomstart", () => reposition.map(circles));
    mymap.on("moveend", () => reposition.map(circles));
    // slight problem with reposition.tooltip -- affects mobile
    //mymap.on("move", reposition.toolTip);
    mymap.on("zoomstart", () => {
      div.style("opacity", 0);
    });
    mymap.on("zoomend", () => {
      div.style("opacity", 1);
    });
    reposition.map(circles);
  } catch (err) {
    console.error(err);
  }
}

export default addMarkers;
