// import moment from "moment-timezone";
// moment.tz.add("America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0");
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
// handleFilters.dates.dateRange = [
//   new moment(handleFilters.dates.thisYear + "-01-01")
//     .tz("America/New_York")
//     .format(),
//   moment()
//     .tz("America/New_York")
//     .format()
// ];
// set default date range
handleFilters.dates.dateRange = [
  new Date(`${handleFilters.dates.thisYear - 1}/12/31`).toLocaleDateString(
    "en-US",
    {
      timeZone: "America/New_York"
    }
  ),
  new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString(
    "en-US",
    {
      timeZone: "America/New_York"
    }
  )
];
console.log(handleFilters.dates.dateRange);
let hideDatePicker = () => {
  dateSelector.classList.remove("visible");
};
handleFilters.dates.updateDates = dateSelection => {
  switch (dateSelection) {
    case "This year":
      // handleFilters.dates.dateRange[0] = moment
      //   .tz(handleFilters.dates.thisYear + "-01-01", "America/New_York")
      //   .format();
      // handleFilters.dates.dateRange[1] = moment()
      //   .tz("America/New_York")
      //   .format();
      // dateSelector.classList.remove("visible");
      handleFilters.dates.dateRange = [
        new Date(
          `${handleFilters.dates.thisYear - 1}/12/31`
        ).toLocaleDateString("en-US", {
          timeZone: "America/New_York"
        }),
        new Date(
          new Date().setDate(new Date().getDate() + 1)
        ).toLocaleDateString("en-US", {
          timeZone: "America/New_York"
        })
      ];
      console.log(handleFilters.dates.dateRange);
      hideDatePicker();
      break;
    case "Last 30 days":
      // handleFilters.dates.dateRange[0] = moment()
      //   .subtract(30, "days")
      //   .tz("America/New_York")
      //   .format();
      // handleFilters.dates.dateRange[1] = moment()
      //   .tz("America/New_York")
      //   .format();
      // dateSelector.classList.remove("visible");
      handleFilters.dates.dateRange = [
        new Date(
          new Date().setDate(new Date().getDate() - 31)
        ).toLocaleDateString("en-US", {
          timeZone: "America/New_York"
        }),
        new Date(
          new Date().setDate(new Date().getDate() + 1)
        ).toLocaleDateString("en-US", {
          timeZone: "America/New_York"
        })
      ];
      hideDatePicker();
      break;
    case "Last 7 days":
      //   handleFilters.dates.dateRange[0] = moment()
      //     .subtract(7, "days")
      //     .tz("America/New_York")
      //     .format();
      //   handleFilters.dates.dateRange[1] = moment()
      //     .tz("America/New_York")
      //     .format();
      //   dateSelector.classList.remove("visible");
      //   break;
      // case "Custom date range":
      //   dateSelector.classList.add("visible");
      handleFilters.dates.dateRange = [
        new Date(
          new Date().setDate(new Date().getDate() - 8)
        ).toLocaleDateString("en-US", {
          timeZone: "America/New_York"
        }),
        new Date(
          new Date().setDate(new Date().getDate() + 1)
        ).toLocaleDateString("en-US", {
          timeZone: "America/New_York"
        })
      ];
      hideDatePicker();
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
  // handleFilters.dates.dateRange[0] = moment
  //   .tz(from, "America/New_York")
  //   .format();
  from = new Date(from.replace(/-/g, "/"));

  handleFilters.dates.dateRange[0] = new Date(
    new Date(from).setDate(new Date(from).getDate() - 1)
  ).toLocaleDateString("en-US", {
    timeZone: "America/New_York"
  });
  console.log(handleFilters.dates.dateRange);
};
handleFilters.dates.changeToRange = to => {
  // dateRange[1] = moment.tz(to, "America/New_York").format();
  to = new Date(to.replace(/-/g, "/"));

  handleFilters.dates.dateRange[1] = new Date(
    new Date(to).setDate(new Date(to).getDate() + 1)
  ).toLocaleDateString("en-US", {
    timeZone: "America/New_York"
  });
  console.log(handleFilters.dates.dateRange);
};

export default handleFilters;
