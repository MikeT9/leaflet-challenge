// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data);
});

function marColor(z) {
      // Conditionals for countries points
      var color = "";
      if (z > 90) {
        color = 'rgb(255,0,0)';
      }
      else if (z > 70) {
        color = 'rgb(204,51,0)';
      }
      else if (z > 50) {
        color = 'rgb(153,102,0)';
      }
      else if (z > 30) {
        color = 'rgb(102,153,0)';
      }
      else if (z > 10) {
        color = 'rgb(51,204,0)';
      }
      else {
        color = 'rgb(0,255,0)';
      }
      return color
}

function pointToLayer(feat, coord) {
    return L.circleMarker(coord, {
    color: marColor(feat.geometry.coordinates[2]),
    fillColor: marColor(feat.geometry.coordinates[2]),
    fillOpacity: 0.25,
    radius: ((feat.properties.mag)*10),
    })
};

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend to display information about our map
  var info = L.control({
    position: "bottomright"
  });

  // When the layer control is added, insert a div with the class of "legend"
  info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML='<h2>Earthquake Depth</h2>'+
    '<p style="background:rgb(255,0,0)"><b>+90:</b></p></br>'+
    '<p style="background:rgb(204,51,0)"><b>70-90:</b></p></br>'+
    '<p style="background:rgb(153,102,0)"><b>50-70:</b></p></br>'+
    '<p style="background:rgb(102,153,0)"><b>30-50:</b></p></br>'+
    '<p style="background:rgb(51,204,0)"><b>10-30:</b></p></br>'+
    '<p style="background:rgb(0,255,0)"><b><10:</b></p>'
    return div;
  };
  // Add the info legend to the map
  info.addTo(myMap);
}
