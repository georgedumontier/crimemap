const dateSelector = document.querySelector(".dateSelector");

// Sets the initially checked filter - would also need to change the input to match
const handleFilters = {
  crimes: {
    checked: ["LARCENY-NON VEHICLE"]
  },
  dates: {}
};
// compares which filters are checked to what's in the array and updates accordingly
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

handleFilters.dates.thisYear = new Date().getFullYear(); // set the current year in the object

//set default date range for filtering to this year
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
//hide the date picker for custom date filtering
let hideDatePicker = () => {
  dateSelector.classList.remove("visible");
};

//switch case for the different date filtering options
handleFilters.dates.updateDates = dateSelection => {
  switch (dateSelection) {
    case "This year":
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
      hideDatePicker();
      break;
    case "Last 30 days":
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
      //maybe should do more error handling here.
      alert(
        "Something went wrong when selecting a date, please refresh the page and try again."
      );
  }
};
// update the first part of the custom date range filtering. the 'from range'
handleFilters.dates.changeFromRange = from => {
  from = new Date(from.replace(/-/g, "/"));

  handleFilters.dates.dateRange[0] = new Date(
    new Date(from).setDate(new Date(from).getDate() - 1)
  ).toLocaleDateString("en-US", {
    timeZone: "America/New_York"
  });
};
// update the second part of the custom date range filtering. the 'to range'
handleFilters.dates.changeToRange = to => {
  // this is a weird hack. By replacing the hyphens with slashes, it solves the issue of timezones being off by just an hour.
  to = new Date(to.replace(/-/g, "/"));

  handleFilters.dates.dateRange[1] = new Date(
    new Date(to).setDate(new Date(to).getDate() + 1)
  ).toLocaleDateString("en-US", {
    timeZone: "America/New_York"
  });
};

export default handleFilters; // Just export the object we've been adding to and updating. Modules are great.
