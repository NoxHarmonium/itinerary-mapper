var main = (function ($, google) {
  "use strict";
  var itineraryData, methods, markers;
  var gm = google.maps;
  var map;

  var jqxhr = $.getJSON( "data/itinerary.json" )
  .done(function(result) {
      itineraryData = result;
      methods.init();
      methods.zoomToMarkers();
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

      var points = itineraryData.points;

      if (!points)
      {
        console.log("Could not load points array from itinerary JSON file");
        return;
      }

      var point, loc, loc_, marker, isLastPoint, destPoint, line, loc2;
      for(i = 0; i < points.length; i++)
      {
        point = points[i];
        loc = point.location;
        loc_ = new gm.LatLng(loc.latitude, loc.longitude);
        var marker = new gm.Marker({
          map: map,
          position: loc_
        });
        markers.push(loc_);
        isLastPoint = (i === points.length - 1);

        if (point.type === "transit" && !isLastPoint)
        {
          destPoint = points[i+1];
          loc2 = destPoint.location;

          line = new gm.Polyline({
            map: map,
            path: [
              new gm.LatLng(loc.latitude, loc.longitude),
              new gm.LatLng(loc2.latitude, loc2.longitude) 
            ]
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

    }



  }






});

google.maps.event.addDomListener(window, 'load', function()
  {
    main($, google);
  }
);
