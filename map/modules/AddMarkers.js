// This is a big module. It's responsible for adding all the markers to the map and positioning them each time a filter is applied or the map is moved.
import * as d3 from "d3";
import handleFilters from "./HandleFilters";
// import moment from "moment-timezone";
import map from "./Map.js";
const { mymap, svg, crimeDots } = map;
import reposition from "./Reposition";
import leaflet from "leaflet";
import dataImport from "../COBRA-2019.json";

// a couple global variables. They're still scoped to the module thankfully
let data = null;
const div = d3.select(".tooltip");

async function addMarkers() {
  try {
    data = dataImport; //grab json files

    //filter data based on the checked array
    data = data.filter(d => {
      return handleFilters.crimes.checked.includes(d.UCRliteral);
    });

    //filter data based on date
    data = data.filter(d => {
      let occurDate = new Date(d.occurDate.replace(/-/g, "/"));
      return (
        new Date(occurDate) > new Date(handleFilters.dates.dateRange[0]) &&
        new Date(occurDate) < new Date(handleFilters.dates.dateRange[1])
      );
    });

    //give the data a Leaflet.js-friendly LatLng object (This should probably be done on the backend)
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
        reposition.justMoved = false;
      }
    });

    //add a circle for every crime (d3 is a little complicated, but this is the meat of it)
    circles
      .enter() //enter counts how many more data points there are than svgs
      .append("circle") // adds a circle svg element for each data point
      .attr("r", 6) //circle radius
      .on("mouseenter", function(d) {
        //event listenter to make selected dot bigger
        d3.select(this)
          .attr("class", "selected-dot")
          .attr("r", 8);
        div
          .transition()
          .duration(100)
          .style("opacity", 1);
        let selectedDot = d3.select(".selected-dot");
        // move the tooltip to the correct spot on the map with Leaflet's method converting a lat/long to pixel coords
        let toolTipLayerPoint = mymap.latLngToLayerPoint(
          selectedDot._groups[0][0].__data__.LatLng
        );
        let toolTipPxCoords = mymap.layerPointToContainerPoint(
          toolTipLayerPoint
        );

        div //set html of tool tip
          .html(
            `<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`
          )
          .style("top", toolTipPxCoords.y + "px")
          .style("left", toolTipPxCoords.x + "px");
      })
      .on("mouseleave", function(d) {
        d3.select(this)
          .attr("class", "")
          .attr("r", 6);
        div.style("opacity", 0).style("top", "-500px");
      })
      .on("click touchstart", function(d) {
        d3.select(".selected-dot").attr("class", "");
        d3.select(this)
          .attr("class", "selected-dot")
          .attr("r", 8);
        div
          .transition()
          .duration(100)
          .style("opacity", 1);
        let selectedDot = d3.select(".selected-dot");
        let toolTipLayerPoint = mymap.latLngToLayerPoint(
          selectedDot._groups[0][0].__data__.LatLng
        );
        let toolTipPxCoords = mymap.layerPointToContainerPoint(
          toolTipLayerPoint
        );
        div
          .html(
            `<p>${d.location}</p><p>${d.UCRliteral}</p><p>${d.occurDate}</p>`
          )
          .style("top", toolTipPxCoords.y + "px")
          .style("left", toolTipPxCoords.x + "px");
        // .style("left", d3.event.pageX + "px")
        // .style("top", d3.event.pageY + "px");
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
    mymap.on("move", reposition.tooltip);
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
