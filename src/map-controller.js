'use strict'

var gMap
var gIsMobileMenuOpen = false

function init() {
  renderLocations()
  renderMarkers()
}

function initMap(lat = 31.977334843289025, lng = 34.77963258643429) {
  var elMap = document.querySelector('.map')
  var options = {
    center: { lat, lng },
    zoom: 15,
  }

  gMap = new google.maps.Map(elMap, options)

  gMap.addListener('click', function (e) {
    onAddLocation(e.latLng)
    console.log('e', e.latLng.lat())
  })
}

function renderLocations() {
  const locations = getLocations()
  const strHTMLs = locations.map(
    location =>
      `
            <div class="location-container" onclick="onGoToMarker(event,${location.lat}, ${location.lng})">${location.name} <span class="delete-btn" onclick="onDeleteLocation(event, ${location.id})">X</span></div>
            `
  )
  document.querySelector('.location-list').innerHTML = strHTMLs.join('')
}

function onGetPosition() {
  if (!navigator.geolocation) {
    alert('HTML5 Geolocation is not supported in your browser')
    return
  }

  navigator.geolocation.getCurrentPosition(showLocation, handleLocationError)
}

function showLocation(position) {
  var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
  placeMarker(latLng, gMap)
}

function handleLocationError(error) {
  var locationError = document.getElementById('locationError')

  switch (error.code) {
    case 0:
      locationError.innerHTML = 'There was an error while retrieving your location: ' + error.message
      break
    case 1:
      locationError.innerHTML = "The user didn't allow this page to retrieve a location."
      break
    case 2:
      locationError.innerHTML = 'The browser was unable to determine your location: ' + error.message
      break
    case 3:
      locationError.innerHTML = 'The browser timed out before retrieving the location.'
      break
  }
}

function placeMarker(position, map = gMap) {
  var marker = new google.maps.Marker({
    position: position,
    map: map,
  })
  map.panTo(position)
  console.log('position', position)
}

function onAddLocation(position) {
  // Check that the location isnt already in the list
  var position = position
  var locations = getLocations()

  if (locations.find(loc => loc.position === position)) {
    alert('this place is already in the list')
    return
  }

  // if the location isnt already in the list then add it to the list
  const name = prompt('Enter Location Name: ')
  if (!name || !name.length) return

  addLocation(name, position)
  placeMarker(position)
  renderLocations()
}

function onGoToMarker(ev, lat, lng) {
  // ev.stopPropagation()
  const latLng = new google.maps.LatLng(lat, lng)
  placeMarker(latLng, gMap)
  onCloseMobileMenu()
}

function onDeleteLocation(ev, locId) {
  ev.stopPropagation()
  deleteLocation(locId)
  renderLocations()
}

function onSearchLocation() {
  var elSearchInput = document.querySelector('.search-input')
  var placeName = elSearchInput.value

  var request = {
    query: placeName,
    fields: ['name', 'geometry'],
  }

  var service = new google.maps.places.PlacesService(gMap)

  service.findPlaceFromQuery(request, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {}
      placeMarker(results[0]['geometry'].location, gMap)
    }
  })
  onCloseMobileMenu()
}

function renderMarkers() {
  const locations = getLocations()

  locations.forEach(loc => {
    placeMarker(loc.position)
  })
}

function onOpenMobileMenu() {
  const elMobileMenu = document.querySelector('.user-options')
  const elOverlay = document.querySelector('.overlay')
  elOverlay.classList.remove('hidden')
  elMobileMenu.style.transform = 'translateX(0)'
  gIsMobileMenuOpen = true
}

function onCloseMobileMenu() {
  if (gIsMobileMenuOpen) {
    const elMobileMenu = document.querySelector('.user-options')
    const elOverlay = document.querySelector('.overlay')
    elOverlay.classList.add('hidden')
    elMobileMenu.style.transform = 'translateX(-100%)'
    gIsMobileMenuOpen = false
  }
}
