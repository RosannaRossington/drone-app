var DroneApp = DroneApp || {};

DroneApp.casualties = 0;

DroneApp.yemen    = [];
DroneApp.pakistan = [];
DroneApp.somalia  = [];

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

DroneApp.changeCenter = function(map){
  var buttons = document.getElementsByClassName("radio");
  
  for( var i = 0; i< buttons.length; i++){
    buttons[i].addEventListener("click", function(){
      // toggle radio buttons

      for(var i = 0; i < buttons.length; i++){
        buttons[i].checked = false;
      }

      this.checked = true;

      // changes position
      if (this.id === "yemen-strikes"){
        map.setCenter({ lat: 15.5527, lng: 48.5164 });
        map.setZoom(7);
        } else if (this.id === "somalia-strikes"){
         map.setCenter({ lat: 5.1521, lng: 46.1996 }); 
         map.setZoom(7);
        } else if (this.id === "pakistan-strikes"){
          map.setCenter({ lat: 30.3753, lng: 69.3451}); 
          map.setZoom(7);
        } else if (this.id === "all-strikes"){
          map.setCenter({ lat: 16.9931, lng: 54.7028 }); 
          map.setZoom(4);
        }
    });
  }
};

DroneApp.requestData = function(){
  var self = this;
  return $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: "http://api.dronestre.am/data",
  }).done(self.loopThroughData);
};

DroneApp.loopThroughData = function(data){
  return $.each(data.strike, function(i, drone){
    // var deaths = drone.deaths_max;
    // var 
    DroneApp.plotData(drone);
    DroneApp.casualties += parseInt(drone.deaths_max);
    // console.log(DroneApp.casualties)
  });
};


DroneApp.plotData = function(drone){
  var latlng = new google.maps.LatLng(drone.lat, drone.lon);
  var marker = new google.maps.Marker({
    position: latlng,
    map: DroneApp.map,
    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
  });
  DroneApp.openInfo(drone, marker);
};

DroneApp.openInfo = function(drone, marker){

  marker.addListener("click", function(){
    var droneLocation   = drone.location;
    var droneDeaths     = drone.deaths_max;
    var droneDate       = new Date(drone.date).toDateString();
    var droneNarrative  = drone.narrative;
    var droneLink       = drone.bij_link;
    var closeButton = document.getElementById("closeButton");

    $("#main-content").remove();

    $("#infoBox").prepend("<div id='main-content'><h3>" + "<span>Location:</span> " + droneLocation + "</h3>" + "<h4>" + "<span>Date: </span>" + droneDate + "</h4>" + "<h4>" + "<span>Deaths: </span>" + droneDeaths + "</h4>" + "<h4>" + "<span>Summary: </span>"+ "<a href='" + droneLink + "'> " + droneNarrative + "</h4> </a></div>");
    $("#infoBox").show();

    closeButton.addEventListener("click", function(){
      $("#infoBox").hide();
    });
  });

}

document.addEventListener("DOMContentLoaded", function(){
  DroneApp.initialize();
})