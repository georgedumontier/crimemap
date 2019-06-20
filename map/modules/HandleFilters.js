import moment from "moment-timezone";
moment.tz.add("America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0");
const dateSelector = document.querySelector(".dateSelector");

const handleFilters = {
  crimes: {
    checked: ["LARCENY-NON VEHICLE"]
  },
  dates: {}
};
handleFilters.crimes.updateChecked = cb => {
  if (cb.checked == true) {
    handleFilters.crimes.checked.push(cb.name);
  } else {
    let position = handleFilters.crimes.checked.indexOf(cb.name);
    if (~position) {
      handleFilters.crimes.checked.splice(position, 1);
    }
  }
};
handleFilters.dates.thisYear = new Date().getFullYear();
handleFilters.dates.dateRange = [
  new moment(handleFilters.dates.thisYear + "-01-01")
    .tz("America/New_York")
    .format(),
  moment()
    .tz("America/New_York")
    .format()
];
handleFilters.dates.updateDates = dateSelection => {
  switch (dateSelection) {
    case "This year":
      handleFilters.dates.dateRange[0] = moment
        .tz(handleFilters.dates.thisYear + "-01-01", "America/New_York")
        .format();
      handleFilters.dates.dateRange[1] = moment()
        .tz("America/New_York")
        .format();
      dateSelector.classList.remove("visible");
      break;
    case "Last 30 days":
      handleFilters.dates.dateRange[0] = moment()
        .subtract(30, "days")
        .tz("America/New_York")
        .format();
      handleFilters.dates.dateRange[1] = moment()
        .tz("America/New_York")
        .format();
      dateSelector.classList.remove("visible");
      break;
    case "Last 7 days":
      handleFilters.dates.dateRange[0] = moment()
        .subtract(7, "days")
        .tz("America/New_York")
        .format();
      handleFilters.dates.dateRange[1] = moment()
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
};
handleFilters.dates.changeFromRange = from => {
  handleFilters.dates.dateRange[0] = moment
    .tz(from, "America/New_York")
    .format();
};
handleFilters.dates.changeToRange = to => {
  dateRange[1] = moment.tz(to, "America/New_York").format();
};

export default handleFilters;
