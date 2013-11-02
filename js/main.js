var main = (function ($, google, Date) {
  "use strict";
  var itineraryData, methods, markers;
  var gm = google.maps;
  var map;
  var currentMarker;

  var jqxhr = $.getJSON( "data/itinerary.json" )
  .done(function(result) {
      itineraryData = result;
      methods.init();
      methods.zoomToMarkers();
      methods.setCurrentActivityForDate(Date.today());
      $('#datepicker').datepicker();

  })
  .fail(function(error) {
    console.log( "Could not load itinerary data: " + error.statusText );
  })

  methods = 
  {
    "init" : function()
    {
      var i;
      markers = [];

      var mapOptions = {
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      map = new google.maps.Map(document.getElementById("map-canvas"),
          mapOptions);

       // Define a symbol using a predefined path (an arrow)
      // supplied by the Google Maps JavaScript API.
      var lineSymbol = {
        path: gm.SymbolPath.FORWARD_CLOSED_ARROW
      };

      var points = itineraryData.points;

      if (!points)
      {
        console.log("Could not load points array from itinerary JSON file");
        return;
      }

      var point, loc, loc_, marker, isLastPoint, destPoint, line, loc2, transitType, icon;
      

      for(i = 0; i < points.length; i++)
      {
        point = points[i];
        loc = point.location;
        loc_ = new gm.LatLng(loc.latitude, loc.longitude);
        icon = null;
        if (point.type === "transit")
        {
          transitType = itineraryData.transit_types[point.transit_type];
          if (transitType)
          {
            icon = transitType.icon;
          }
        }
       
        isLastPoint = (i === points.length - 1);

        if (point.type === "transit" && !isLastPoint)
        {
           marker = new gm.Marker({
            map: map,
            position: loc_,
            icon: icon
          });
          markers.push(loc_);

          destPoint = points[i+1];
          loc2 = destPoint.location;

          line = new gm.Polyline({
            map: map,
            path: [
              new gm.LatLng(loc.latitude, loc.longitude),
              new gm.LatLng(loc2.latitude, loc2.longitude) 
            ],
            icons: [{
              icon: lineSymbol,
              offset: '100%'
            }],
            strokeWeight: 1.5,
            strokeColor: "#555555"

          });
        }
      }
    },
    "zoomToMarkers": function () 
    {
      // Thanks: http://blog.shamess.info/2009/09/29/zoom-to-fit-all-markers-on-google-maps-api-v3/
      var bounds = new gm.LatLngBounds();
      for (var i = 0; i < markers.length; i++) {
        bounds.extend (markers[i]);
      }
      map.fitBounds (bounds);

    },
    "setCurrentActivityForDate": function(date)
    {
      var point, pointDate;
      var points = itineraryData.points;
      var currentIndex = points.length - 1;
      for(var i = 0; i < points.length; i++)
      {
        
        point = points[i];
        pointDate = Date.parse(point.datetime);
        //console.log(pointDate + ">" + date);
        if (pointDate.isAfter(date))
        {
          currentIndex = i-1;
          break;
        }
      }

      var text = "";
      if (currentIndex < 0)
      {
        text = "Current Activity: " + " Waiting to start";
        point = points[0];
      }
      else
      {
        text = "Current Activity: " + points[currentIndex].title;
        point = points[currentIndex];
      }
      
      $("#activity-bar>span.link-text").text(text);
      $("#current-time").text(date.toString('dddd, MMMM d, yyyy'));

      var loc = point.location;
      var loc_ = new gm.LatLng(loc.latitude, loc.longitude);

      if (currentMarker)
      {
        currentMarker.setMap(null);
      }

      currentMarker = new gm.Marker({
            map: map,
            position: loc_,
          });    

    }

  }






});

google.maps.event.addDomListener(window, 'load', function()
  {
    main($, google, Date);
  }
);
