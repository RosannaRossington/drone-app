var DroneApp = DroneApp || {};

DroneApp.markers  = [];
DroneApp.markerCluster;

DroneApp.stats = {
  allStrikes: {
    strikes: 0,
    deaths: 0,
    injuries: 0
  },
  yemenStrikes: {
    strikes: 0,
    deaths: 0,
    injuries: 0
  },
  pakistanStrikes: {
    strikes: 0,
    deaths: 0,
    injuries: 0
  },
  somaliaStrikes: {
    strikes: 0,
    deaths: 0,
    injuries: 0
  }
}

// Initializes the map
DroneApp.initialize = function(){
  this.canvas = document.getElementById("map");
  this.map = new google.maps.Map(this.canvas, {
    zoom: 4,
    center: { lat: 16.9931, lng: 54.7028 },
    styles: [{"featureType":"landscape","elementType":"geometry","stylers":[{"saturation":"-100"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text","stylers":[{"color":"#545454"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"saturation":"-87"},{"lightness":"-40"},{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry.fill","stylers":[{"color":"#f0f0f0"},{"saturation":"-22"},{"lightness":"-16"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.highway.controlled_access","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"saturation":"-52"},{"hue":"#00e4ff"},{"lightness":"-16"}]}]
  });

  DroneApp.requestData();
  DroneApp.changeCenter(this.map);
};

// Changes the contents of the left hand bar and changes the maps position
DroneApp.changeCenter = function(map){
  var buttons = document.getElementsByClassName("radio");
  
  for( var i = 0; i< buttons.length; i++){
    buttons[i].addEventListener("click", function(){
      for(var i = 0; i < buttons.length; i++){
        buttons[i].checked = false;
      }
  this.checked = true;

      // changes position
  if (this.id === "yemen-strikes"){
    map.setCenter({ lat: 15.5527, lng: 48.5164 });
    map.setZoom(7);
    $("#country-stats").remove()
    $("#filter").append("<div id='country-stats'> <h3>Strikes: " + DroneApp.stats.yemenStrikes.strikes + "</h3> <h3>Deaths: " + DroneApp.stats.yemenStrikes.deaths + "</h3> <h3>Injuries: " + DroneApp.stats.yemenStrikes.injuries) + "</h3></div>";
    } else if (this.id === "somalia-strikes"){
        map.setCenter({ lat: 5.1521, lng: 46.1996 }); 
        map.setZoom(7);
        $("#country-stats").remove()
        $("#filter").append("<div id='country-stats'> <h3>Strikes: " + DroneApp.stats.somaliaStrikes.strikes + "</h3> <h3>Deaths: " + DroneApp.stats.somaliaStrikes.deaths + "</h3> <h3>Injuries: " + DroneApp.stats.somaliaStrikes.injuries) + "</h3></div>";
    } else if (this.id === "pakistan-strikes"){
        map.setCenter({ lat: 30.3753, lng: 69.3451}); 
        map.setZoom(7);
        $("#country-stats").remove()
        $("#filter").append("<div id='country-stats'> <h3>Strikes: " + DroneApp.stats.pakistanStrikes.strikes + "</h3> <h3>Deaths: " + DroneApp.stats.pakistanStrikes.deaths + "</h3> <h3>Injuries: " + DroneApp.stats.pakistanStrikes.injuries) + "</h3></div>";
    } else if (this.id === "all-strikes"){
        map.setCenter({ lat: 16.9931, lng: 54.7028 }); 
        map.setZoom(4);
        $("#country-stats").remove()
        $("#filter").append("<div id='country-stats'> <h3>Strikes: " + DroneApp.stats.allStrikes.strikes + "</h3> <h3>Deaths: " + DroneApp.stats.allStrikes.deaths + "</h3> <h3>Injuries: " + DroneApp.stats.allStrikes.injuries) + "</h3></div>";
      };
    });
  };
};

// Requests the API data
DroneApp.requestData = function(){
  var self = this;
  return $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: "http://api.dronestre.am/data",
  }).done(self.loopThroughData);
};

// Loops through the data
DroneApp.loopThroughData = function(data){
  return $.each(data.strike, function(i, drone){
    DroneApp.incrementVariables(drone);
    DroneApp.plotData(drone);
  });
};

// Increments the variables and displays the initial data
DroneApp.incrementVariables = function(drone){
   DroneApp.stats.allStrikes.strikes += 1;
   DroneApp.stats.allStrikes.deaths += +drone.deaths_max || 0;
   DroneApp.stats.allStrikes.injuries += +drone.injuries || 0;
   
   if (drone.country === "Yemen"){
       DroneApp.stats.yemenStrikes.strikes += 1;
       DroneApp.stats.yemenStrikes.deaths += +drone.deaths_max || 0;
       DroneApp.stats.yemenStrikes.injuries += +drone.injuries || 0;
   } else if (drone.country === "Somalia"){
       DroneApp.stats.somaliaStrikes.strikes += 1;
       DroneApp.stats.somaliaStrikes.deaths += +drone.deaths_max || 0;
       DroneApp.stats.somaliaStrikes.injuries += +drone.injuries || 0;
   } else if (drone.country === "Pakistan"){
       DroneApp.stats.pakistanStrikes.strikes += 1;
       DroneApp.stats.pakistanStrikes.deaths += +drone.deaths_max || 0;
       DroneApp.stats.pakistanStrikes.injuries += +drone.injuries || 0;
  };

  $("#country-stats").remove()
  $("#filter").append("<div id='country-stats'> <h3>Strikes: " + DroneApp.stats.allStrikes.strikes + "</h3> <h3>Deaths: " + DroneApp.stats.allStrikes.deaths + "</h3> <h3>Injuries: " + DroneApp.stats.allStrikes.injuries) + "</h3></div>";
};

// Plots the data onto the map with markers
DroneApp.plotData = function(drone){
  var latlng = new google.maps.LatLng(drone.lat, drone.lon);
  var marker = new google.maps.Marker({
    position: latlng,
    map: DroneApp.map,
    icon: "http://maps.google.com/mapfiles/ms/icons/red.png"
  });

  // DroneApp.markers.push(marker);
  // console.log(marker.position.lat());
  // console.log(marker.position.lng());
  // DroneApp.markers.push([marker.position.lat(), marker.position.lng()]);

  // // console.log(DroneApp.markers);

  // var options = {
  //           imagePath: '/node_modules/js-marker-clusterer/images/m1'
  //       };

  // DroneApp.markerCluster = new MarkerClusterer(DroneApp.map, DroneApp.markers, options);

  // // console.log(DroneApp.markerCluster.getTotalClusters());

  // DroneApp.markerCluster.addMarker(DroneApp.markers, true);

  DroneApp.infoWindow(drone, marker);
};

// Adds the drones information to an info window
DroneApp.infoWindow = function(drone, marker){
  marker.addListener("click", function(){
    var closeButton = document.getElementById("closeButton");
    var droneCountry    = drone.country;
    var droneLocation   = drone.location;
    var droneDeaths     = drone.deaths_max;
    var droneDate       = new Date(drone.date).toDateString();
    var droneNarrative  = drone.narrative;
    var droneLink       = drone.bij_link;
    var droneTarget     = drone.target;
    
    if (droneTarget === ""){
      droneTarget = "Unknown";
    } else {
      droneTarget = drone.target;
    }

    $("#main-content").remove();

    $("#infoBox").prepend("<div id='main-content'><h3>" + "<span>Location:</span> " + droneLocation + ", " + droneCountry + "</h3>" + "<h4>" + "<span>Date: </span>" + droneDate + "</h4>" + "<h4>" + "<span>Deaths: </span>" + droneDeaths + "</h4>" + "<h4><span>Target</span>: " + droneTarget + "</h4> <h4>" + "<span>Summary: </span>"+ "<a href='" + droneLink + "'> " + droneNarrative + "</h4> </a></div>");
    $("#infoBox").show();

    closeButton.addEventListener("click", function(){
      $("#infoBox").hide();
    });

  });

};

document.addEventListener("DOMContentLoaded", function(){
  DroneApp.initialize();
});