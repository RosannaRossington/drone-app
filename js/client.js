var DroneApp = DroneApp || {};

DroneApp.markers  = [];

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

  this.markerclusterer = new MarkerClusterer(this.map, [], {
    minimumClusterSize: 10
  });

  this.requestData();
  this.changeMapPosition(this.map);
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
  $.each(data.strike, function(i, drone){
    DroneApp.incrementVariables(drone);
    DroneApp.plotData(drone);
  });

  DroneApp.sideBarInfo(DroneApp.stats.allStrikes);
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

  // DroneApp.sideBarInfo(DroneApp.stats.allStrikes);
};

// Plots the data onto the map with markers
DroneApp.plotData = function(drone){
  DroneApp.markerclusterer.clearMarkers();
  var latlng = new google.maps.LatLng(drone.lat, drone.lon);
  var marker = new google.maps.Marker({
    position: latlng,
    map: DroneApp.map,
    icon: "http://maps.google.com/mapfiles/ms/icons/red.png"
  });

  DroneApp.markers.push(marker);
  DroneApp.popUpWindow(drone, marker);
  DroneApp.markerclusterer.addMarkers(DroneApp.markers);
};

// Adds the drones information to an info window
DroneApp.popUpWindow = function(drone, marker){
  marker.addListener("click", function(){
    this.closeButton     = document.getElementById("closeButton");
    this.droneCountry    = drone.country;
    this.droneLocation   = drone.location;
    this.droneDeaths     = drone.deaths_max;
    this.droneDate       = new Date(drone.date).toDateString();
    this.droneNarrative  = drone.narrative;
    this.droneLink       = drone.bij_link;
    this.droneTarget     = drone.target;
    
    if (this.droneTarget === ""){
      this.droneTarget = "Unknown";
    } else {
      this.droneTarget = drone.target;
    }

    $("#main-content").remove();

    $("#infoBox").prepend("<div id='main-content'><h3 class='location'>" + this.droneLocation + ", " + this.droneCountry + "</h3>" + "<h4>" + "<span>Date: </span> <i class='fa fa-calendar-o' aria-hidden='true'></i> " + this.droneDate + "</h4>" + "<h4>" + "<span>Deaths: </span><i class='fa fa-male' aria-hidden='true'></i> " + this.droneDeaths + "</h4>" + "<h4><span>Target</span>: <i class='fa fa-bullseye' aria-hidden='true'></i> " + this.droneTarget + "</h4> <h4>" + "<span>Summary: </span>"+ "<a href='" + this.droneLink + "'> " + this.droneNarrative + "</h4> </a></div>");
    $("#infoBox").show();

    this.closeButton.addEventListener("click", function(){
      $("#infoBox").hide();
    });
  });
};

// Changes the contents of the left hand bar and changes the maps position
DroneApp.changeMapPosition = function(map){
  var self = this;
  self.buttons = document.getElementsByClassName("radio");

  for (var i = 0; i< self.buttons.length; i++){
    self.buttons[i].addEventListener("click", function(){
      for (var i = 0; i < self.buttons.length; i++){
        self.buttons[i].checked = false;
      }

      this.checked = true;

      if (this.id === "yemen-strikes"){
        map.setCenter({ lat: 16.160990, lng: 46.088293});
        map.setZoom(7);
        DroneApp.sideBarInfo(DroneApp.stats.yemenStrikes);  
      } else if (this.id === "somalia-strikes"){
        map.setCenter({ lat: 2.972296, lng: 43.626871}); 
        map.setZoom(7);
        DroneApp.sideBarInfo(DroneApp.stats.somaliaStrikes);
      } else if (this.id === "pakistan-strikes"){
        map.setCenter({ lat: 32.085580, lng: 69.194006}); 
        map.setZoom(7);
        DroneApp.sideBarInfo(DroneApp.stats.pakistanStrikes);
      } else if (this.id === "all-strikes"){
        map.setCenter({ lat: 16.9931, lng: 54.7028 }); 
        map.setZoom(4);
        DroneApp.sideBarInfo(DroneApp.stats.allStrikes);
      };
    });
  };
};

DroneApp.sideBarInfo = function(selectedRegion){

  $("#country-stats").remove();
  $("#filter").append("<div id='country-stats'><h3><span>Strikes:</span> " + selectedRegion.strikes + "</h3><h3><span>Deaths:</span> " + selectedRegion.deaths + "</h3><h3><span>Injuries:</span> " + selectedRegion.injuries) + "</h3></div>";

  $("#strikes-stats").html(0);
  $("#deaths-stats").html(0);
  $("#injuries-stats").html(0);

  var strikeTimer = setInterval(function() {
    var strikes = parseFloat($("#strikes-stats").html());
    $("#strikes-stats").html(strikes+=1);
    if(strikes >= selectedRegion.strikes) clearInterval(strikeTimer);
  }, 20);

  var deathsTimer = setInterval(function() {
    var deaths = parseFloat($("#deaths-stats").html());
    $("#deaths-stats").html(deaths+=1);
    if(deaths >= selectedRegion.deaths) clearInterval(deathsTimer);
  }, 1);

  var injuriesTimer = setInterval(function() {
    var injuries = parseFloat($("#injuries-stats").html());
    $("#injuries-stats").html(injuries+=1);
    if(injuries >= selectedRegion.injuries) clearInterval(injuriesTimer);
  }, 10);
};

document.addEventListener("DOMContentLoaded", function(){
  DroneApp.initialize();
});

