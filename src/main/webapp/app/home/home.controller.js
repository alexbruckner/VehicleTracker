(function() {
    'use strict';

    angular
        .module('vehicleTrackerApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal', 'LoginService', 'Stammdaten', 'AlertService', 'uiGmapIsReady', 'Location'];

    function HomeController ($scope, Principal, LoginService, Stammdaten, AlertService, uiGmapIsReady, Location) {
        var vm = this;
        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }

        /** Map settings **/
        vm.map = null;
        vm.options = null;

        vm.markers = null;
        vm.directionsDisplay = new google.maps.DirectionsRenderer({draggable: true, markerOptions: {visible: false}});
        vm.directionsService = new google.maps.DirectionsService();

        initMap();
        function initMap() {
            vm.map = {center: {latitude: 51.219053, longitude: 4.404418}, markers: [], zoom: 14, control: {}};
            vm.options = {scrollwheel: false};
            vm.markers = vm.map.markers;
        }

        uiGmapIsReady.promise().then(function (maps) {
            vm.directionsDisplay.setMap(maps[0].map);
            calcRoute(50.850340, 4.3053499, 51.219053, 4.404418);
        });

        function setMarkerAndCenterAround(id, title, latitude, longitude) {
            var marker;

            marker = {
                id: id,
                coords: {
                    latitude: latitude,
                    longitude: longitude,
                },
                title: title
            };
            vm.map.markers = [];
            vm.map.markers.push(marker); // add marker to array
            vm.map.center.latitude = latitude;
            vm.map.center.longitude = longitude;
        }

        setMarkerAndCenterAround(1, 'ActiveDriver', 51.0504641, 4.30425);

        function calcRoute(latitudeTo, longitudeTo, latitudeFrom, longitudeFrom) {
            var request = {
                origin: {lat: latitudeFrom, lng: longitudeFrom},
                destination: {lat: latitudeTo, lng: longitudeTo},
                travelMode: google.maps.TravelMode["DRIVING"]
            };
            vm.directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    vm.directionsDisplay.setDirections(response);
                }
            });
        }

        //-----STAMMDATEN -----//

        function loadStammdaten() {
            Stammdaten.query({}, onSuccess, onError);
            function onSuccess(data) {
                vm.stammdaten = data;

            }
            function onError(error) {
                AlertService.error(error.data.message);
            }
        }

        loadStammdaten();

        $scope.showOnMap = function(deviceId) {
            Location.byDeviceId({'deviceId':deviceId}, onSuccess, onError);
            function onSuccess(data) {
                setMarkerAndCenterAround(deviceId, deviceId, data.latitude, data.longitude);
            }
            function onError(error) {
                AlertService.error(error.data.message);
            }
        };


    }
})();
