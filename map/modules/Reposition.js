import * as d3 from "d3";
import map from "./Map";
import leaflet from "leaflet";
const { mymap, svg, crimeDots } = map;
const selectedDot = d3.select("circle.selected-dot");
const div = document.querySelector(".tooltip");

const reposition = {
  justMoved: false
};
reposition.tooltip = () => {
  reposition.justMoved = true;
  div.style("opacity", 1);

  if (selectedDot._groups[0][0] !== null) {
    let toolTipLayerPoint = mymap.latLngToLayerPoint(
      selectedDot._groups[0][0].__data__.LatLng
    );
    let toolTipPxCoords = mymap.layerPointToContainerPoint(toolTipLayerPoint);

    div.style("top", toolTipPxCoords.y + "px");
    div.style("left", toolTipPxCoords.x + "px");
  }
};
reposition.map = function() {
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

  crimeDots.attr(
    "style",
    `transform:translate(${-groupBounds.x}px, ${-groupBounds.y}px`
  );
};

export default reposition;
