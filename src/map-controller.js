import { addLocation, getLocations, deleteLocation } from './services/map-services.js'
import { mapService } from './services/map-services.js'

// initMap()
onInit()

var gIsMobileMenuOpen = false

window.onGoToMarker = onGoToMarker
window.onDeleteLocation = onDeleteLocation
window.onSearchLocation = onSearchLocation
window.onGetPosition = onGetPosition

// events
document.querySelector('.mobile-menu').addEventListener('click', onOpenMobileMenu)
document.querySelector('.overlay').addEventListener('click', onCloseMobileMenu)

function onInit() {
  mapService
    .initMap()
    .then(() => {
      console.log('Map is ready')
      renderLocations()
      renderMarkers()
      goToQueryStringModalParam()
    })
    .catch(() => console.log('Error: cannot init map'))
}

function renderLocations() {
  const locations = getLocations()
  console.log(locations)
  const strHTMLs = locations.map(
    location =>
      `
            <div class="location-container" onclick="onGoToMarker(${location.lat}, ${location.lng}, '${location.url}')">${location.name} <span class="delete-btn" onclick="onDeleteLocation(event, ${location.id})">X</span></div>
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
  //   mapService.addMarker(latLng, gMap)
  const pos = {
    lat: latLng.lat(),
    lng: latLng.lng(),
  }
  console.log(pos)

  onPanTo(pos)
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

export function onAddLocation(position) {
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
  mapService.addMarker(position, name)
  renderLocations()
}

function onGoToMarker(lat, lng, url) {
  mapService.panTo(lat, lng)
  window.history.pushState({ path: url }, '', url)
  onCloseMobileMenu()
}

function onDeleteLocation(ev, locId) {
  ev.stopPropagation()
  deleteLocation(locId)
  renderLocations()
  renderMarkers()
}

function onSearchLocation(e) {
  e.preventDefault()
  var elSearchInput = document.querySelector('.search-input')
  var placeName = elSearchInput.value

  mapService.getPlacesService(placeName)

  //   onAddMarker(searchLoc)
  onCloseMobileMenu()
}
function onPanTo(loc) {
  console.log('Panning the Map')
  mapService.panTo(loc.lat, loc.lng)
}

function onAddMarker(loc, name) {
  mapService.addMarker({ lat: loc.lat, lng: loc.lng }, name)
}

function renderMarkers() {
  const locations = getLocations()

  locations.forEach(loc => {
    onAddMarker(loc.position, loc.name)
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

function goToQueryStringModalParam() {
  const queryStringParams = new URLSearchParams(window.location.search)
  const lat = queryStringParams.get('lat') || ''
  const lng = queryStringParams.get('lng') || ''

  if (lat && lng) {
    const url = window.location.href
    onGoToMarker(lat, lng, url)
  }
}
