# Atlanta Crime Blotter

## Downloads, parses, and maps crime data from Atlanta PD

There are two parts to this app. The scrape folder is responsible for grabbing fresh data from the Atlanta PD, unzipping it, parsing it, and saving it as json. The map folder uses D3, leaflet, and OpenStreetMaps to display and filter the data.

---

### Scrape

You can run the scraper with `npm run dev` to get fresh data.

It's a node app that downloads a csv file from the Atlanta PD website, unzips it, converts it to json, and filters the data a little bit before saving the new data in /map . For more about how this works, check out scrape/index.js

### Map

the /map folder contains all the front end code. It uses D3, leaflet, and OpenStreetMap to handle the mapping. The map tiles themselves come from Stamen Design. Be sure to visit the /map directory in your browser to view the actual map. For more info about how the mapping works, check out /map/index.html and /map/script.js.
