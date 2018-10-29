
function initMap() {
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

    var mapView = {

        init: function () {

            this.map = new google.maps.Map(document.getElementById('map-area'), {
                center: { lat: 40.7713024, lng: -73.9632393 },
                zoom: 13,
                // styles: styles,
            });
            this.largeInfowindow = new google.maps.InfoWindow();
            this.defaultIcon = this.makeMarkerIcon('0091ff');
            this.highlightedIcon = this.makeMarkerIcon('FFFF24');
            this.markers = [];
            this.bounds = new google.maps.LatLngBounds();



        },
        clearMarker: function () {
            for (var i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(null);
            }
        },
        renderMap: function (currentList) {
            this.markers = [];

            for (var i = 0; i < currentList.length; i++) {
                // Get the position from the location array.
                var position = {
                    lat: currentList[i].lat(),
                    lng: currentList[i].lng()
                }
                var title = currentList[i].title();

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
                marker.addListener('click', function () {
                    mapView.populateInfoWindow(this, mapView.largeInfowindow);

                });
                // Two event listeners - one for mouseover, one for mouseout,
                // to change the colors back and forth.
                marker.addListener('mouseover', function () {
                    this.setIcon(mapView.highlightedIcon);
                });
                marker.addListener('mouseout', function () {
                    this.setIcon(mapView.defaultIcon);
                });
                this.markers[i].setMap(this.map);
                this.bounds.extend(this.markers[i].position);

            }

            this.map.fitBounds(this.bounds);

        },
        populateInfoWindow: function (marker, infowindow) {
            // Check to make sure the infowindow is not already opened on this marker.
            if (infowindow.marker != marker) {
                // Clear the infowindow content to give the streetview time to load.
                infowindow.setContent('');
                infowindow.marker = marker;
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function () {
                    infowindow.marker = null;
                });
                var streetViewService = new google.maps.StreetViewService();
                var radius = 50;
                // In case the status is OK, which means the pano was found, compute the
                // position of the streetview image, then calculate the heading, then get a
                // panorama from that and set the options
                function getStreetView(data, status) {
                    if (status == google.maps.StreetViewStatus.OK) {
                        var nearStreetViewLocation = data.location.latLng;
                        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);

                        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                        var panoramaOptions = {
                            position: nearStreetViewLocation,
                            pov: {
                                heading: heading,
                                pitch: 30
                            }
                        };
                        var panorama = new google.maps.StreetViewPanorama(
                            document.getElementById('pano'), panoramaOptions);
                    } else {
                        infowindow.setContent('<div>' + marker.title + '</div>' +
                            '<div>No Street View Found</div>');
                    }
                }
                // Use streetview service to get the closest streetview image within
                // 50 meters of the markers position
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    marker.setAnimation(null); // End animation on marker after 2 seconds
                }, 2000);
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                // Open the infowindow on the correct marker.
                infowindow.open(mapView.map, marker);
            }
        },
        makeMarkerIcon: function (markerColor) {
            var markerImage = new google.maps.MarkerImage(
                'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
                '|40|_|%E2%80%A2',
                new google.maps.Size(21, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34),
                new google.maps.Size(21, 34));
            return markerImage;
        }
        

    };
    var location = function (data) {
        this.title = ko.observable(data.title);
        this.lat = ko.observable(data.location.lat);
        this.lng = ko.observable(data.location.lng);

    }

    var viewModel = function () {
        var self = this;
        var locations = modal.locationList;
        var locationtList = ko.observableArray([]);
        var defultWeather='../Neighborhood-Map/images/default-weather.png';
        this.imagePath = ko.observable(defultWeather);
        this.temperature = ko.observable('');
        this.weather = ko.observable('');
        this.filterValue=ko.observable('');


        locations.forEach(function (loc) {
            locationtList.push(new location(loc));
        })
        this.currentList = ko.observableArray(locationtList());
        mapView.init();
        mapView.renderMap(self.currentList());

        this.changeList = function () {
            var value = self.filterValue().toLowerCase();
            self.currentList(locationtList().filter(function (elem) {
                return elem.title().toLowerCase().includes(value)
            }))
            mapView.clearMarker();
            mapView.renderMap(self.currentList());

        }
        this.showInfo = function (index, clickedLocation) {
            mapView.populateInfoWindow(mapView.markers[index], mapView.largeInfowindow);
            self.showweather(mapView.markers[index]);
        };
        this.showweather=function(marker){
            var lat = marker.position.lat();
            var lon = marker.position.lng();
            var apiEndpoint = 'https://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lon+'&appid=03d50e04ac1ff057206fb92d6d047092';
            $.getJSON(apiEndpoint, data => {
                self.imagePath(`https://openweathermap.org/img/w/${data.weather[0].icon}.png`);
                self.temperature (data.main.temp - 273.15);
                self.weather(data.weather[0].main);
            }).fail(() => {
                self.imagePath(defultWeather)
                self.temperature ('');
                self.weather("Cannot fetch weather data from the servers. Please try again later.");
        });

        }


    }


    $('.list-btn').on('click', function () {
        $('.location-list').toggleClass('show');
    })
    ko.applyBindings(new viewModel());
}
function errorHandling() {
    $('#map-area').html('<div class="map-fail>Google Maps has failed to load. Please try again.</div>')
  }