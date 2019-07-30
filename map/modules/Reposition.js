import * as d3 from "d3";
import map from "./Map";
import leaflet from "leaflet";
const { mymap, svg, crimeDots } = map;
let selectedDot = d3.select(".selected-dot");
let div = d3.select(".tooltip");

const reposition = {
  justMoved: false // this is an annoying necessity for repositioning on mobile. I had to keep track of whether a map move had just happened.
};
reposition.tooltip = () => {
  // reposition the tooltip
  selectedDot = d3.select(".selected-dot");
  reposition.justMoved = true;
  div.style("opacity", 1);
  //check for a selected dot
  if (selectedDot._groups[0][0] !== null) {
    let toolTipLayerPoint = mymap.latLngToLayerPoint(
      selectedDot._groups[0][0].__data__.LatLng
    );
    let toolTipPxCoords = mymap.layerPointToContainerPoint(toolTipLayerPoint); // leaflet can change lat/long coords to pixels

    div.style("top", toolTipPxCoords.y + "px");
    div.style("left", toolTipPxCoords.x + "px");
  }
};
reposition.map = function() {
  //transforms each circle based on the lat/long of each data point
  crimeDots.selectAll("circle").attr("transform", d => {
    return `translate(${mymap.latLngToLayerPoint(d.LatLng).x}, ${
      mymap.latLngToLayerPoint(d.LatLng).y
    })`;
  });

  // Resize the actual svg holding the circles and adjust accordingly
  let group = document.querySelector(".leaflet-zoom-hide");
  let groupBounds = group.getBBox();
  svg
    .attr("width", groupBounds.width)
    .attr("height", groupBounds.height)
    .attr("style", `top:${groupBounds.y}px; left:${groupBounds.x}px;`);

  crimeDots.attr(
    "style",
    `transform:translate(${-groupBounds.x}px, ${-groupBounds.y}px`
  );
};

export default reposition;
