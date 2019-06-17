(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const mymap = L.map("mapid").setView([33.749, -84.388], 13);

let data = null;
let div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
let checked = ["LARCENY-NON VEHICLE"];
// let dateFilter = "This year";
let justMoved = false;
// let today = new Date();

//address search setup with leaflet-geosearch
// import { OpenStreetMapProvider } from "leaflet-geosearch";
let leafletGeosearch = require("leaflet-geosearch");
let OpenStreetMapProvider = leafletGeosearch.OpenStreetMapProvider;
const provider = new OpenStreetMapProvider();
let goGetResults = async function(input) {
  const results = await provider.search({ query: input });
  console.log(results);
  let xCoords = results[0].x;
  let yCoords = results[0].y;
  let addressMarker = L.marker([xCoords, yCoords]).addTo(mymap);
  return results;
};
window.handleAddressFilter = () => {
  let addressInput = document.querySelector(".filterByAddress");
  let addressInputValue = addressInput.value;
  //validate input

  console.log(addressInputValue);
  goGetResults(addressInputValue);
};

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

let crimeDots = svg.append("g").attr("class", "leaflet-zoom-hide");
// g = svg.append("g").attr("class", "leaflet-zoom-hide");

async function addMarkers() {
  try {
    data = await d3.json("COBRA-2019.json");
    //let data = await d3.json("COBRA-2019.json");

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
        // new Date(d.occurDate) < dateRange[1] &&
        // new Date(d.occurDate) > dateRange[0]
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
  // console.log(element.currentTarget.value);
  handleDateFilters(element.currentTarget.value);
});

let handleDateFilters = dateSelection => {
  switch (dateSelection) {
    case "This year":
      dateRange[0] = moment
        .tz(thisYear + "-01-01", "America/New_York")
        .format();
      // dateRange[1] = new Date(new Date().setDate(today.getDate() + 1));
      dateRange[1] = moment()
        .tz("America/New_York")
        .format();
      dateSelector.classList.remove("visible");
      break;
    case "Last 30 days":
      // dateRange[0] = new Date(new Date().setDate(new Date().getDate() - 31));
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
      // dateRange[0] = new Date(new Date().setDate(new Date().getDate() - 8));
      dateRange[0] = moment()
        .subtract(7, "days")
        .tz("America/New_York")
        .format();
      // dateRange[1] = new Date(new Date().setDate(today.getDate() + 1));
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
  console.log(from);
  console.log(moment.tz(from, "America/New_York").format());
  dateRange[0] = moment.tz(from, "America/New_York").format();
  // console.log(new Date(from).toISOString());
  console.log(dateRange);
  addMarkers();
};
let toDatePicker = document.querySelector(".dateSelectorTo");
toDatePicker.addEventListener("change", function(element) {
  changeToRange(element.currentTarget.value);
});
let changeToRange = to => {
  console.log(to);
  // dateRange[1] = new Date(to);
  dateRange[1] = moment.tz(to, "America/New_York").format();
  console.log(dateRange);
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

},{"leaflet-geosearch":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ENTER_KEY = exports.ENTER_KEY = 13;
var ESCAPE_KEY = exports.ESCAPE_KEY = 27;
var ARROW_DOWN_KEY = exports.ARROW_DOWN_KEY = 40;
var ARROW_UP_KEY = exports.ARROW_UP_KEY = 38;
var ARROW_LEFT_KEY = exports.ARROW_LEFT_KEY = 37;
var ARROW_RIGHT_KEY = exports.ARROW_RIGHT_KEY = 39;

var SPECIAL_KEYS = exports.SPECIAL_KEYS = [ENTER_KEY, ESCAPE_KEY, ARROW_DOWN_KEY, ARROW_UP_KEY, ARROW_LEFT_KEY, ARROW_RIGHT_KEY];
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint-disable import/prefer-default-export */
var createElement = exports.createElement = function createElement(element) {
  var classNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var el = document.createElement(element);
  el.className = classNames;

  if (parent) {
    parent.appendChild(el);
  }

  return el;
};

var createScriptElement = exports.createScriptElement = function createScriptElement(url, cb) {
  var script = createElement('script', null, document.body);
  script.setAttribute('type', 'text/javascript');

  return new Promise(function (resolve) {
    window[cb] = function (json) {
      script.remove();
      delete window[cb];
      resolve(json);
    };

    script.setAttribute('src', url);
  });
};

var addClassName = exports.addClassName = function addClassName(element, className) {
  if (element && !element.classList.contains(className)) {
    element.classList.add(className);
  }
};

var removeClassName = exports.removeClassName = function removeClassName(element, className) {
  if (element && element.classList.contains(className)) {
    element.classList.remove(className);
  }
};
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _leafletControl = require('./leafletControl');

Object.defineProperty(exports, 'GeoSearchControl', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_leafletControl).default;
  }
});

var _searchElement = require('./searchElement');

Object.defineProperty(exports, 'SearchElement', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_searchElement).default;
  }
});

var _bingProvider = require('./providers/bingProvider');

Object.defineProperty(exports, 'BingProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_bingProvider).default;
  }
});

var _esriProvider = require('./providers/esriProvider');

Object.defineProperty(exports, 'EsriProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_esriProvider).default;
  }
});

var _googleProvider = require('./providers/googleProvider');

Object.defineProperty(exports, 'GoogleProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_googleProvider).default;
  }
});

var _openStreetMapProvider = require('./providers/openStreetMapProvider');

Object.defineProperty(exports, 'OpenStreetMapProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_openStreetMapProvider).default;
  }
});

var _provider = require('./providers/provider');

Object.defineProperty(exports, 'Provider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_provider).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./leafletControl":5,"./providers/bingProvider":6,"./providers/esriProvider":7,"./providers/googleProvider":8,"./providers/openStreetMapProvider":9,"./providers/provider":10,"./searchElement":12}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodentRuntime = require('nodent-runtime');

var _nodentRuntime2 = _interopRequireDefault(_nodentRuntime);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = LeafletControl;

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _searchElement = require('./searchElement');

var _searchElement2 = _interopRequireDefault(_searchElement);

var _resultList = require('./resultList');

var _resultList2 = _interopRequireDefault(_resultList);

var _domUtils = require('./domUtils');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = function defaultOptions() {
  return {
    position: 'topleft',
    style: 'button',
    showMarker: true,
    showPopup: false,
    popupFormat: function popupFormat(_ref) {
      var result = _ref.result;
      return '' + result.label;
    },
    marker: {
      icon: new L.Icon.Default(),
      draggable: false
    },
    maxMarkers: 1,
    retainZoomLevel: false,
    animateZoom: true,
    searchLabel: 'Enter address',
    notFoundMessage: 'Sorry, that address could not be found.',
    messageHideDelay: 3000,
    zoomLevel: 18,
    classNames: {
      container: 'leaflet-bar leaflet-control leaflet-control-geosearch',
      button: 'leaflet-bar-part leaflet-bar-part-single',
      resetButton: 'reset',
      msgbox: 'leaflet-bar message',
      form: '',
      input: ''
    },
    autoComplete: true,
    autoCompleteDelay: 250,
    autoClose: false,
    keepResult: false
  };
};

var wasHandlerEnabled = {};
var mapHandlers = ['dragging', 'touchZoom', 'doubleClickZoom', 'scrollWheelZoom', 'boxZoom', 'keyboard'];

var Control = {
  initialize: function initialize(options) {
    var _this = this;

    this.markers = new L.FeatureGroup();
    this.handlersDisabled = false;

    this.options = _extends({}, defaultOptions(), options);

    var _options = this.options,
        style = _options.style,
        classNames = _options.classNames,
        searchLabel = _options.searchLabel,
        autoComplete = _options.autoComplete,
        autoCompleteDelay = _options.autoCompleteDelay;

    if (style !== 'button') {
      this.options.classNames.container += ' ' + options.style;
    }

    this.searchElement = new _searchElement2.default(_extends({}, this.options, {
      handleSubmit: function handleSubmit(query) {
        return _this.onSubmit(query);
      }
    }));

    var _searchElement$elemen = this.searchElement.elements,
        container = _searchElement$elemen.container,
        form = _searchElement$elemen.form,
        input = _searchElement$elemen.input;


    var button = (0, _domUtils.createElement)('a', classNames.button, container);
    button.title = searchLabel;
    button.href = '#';

    button.addEventListener('click', function (e) {
      _this.onClick(e);
    }, false);

    var resetButton = (0, _domUtils.createElement)('a', classNames.resetButton, form);
    resetButton.innerHTML = 'X';
    button.href = '#';
    resetButton.addEventListener('click', function () {
      _this.clearResults(null, true);
    }, false);

    if (autoComplete) {
      this.resultList = new _resultList2.default({
        handleClick: function handleClick(_ref2) {
          var result = _ref2.result;

          input.value = result.label;
          _this.onSubmit({ query: result.label, data: result });
        }
      });

      form.appendChild(this.resultList.elements.container);

      input.addEventListener('keyup', (0, _lodash2.default)(function (e) {
        return _this.autoSearch(e);
      }, autoCompleteDelay), true);
      input.addEventListener('keydown', function (e) {
        return _this.selectResult(e);
      }, true);
      input.addEventListener('keydown', function (e) {
        return _this.clearResults(e, true);
      }, true);
    }

    form.addEventListener('mouseenter', function (e) {
      return _this.disableHandlers(e);
    }, true);
    form.addEventListener('mouseleave', function (e) {
      return _this.restoreHandlers(e);
    }, true);

    this.elements = { button: button, resetButton: resetButton };
  },
  onAdd: function onAdd(map) {
    var _options2 = this.options,
        showMarker = _options2.showMarker,
        style = _options2.style;


    this.map = map;
    if (showMarker) {
      this.markers.addTo(map);
    }

    if (style === 'bar') {
      var form = this.searchElement.elements.form;

      var root = map.getContainer().querySelector('.leaflet-control-container');

      var container = (0, _domUtils.createElement)('div', 'leaflet-control-geosearch bar');
      container.appendChild(form);
      root.appendChild(container);
      this.elements.container = container;
    }

    return this.searchElement.elements.container;
  },
  onRemove: function onRemove() {
    var container = this.elements.container;

    if (container) {
      container.remove();
    }

    return this;
  },
  onClick: function onClick(event) {
    event.preventDefault();

    var _searchElement$elemen2 = this.searchElement.elements,
        container = _searchElement$elemen2.container,
        input = _searchElement$elemen2.input;


    if (container.classList.contains('active')) {
      (0, _domUtils.removeClassName)(container, 'active');
      this.clearResults();
    } else {
      (0, _domUtils.addClassName)(container, 'active');
      input.focus();
    }
  },
  disableHandlers: function disableHandlers(e) {
    var _this2 = this;

    var form = this.searchElement.elements.form;


    if (this.handlersDisabled || e && e.target !== form) {
      return;
    }

    this.handlersDisabled = true;
    mapHandlers.forEach(function (handler) {
      if (_this2.map[handler]) {
        wasHandlerEnabled[handler] = _this2.map[handler].enabled();
        _this2.map[handler].disable();
      }
    });
  },
  restoreHandlers: function restoreHandlers(e) {
    var _this3 = this;

    var form = this.searchElement.elements.form;


    if (!this.handlersDisabled || e && e.target !== form) {
      return;
    }

    this.handlersDisabled = false;
    mapHandlers.forEach(function (handler) {
      if (wasHandlerEnabled[handler]) {
        _this3.map[handler].enable();
      }
    });
  },
  selectResult: function selectResult(event) {
    if (![_constants.ENTER_KEY, _constants.ARROW_DOWN_KEY, _constants.ARROW_UP_KEY].includes(event.keyCode)) {
      return;
    }

    event.preventDefault();

    var input = this.searchElement.elements.input;


    var list = this.resultList;

    if (event.keyCode === _constants.ENTER_KEY) {
      var _item = list.select(list.selected);
      this.onSubmit({ query: input.value, data: _item });
      return;
    }

    var max = list.count() - 1;
    if (max < 0) {
      return;
    }

    // eslint-disable-next-line no-bitwise
    var next = event.code === 'ArrowDown' ? ~~list.selected + 1 : ~~list.selected - 1;
    // eslint-disable-next-line no-nested-ternary
    var idx = next < 0 ? max : next > max ? 0 : next;

    var item = list.select(idx);
    input.value = item.label;
  },
  clearResults: function clearResults(event) {
    var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (event && event.keyCode !== _constants.ESCAPE_KEY) {
      return;
    }

    var input = this.searchElement.elements.input;
    var _options3 = this.options,
        keepResult = _options3.keepResult,
        autoComplete = _options3.autoComplete;


    if (force || !keepResult) {
      input.value = '';
      this.markers.clearLayers();
    }

    if (autoComplete) {
      this.resultList.clear();
    }
  },
  autoSearch: function autoSearch(event) {
    return new Promise(function ($return, $error) {
      var query, provider, results;

      if (_constants.SPECIAL_KEYS.includes(event.keyCode)) {
        return $return();
      }

      query = event.target.value;
      provider = this.options.provider;


      if (query.length) {
        return provider.search({ query: query }).then(function ($await_2) {
          results = $await_2;
          this.resultList.render(results);
          return $If_1.call(this);
        }.$asyncbind(this, $error), $error);
      } else {
        this.resultList.clear();
        return $If_1.call(this);
      }

      function $If_1() {
        return $return();
      }
    }.$asyncbind(this));
  },
  onSubmit: function onSubmit(query) {
    return new Promise(function ($return, $error) {
      var provider, results;
      provider = this.options.provider;
      return provider.search(query).then(function ($await_3) {

        results = $await_3;

        if (results && results.length > 0) {
          this.showResult(results[0], query);
        }
        return $return();
      }.$asyncbind(this, $error), $error);
    }.$asyncbind(this));
  },
  showResult: function showResult(result, _ref3) {
    var query = _ref3.query;
    var autoClose = this.options.autoClose;


    var markers = Object.keys(this.markers._layers);
    if (markers.length >= this.options.maxMarkers) {
      this.markers.removeLayer(markers[0]);
    }

    var marker = this.addMarker(result, query);
    this.centerMap(result);

    this.map.fireEvent('geosearch/showlocation', {
      location: result,
      marker: marker
    });

    if (autoClose) {
      this.closeResults();
    }
  },
  closeResults: function closeResults() {
    var container = this.searchElement.elements.container;


    if (container.classList.contains('active')) {
      (0, _domUtils.removeClassName)(container, 'active');
    }

    this.restoreHandlers();
    this.clearResults();
  },
  addMarker: function addMarker(result, query) {
    var _this4 = this;

    var _options4 = this.options,
        options = _options4.marker,
        showPopup = _options4.showPopup,
        popupFormat = _options4.popupFormat;

    var marker = new L.Marker([result.y, result.x], options);
    var popupLabel = result.label;

    if (typeof popupFormat === 'function') {
      popupLabel = popupFormat({ query: query, result: result });
    }

    marker.bindPopup(popupLabel);

    this.markers.addLayer(marker);

    if (showPopup) {
      marker.openPopup();
    }

    if (options.draggable) {
      marker.on('dragend', function (args) {
        _this4.map.fireEvent('geosearch/marker/dragend', {
          location: marker.getLatLng(),
          event: args
        });
      });
    }

    return marker;
  },
  centerMap: function centerMap(result) {
    var _options5 = this.options,
        retainZoomLevel = _options5.retainZoomLevel,
        animateZoom = _options5.animateZoom;


    var resultBounds = new L.LatLngBounds(result.bounds);
    var bounds = resultBounds.isValid() ? resultBounds : this.markers.getBounds();

    if (!retainZoomLevel && resultBounds.isValid()) {
      this.map.fitBounds(bounds, { animate: animateZoom });
    } else {
      this.map.setView(bounds.getCenter(), this.getZoom(), { animate: animateZoom });
    }
  },
  getZoom: function getZoom() {
    var _options6 = this.options,
        retainZoomLevel = _options6.retainZoomLevel,
        zoomLevel = _options6.zoomLevel;

    return retainZoomLevel ? this.map.getZoom() : zoomLevel;
  }
};

function LeafletControl() {
  if (!L || !L.Control || !L.Control.extend) {
    throw new Error('Leaflet must be loaded before instantiating the GeoSearch control');
  }

  var LControl = L.Control.extend(Control);

  for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
    options[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(LControl, [null].concat(options)))();
}
},{"./constants":2,"./domUtils":3,"./resultList":11,"./searchElement":12,"lodash.debounce":13,"nodent-runtime":14}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodentRuntime = require('nodent-runtime');

var _nodentRuntime2 = _interopRequireDefault(_nodentRuntime);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

var _domUtils = require('../domUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Provider = function (_BaseProvider) {
  _inherits(Provider, _BaseProvider);

  function Provider() {
    _classCallCheck(this, Provider);

    return _possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).apply(this, arguments));
  }

  _createClass(Provider, [{
    key: 'endpoint',
    value: function endpoint() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          query = _ref.query,
          protocol = _ref.protocol,
          jsonp = _ref.jsonp;

      var params = this.options.params;


      var paramString = this.getParamString(_extends({}, params, {
        query: query,
        jsonp: jsonp
      }));

      return protocol + '//dev.virtualearth.net/REST/v1/Locations?' + paramString;
    }
  }, {
    key: 'parse',
    value: function parse(_ref2) {
      var data = _ref2.data;

      if (data.resourceSets.length === 0) {
        return [];
      }

      return data.resourceSets[0].resources.map(function (r) {
        return {
          x: r.point.coordinates[1],
          y: r.point.coordinates[0],
          label: r.address.formattedAddress,
          bounds: [[r.bbox[0], r.bbox[1]], // s, w
          [r.bbox[2], r.bbox[3]]],
          raw: r
        };
      });
    }
  }, {
    key: 'search',
    value: function search(_ref3) {
      return new Promise(function ($return, $error) {
        var query, protocol, jsonp, url, json;
        query = _ref3.query;

        protocol = ~location.protocol.indexOf('http') ? location.protocol : 'https:';

        jsonp = 'BING_JSONP_CB_' + Date.now();
        url = this.endpoint({ query: query, protocol: protocol, jsonp: jsonp });

        return (0, _domUtils.createScriptElement)(url, jsonp).then(function ($await_1) {
          json = $await_1;
          return $return(this.parse({ data: json }));
        }.$asyncbind(this, $error), $error);
      }.$asyncbind(this));
    }
  }]);

  return Provider;
}(_provider2.default);

exports.default = Provider;
},{"../domUtils":3,"./provider":10,"nodent-runtime":14}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Provider = function (_BaseProvider) {
  _inherits(Provider, _BaseProvider);

  function Provider() {
    _classCallCheck(this, Provider);

    return _possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).apply(this, arguments));
  }

  _createClass(Provider, [{
    key: 'endpoint',
    value: function endpoint() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          query = _ref.query,
          protocol = _ref.protocol;

      var params = this.options.params;


      var paramString = this.getParamString(_extends({}, params, {
        f: 'json',
        text: query
      }));

      return protocol + '//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?' + paramString;
    }
  }, {
    key: 'parse',
    value: function parse(_ref2) {
      var data = _ref2.data;

      return data.locations.map(function (r) {
        return {
          x: r.feature.geometry.x,
          y: r.feature.geometry.y,
          label: r.name,
          bounds: [[r.extent.ymin, r.extent.xmin], // s, w
          [r.extent.ymax, r.extent.xmax]],
          raw: r
        };
      });
    }
  }]);

  return Provider;
}(_provider2.default);

exports.default = Provider;
},{"./provider":10}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Provider = function (_BaseProvider) {
  _inherits(Provider, _BaseProvider);

  function Provider() {
    _classCallCheck(this, Provider);

    return _possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).apply(this, arguments));
  }

  _createClass(Provider, [{
    key: 'endpoint',
    value: function endpoint() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          query = _ref.query,
          protocol = _ref.protocol;

      var params = this.options.params;


      var paramString = this.getParamString(_extends({}, params, {
        address: query
      }));

      // google requires a secure connection when using api keys
      var proto = params && params.key ? 'https:' : protocol;
      return proto + '//maps.googleapis.com/maps/api/geocode/json?' + paramString;
    }
  }, {
    key: 'parse',
    value: function parse(_ref2) {
      var data = _ref2.data;

      return data.results.map(function (r) {
        return {
          x: r.geometry.location.lng,
          y: r.geometry.location.lat,
          label: r.formatted_address,
          bounds: [[r.geometry.viewport.southwest.lat, r.geometry.viewport.southwest.lng], // s, w
          [r.geometry.viewport.northeast.lat, r.geometry.viewport.northeast.lng]],
          raw: r
        };
      });
    }
  }]);

  return Provider;
}(_provider2.default);

exports.default = Provider;
},{"./provider":10}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodentRuntime = require('nodent-runtime');

var _nodentRuntime2 = _interopRequireDefault(_nodentRuntime);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Provider = function (_BaseProvider) {
  _inherits(Provider, _BaseProvider);

  function Provider() {
    _classCallCheck(this, Provider);

    return _possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).apply(this, arguments));
  }

  _createClass(Provider, [{
    key: 'endpoint',
    value: function endpoint() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          query = _ref.query;

      var params = this.options.params;


      var paramString = this.getParamString(_extends({}, params, {
        format: 'json',
        q: query
      }));

      return 'https://nominatim.openstreetmap.org/search?' + paramString;
    }
  }, {
    key: 'endpointReverse',
    value: function endpointReverse() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          data = _ref2.data;

      var params = this.options.params;


      var paramString = this.getParamString(_extends({}, params, {
        format: 'json',
        // eslint-disable-next-line camelcase
        osm_id: data.raw.osm_id,
        // eslint-disable-next-line camelcase
        osm_type: this.translateOsmType(data.raw.osm_type)
      }));

      return 'https://nominatim.openstreetmap.org/reverse?' + paramString;
    }
  }, {
    key: 'parse',
    value: function parse(_ref3) {
      var data = _ref3.data;

      return data.map(function (r) {
        return {
          x: r.lon,
          y: r.lat,
          label: r.display_name,
          bounds: [[parseFloat(r.boundingbox[0]), parseFloat(r.boundingbox[2])], // s, w
          [parseFloat(r.boundingbox[1]), parseFloat(r.boundingbox[3])]],
          raw: r
        };
      });
    }
  }, {
    key: 'search',
    value: function search(_ref4) {
      return new Promise(function ($return, $error) {
        var query, data, protocol, url, request, json;
        query = _ref4.query, data = _ref4.data;

        protocol = ~location.protocol.indexOf('http') ? location.protocol : 'https:';

        url = data ? this.endpointReverse({ data: data, protocol: protocol }) : this.endpoint({ query: query, protocol: protocol });

        return fetch(url).then(function ($await_1) {
          request = $await_1;
          return request.json().then(function ($await_2) {
            json = $await_2;
            return $return(this.parse({ data: data ? [json] : json }));
          }.$asyncbind(this, $error), $error);
        }.$asyncbind(this, $error), $error);
      }.$asyncbind(this));
    }
  }, {
    key: 'translateOsmType',
    value: function translateOsmType(type) {
      if (type === 'node') return 'N';
      if (type === 'way') return 'W';
      if (type === 'relation') return 'R';
      return ''; // Unknown
    }
  }]);

  return Provider;
}(_provider2.default);

exports.default = Provider;
},{"./provider":10,"nodent-runtime":14}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodentRuntime = require('nodent-runtime');

var _nodentRuntime2 = _interopRequireDefault(_nodentRuntime);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Provider = function () {
  function Provider() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Provider);

    this.options = options;
  }

  _createClass(Provider, [{
    key: 'getParamString',
    value: function getParamString(params) {
      return Object.keys(params).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    }
  }, {
    key: 'search',
    value: function search(_ref) {
      return new Promise(function ($return, $error) {
        var query, protocol, url, request, json;
        query = _ref.query;

        protocol = ~location.protocol.indexOf('http') ? location.protocol : 'https:';
        url = this.endpoint({ query: query, protocol: protocol });

        return fetch(url).then(function ($await_1) {
          request = $await_1;
          return request.json().then(function ($await_2) {
            json = $await_2;
            return $return(this.parse({ data: json }));
          }.$asyncbind(this, $error), $error);
        }.$asyncbind(this, $error), $error);
      }.$asyncbind(this));
    }
  }]);

  return Provider;
}();

exports.default = Provider;
},{"nodent-runtime":14}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _domUtils = require('./domUtils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cx = function cx() {
  for (var _len = arguments.length, classnames = Array(_len), _key = 0; _key < _len; _key++) {
    classnames[_key] = arguments[_key];
  }

  return classnames.join(' ').trim();
};

var ResultList = function () {
  function ResultList() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$handleClick = _ref.handleClick,
        handleClick = _ref$handleClick === undefined ? function () {} : _ref$handleClick,
        _ref$classNames = _ref.classNames,
        classNames = _ref$classNames === undefined ? {} : _ref$classNames;

    _classCallCheck(this, ResultList);

    _initialiseProps.call(this);

    this.props = { handleClick: handleClick, classNames: classNames };
    this.selected = -1;

    var container = (0, _domUtils.createElement)('div', cx('results', classNames.container));
    var resultItem = (0, _domUtils.createElement)('div', cx(classNames.item));

    container.addEventListener('click', this.onClick, true);
    this.elements = { container: container, resultItem: resultItem };
  }

  _createClass(ResultList, [{
    key: 'render',
    value: function render() {
      var results = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var _elements = this.elements,
          container = _elements.container,
          resultItem = _elements.resultItem;

      this.clear();

      results.forEach(function (result, idx) {
        var child = resultItem.cloneNode(true);
        child.setAttribute('data-key', idx);
        child.innerHTML = result.label;
        container.appendChild(child);
      });

      if (results.length > 0) {
        (0, _domUtils.addClassName)(container, 'active');
      }

      this.results = results;
    }
  }, {
    key: 'select',
    value: function select(index) {
      var container = this.elements.container;

      // eslint-disable-next-line no-confusing-arrow

      Array.from(container.children).forEach(function (child, idx) {
        return idx === index ? (0, _domUtils.addClassName)(child, 'active') : (0, _domUtils.removeClassName)(child, 'active');
      });

      this.selected = index;
      return this.results[index];
    }
  }, {
    key: 'count',
    value: function count() {
      return this.results ? this.results.length : 0;
    }
  }, {
    key: 'clear',
    value: function clear() {
      var container = this.elements.container;

      this.selected = -1;

      while (container.lastChild) {
        container.removeChild(container.lastChild);
      }

      (0, _domUtils.removeClassName)(container, 'active');
    }
  }]);

  return ResultList;
}();

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.onClick = function () {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        target = _ref2.target;

    var handleClick = _this.props.handleClick;
    var container = _this.elements.container;


    if (target.parentNode !== container || !target.hasAttribute('data-key')) {
      return;
    }

    var idx = target.getAttribute('data-key');
    var result = _this.results[idx];
    handleClick({ result: result });
  };
};

exports.default = ResultList;
},{"./domUtils":3}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodentRuntime = require('nodent-runtime');

var _nodentRuntime2 = _interopRequireDefault(_nodentRuntime);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _domUtils = require('./domUtils');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SearchElement = function () {
  function SearchElement() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$handleSubmit = _ref.handleSubmit,
        handleSubmit = _ref$handleSubmit === undefined ? function () {} : _ref$handleSubmit,
        _ref$searchLabel = _ref.searchLabel,
        searchLabel = _ref$searchLabel === undefined ? 'search' : _ref$searchLabel,
        _ref$classNames = _ref.classNames,
        classNames = _ref$classNames === undefined ? {} : _ref$classNames;

    _classCallCheck(this, SearchElement);

    var container = (0, _domUtils.createElement)('div', ['geosearch', classNames.container].join(' '));
    var form = (0, _domUtils.createElement)('form', ['', classNames.form].join(' '), container);
    var input = (0, _domUtils.createElement)('input', ['glass', classNames.input].join(' '), form);

    input.type = 'text';
    input.placeholder = searchLabel;

    input.addEventListener('input', function (e) {
      _this.onInput(e);
    }, false);
    input.addEventListener('keyup', function (e) {
      _this.onKeyUp(e);
    }, false);
    input.addEventListener('keypress', function (e) {
      _this.onKeyPress(e);
    }, false);
    input.addEventListener('focus', function (e) {
      _this.onFocus(e);
    }, false);
    input.addEventListener('blur', function (e) {
      _this.onBlur(e);
    }, false);

    this.elements = { container: container, form: form, input: input };
    this.handleSubmit = handleSubmit;
  }

  _createClass(SearchElement, [{
    key: 'onFocus',
    value: function onFocus() {
      (0, _domUtils.addClassName)(this.elements.form, 'active');
    }
  }, {
    key: 'onBlur',
    value: function onBlur() {
      (0, _domUtils.removeClassName)(this.elements.form, 'active');
    }
  }, {
    key: 'onSubmit',
    value: function onSubmit(event) {
      return new Promise(function ($return, $error) {
        var _elements, input, container;

        event.preventDefault();
        event.stopPropagation();

        _elements = this.elements, input = _elements.input, container = _elements.container;

        (0, _domUtils.removeClassName)(container, 'error');
        (0, _domUtils.addClassName)(container, 'pending');

        return this.handleSubmit({ query: input.value }).then(function ($await_1) {
          (0, _domUtils.removeClassName)(container, 'pending');
          return $return();
        }.$asyncbind(this, $error), $error);
      }.$asyncbind(this));
    }
  }, {
    key: 'onInput',
    value: function onInput() {
      var container = this.elements.container;


      if (this.hasError) {
        (0, _domUtils.removeClassName)(container, 'error');
        this.hasError = false;
      }
    }
  }, {
    key: 'onKeyUp',
    value: function onKeyUp(event) {
      var _elements2 = this.elements,
          container = _elements2.container,
          input = _elements2.input;


      if (event.keyCode === _constants.ESCAPE_KEY) {
        (0, _domUtils.removeClassName)(container, 'pending');
        (0, _domUtils.removeClassName)(container, 'active');

        input.value = '';

        document.body.focus();
        document.body.blur();
      }
    }
  }, {
    key: 'onKeyPress',
    value: function onKeyPress(event) {
      if (event.keyCode === _constants.ENTER_KEY) {
        this.onSubmit(event);
      }
    }
  }, {
    key: 'setQuery',
    value: function setQuery(query) {
      var input = this.elements.input;

      input.value = query;
    }
  }]);

  return SearchElement;
}();

exports.default = SearchElement;
},{"./constants":2,"./domUtils":3,"nodent-runtime":14}],13:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(require,module,exports){
"use strict";
/*
 * $asyncbind has multiple uses, depending on the parameter list. It is in Function.prototype, so 'this' is always a function
 *
 * 1) If called with a single argument (this), it is used when defining an async function to ensure when
 *      it is invoked, the correct 'this' is present, just like "bind". For legacy reasons, 'this' is given
 *      a memeber 'then' which refers to itself.
 * 2) If called with a second parameter ("catcher") and catcher!==true it is being used to invoke an async
 *      function where the second parameter is the error callback (for sync exceptions and to be passed to
 *      nested async calls)
 * 3) If called with the second parameter===true, it is the same use as (1), but the function is wrapped
 *      in an 'Promise' as well bound to 'this'.
 *      It is the same as calling 'new Promise(this)', where 'this' is the function being bound/wrapped
 * 4) If called with the second parameter===0, it is the same use as (1), but the function is wrapped
 *      in a 'LazyThenable', which executes lazily and can resolve synchronously.
 *      It is the same as calling 'new LazyThenable(this)' (if such a type were exposed), where 'this' is
 *      the function being bound/wrapped
 */

function processIncludes(includes,input) {
    var src = input.toString() ;
    var t = "return "+src ;
    var args = src.match(/.*\(([^)]*)\)/)[1] ;
    var re = /['"]!!!([^'"]*)['"]/g ;
    var m = [] ;
    while (1) {
        var mx = re.exec(t) ;
        if (mx)
            m.push(mx) ;
        else break ;
    }
    m.reverse().forEach(function(e){
        t = t.slice(0,e.index)+includes[e[1]]+t.substr(e.index+e[0].length) ;
    }) ;
    t = t.replace(/\/\*[^*]*\*\//g,' ').replace(/\s+/g,' ') ;
    return new Function(args,t)() ;
}

var $asyncbind = processIncludes({
    zousan:require('./zousan').toString(),
    thenable:require('./thenableFactory').toString()
},
function $asyncbind(self,catcher) {
    "use strict";
    if (!Function.prototype.$asyncbind) {
        Object.defineProperty(Function.prototype,"$asyncbind",{value:$asyncbind,enumerable:false,configurable:true,writable:true}) ;
    }

    if (!$asyncbind.trampoline) {
      $asyncbind.trampoline = function trampoline(t,x,s,e,u){
        return function b(q) {
                while (q) {
                    if (q.then) {
                        q = q.then(b, e) ;
                        return u?undefined:q;
                    }
                    try {
                        if (q.pop) {
                            if (q.length)
                              return q.pop() ? x.call(t) : q;
                            q = s;
                         } else
                            q = q.call(t)
                    } catch (r) {
                        return e(r);
                    }
                }
            }
        };
    }
    if (!$asyncbind.LazyThenable) {
        $asyncbind.LazyThenable = '!!!thenable'();
        $asyncbind.EagerThenable = $asyncbind.Thenable = ($asyncbind.EagerThenableFactory = '!!!zousan')();
    }

    function boundThen() {
        return resolver.apply(self,arguments);
    }

    var resolver = this;
    switch (catcher) {
    case true:
        return new ($asyncbind.Thenable)(boundThen);
    case 0:
        return new ($asyncbind.LazyThenable)(boundThen);
    case undefined:
        /* For runtime compatibility with Nodent v2.x, provide a thenable */
        boundThen.then = boundThen ;
        return boundThen ;
    default:
        return function(){
            try {
                return resolver.apply(self,arguments);
            } catch(ex) {
                return catcher(ex);
            }
        }
    }

}) ;

function $asyncspawn(promiseProvider,self) {
    if (!Function.prototype.$asyncspawn) {
        Object.defineProperty(Function.prototype,"$asyncspawn",{value:$asyncspawn,enumerable:false,configurable:true,writable:true}) ;
    }
    if (!(this instanceof Function)) return ;

    var genF = this ;
    return new promiseProvider(function enough(resolve, reject) {
        var gen = genF.call(self, resolve, reject);
        function step(fn,arg) {
            var next;
            try {
                next = fn.call(gen,arg);
                if(next.done) {
                    if (next.value !== resolve) {
                        if (next.value && next.value===next.value.then)
                            return next.value(resolve,reject) ;
                        resolve && resolve(next.value);
                        resolve = null ;
                    }
                    return;
                }

                if (next.value.then) {
                    next.value.then(function(v) {
                        step(gen.next,v);
                    }, function(e) {
                        step(gen.throw,e);
                    });
                } else {
                    step(gen.next,next.value);
                }
            } catch(e) {
                reject && reject(e);
                reject = null ;
                return;
            }
        }
        step(gen.next);
    });
}

// Initialize async bindings
$asyncbind() ;
$asyncspawn() ;

// Export async bindings
module.exports = {
    $asyncbind:$asyncbind,
    $asyncspawn:$asyncspawn
};

},{"./thenableFactory":15,"./zousan":16}],15:[function(require,module,exports){
module.exports = function() {
    function isThenable(obj) {
        return obj && (obj instanceof Object) && typeof obj.then==="function";
    }

    function resolution(p,r,how) {
        try {
            /* 2.2.7.1 */
            var x = how ? how(r):r ;

            if (p===x) /* 2.3.1 */
                return p.reject(new TypeError("Promise resolution loop")) ;

            if (isThenable(x)) {
                /* 2.3.3 */
                x.then(function(y){
                    resolution(p,y);
                },function(e){
                    p.reject(e)
                }) ;
            } else {
                p.resolve(x) ;
            }
        } catch (ex) {
            /* 2.2.7.2 */
            p.reject(ex) ;
        }
    }

    function _unchained(v){}
    function thenChain(res,rej){
        this.resolve = res;
        this.reject = rej;
    }

    function Chained() {};
    Chained.prototype = {
        resolve:_unchained,
        reject:_unchained,
        then:thenChain
    };
    
    function then(res,rej){
        var chain = new Chained() ;
        try {
            this._resolver(function(value) {
                return isThenable(value) ? value.then(res,rej) : resolution(chain,value,res);
            },function(ex) {
                resolution(chain,ex,rej) ;
            }) ;
        } catch (ex) {
            resolution(chain,ex,rej);
        }
        return chain ;
    }

    function Thenable(resolver) {
        this._resolver = resolver ;
        this.then = then ;
    };

    Thenable.resolve = function(v){
        return Thenable.isThenable(v) ? v : {then:function(resolve){return resolve(v)}};
    };

    Thenable.isThenable = isThenable ;

    return Thenable ;
} ;

},{}],16:[function(require,module,exports){
(function (process,setImmediate){
/* This code is based on:
zousan - A Lightning Fast, Yet Very Small Promise A+ Compliant Implementation
https://github.com/bluejava/zousan
Author: Glenn Crownover <glenn@bluejava.com> (http://www.bluejava.com)
Version 2.3.3
License: MIT */
"use strict";
module.exports = function(tick){
    tick = tick || (typeof process==="object" && process.nextTick) || (typeof setImmediate==="function" && setImmediate) || function(f){setTimeout(f,0)};
    var soon = (function () {
        var fq = [], fqStart = 0, bufferSize = 1024;
        function callQueue() {
            while (fq.length - fqStart) {
                try { fq[fqStart]() } catch(ex) { /* console.error(ex) */ }
                fq[fqStart++] = undefined;
                if (fqStart === bufferSize) {
                    fq.splice(0, bufferSize);
                    fqStart = 0;
                }
            }
        }

        return function (fn) {
            fq.push(fn);
            if (fq.length - fqStart === 1)
                tick(callQueue);
        };
    })();

    function Zousan(func) {
        if (func) {
            var me = this;
            func(function (arg) {
                me.resolve(arg);
            }, function (arg) {
                me.reject(arg);
            });
        }
    }

    Zousan.prototype = {
        resolve: function (value) {
            if (this.state !== undefined)
                return;
            if (value === this)
                return this.reject(new TypeError("Attempt to resolve promise with self"));
            var me = this;
            if (value && (typeof value === "function" || typeof value === "object")) {
                try {
                    var first = 0;
                    var then = value.then;
                    if (typeof then === "function") {
                        then.call(value, function (ra) {
                            if (!first++) {
                                me.resolve(ra);
                            }
                        }, function (rr) {
                            if (!first++) {
                                me.reject(rr);
                            }
                        });
                        return;
                    }
                } catch (e) {
                    if (!first)
                        this.reject(e);
                    return;
                }
            }
            this.state = STATE_FULFILLED;
            this.v = value;
            if (me.c)
                soon(function () {
                    for (var n = 0, l = me.c.length;n < l; n++)
                        STATE_FULFILLED(me.c[n], value);
                });
        },
        reject: function (reason) {
            if (this.state !== undefined)
                return;
            this.state = STATE_REJECTED;
            this.v = reason;
            var clients = this.c;
            if (clients)
                soon(function () {
                    for (var n = 0, l = clients.length;n < l; n++)
                        STATE_REJECTED(clients[n], reason);
                });
        },
        then: function (onF, onR) {
            var p = new Zousan();
            var client = {
                y: onF,
                n: onR,
                p: p
            };
            if (this.state === undefined) {
                if (this.c)
                    this.c.push(client);
                else
                    this.c = [client];
            } else {
                var s = this.state, a = this.v;
                soon(function () {
                    s(client, a);
                });
            }
            return p;
        }
    };

    function STATE_FULFILLED(c, arg) {
        if (typeof c.y === "function") {
            try {
                var yret = c.y.call(undefined, arg);
                c.p.resolve(yret);
            } catch (err) {
                c.p.reject(err);
            }
        } else
            c.p.resolve(arg);
    }

    function STATE_REJECTED(c, reason) {
        if (typeof c.n === "function") {
            try {
                var yret = c.n.call(undefined, reason);
                c.p.resolve(yret);
            } catch (err) {
                c.p.reject(err);
            }
        } else
            c.p.reject(reason);
    }

    Zousan.resolve = function (val) {
        if (val && (val instanceof Zousan))
            return val ;
        var z = new Zousan();
        z.resolve(val);
        return z;
    };
    Zousan.reject = function (err) {
        if (err && (err instanceof Zousan))
            return err ;
        var z = new Zousan();
        z.reject(err);
        return z;
    };

    Zousan.version = "2.3.3-nodent" ;
    return Zousan ;
};

}).call(this,require('_process'),require("timers").setImmediate)
},{"_process":17,"timers":18}],17:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],18:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":17,"timers":18}]},{},[1]);
