import * as d3 from "d3";
// map holds all the map methods and what not
const map = {
  mymap: L.map("mapid").setView([33.749, -84.388], 13) // L is the leaflet object. setView centers the map over Atlanta and the second argument is the zoom level
};
map.svg = d3
  .select(map.mymap.getPanes().overlayPane) //select the overlay panes in the Leaflet
  .append("svg") // add an svg layer to the overlay panes
  .attr("id", "leaflet-overlay"); // give it an id
map.crimeDots = map.svg
  .append("g") // append a group to our new svg
  .attr("class", "leaflet-zoom-hide crimeDots"); //the leaflet-zoom-hide class automatically hides the dots while zooming in and out. It looks weird without this.
export default map;
