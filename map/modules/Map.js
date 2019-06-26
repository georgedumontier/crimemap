import * as d3 from "d3";
const map = {
  mymap: L.map("mapid").setView([33.749, -84.388], 13)
};
map.svg = d3
  .select(map.mymap.getPanes().overlayPane)
  .append("svg")
  .attr("id", "leaflet-overlay");
map.crimeDots = map.svg
  .append("g")
  .attr("class", "leaflet-zoom-hide crimeDots");
export default map;
