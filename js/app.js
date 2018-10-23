$(function () {

    var modal = {

        locationList: [
            { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
            { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
            { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
            { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
            { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
            { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
        ]

    };

    var listView = {

    };
    var mapView = {
        init:function(){
            this.map = new google.maps.Map($('.map-area'), {
                center: {lat: 40.7413549, lng: -73.9980244},
                zoom: 13,
                styles: styles,
                mapTypeControl: false
              });
            this.largeInfowindow = new google.maps.InfoWindow();
            this.defaultIcon = makeMarkerIcon('0091ff');
            this.highlightedIcon = makeMarkerIcon('FFFF24');
            this.markers=[];
            this.bounds = new google.maps.LatLngBounds();



        },
        renderMap:function(currentList){
            for (var i = 0; i < currentList.length; i++) {
                // Get the position from the location array.
                var position = currentList[i].location;
                var title = currentList[i].title;
                // Create a marker per location, and put into markers array.
                var marker = new google.maps.Marker({
                  position: position,
                  title: title,
                  animation: google.maps.Animation.DROP,
                  icon: this.defaultIcon,
                  id: i
                });
                // Push the marker to our array of markers.
                this.markers.push(marker);
                // Create an onclick event to open the large infowindow at each marker.
                marker.addListener('click', function() {
                  populateInfoWindow(this, this.largeInfowindow);
                });
                // Two event listeners - one for mouseover, one for mouseout,
                // to change the colors back and forth.
                marker.addListener('mouseover', function() {
                  this.setIcon(this.highlightedIcon);
                });
                marker.addListener('mouseout', function() {
                  this.setIcon(this.defaultIcon);
                });
                this.bounds.extend(markers[i].position);

              }
              this.map.fitBounds(bounds);

        }

    };
    var location = function (data) {
        this.title = ko.observable(data.title);
        this.lacation = ko.observable(data.location);
    }

    var viewModel = function () {
      var self=this;
        var locations = modal.locationList;
        var locationtList = ko.observableArray([]);
        locations.forEach(function (loc) {
            locationtList.push(new location(loc));
        })
         this.currentList = ko.observableArray(locationtList());
         mapView.init();
         mapView.renderMap(self.currentList());
         this.changeList=function(){
            var value = $('.search-field').val().toLowerCase();
            self.currentList(locationtList().filter(function(elem){
               return elem.title().toLowerCase().includes(value)
            }))
            mapView.renderMap(self.currentList());

         }
    };

    $('.list-btn').on('click', function () {
        $('.location-list').toggleClass('show');
    })
    ko.applyBindings(new viewModel());
})