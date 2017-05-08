import { $i } from './browser';

function simplifyCoord(x) {
  return parseInt(x * 100);
}

export default (container, latitude, longitude, onCoordinatesChanged) => {
  const latlon = new google.maps.LatLng(latitude, longitude);
  const myOptions = {
    center: latlon,
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    navigationControlOptions: {
      style: google.maps.NavigationControlStyle.SMALL
    }
  };

  const map = new google.maps.Map(container, myOptions);
  const marker = new google.maps.Marker({
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: latlon,
    map: map,
    title: 'You are here!'
  });

  function setCoordinates(latitude, longitude) {
    marker.setPosition(new google.maps.LatLng(latitude, longitude));
    map.panTo(new google.maps.LatLng(latitude, longitude));
  }

  google.maps.event.addListener(map, 'rightclick', event => {
    setCoordinates(event.latLng.lat(), event.latLng.lng());
    onCoordinatesChanged(simplifyCoord(event.latLng.lat()), simplifyCoord(event.latLng.lng()));
    event.stop();
  });
  google.maps.event.addListener(marker, 'dragend', event => {
    onCoordinatesChanged(simplifyCoord(event.latLng.lat()), simplifyCoord(event.latLng.lng()));
    event.stop();
  });
  onCoordinatesChanged(simplifyCoord(latitude), simplifyCoord(longitude));


  const input = document.createElement('input');
  input.setAttribute('class', 'search-box');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('placeholder', $i('field_search_box'));
  container.appendChild(input);

  const searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  map.addListener('bounds_changed', function () {
    searchBox.setBounds(map.getBounds());
  });
  let markers = [];
  searchBox.addListener('places_changed', function () {
    const places = searchBox.getPlaces();
    if (places.length === 0) {
      return;
    }
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    const bounds = new google.maps.LatLngBounds();
    places.forEach(function (place) {
      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
  return setCoordinates;
};