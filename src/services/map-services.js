'use strict'

import { loadFromStorage, saveToStorage } from './storage-service.js'
import { makeId } from './util-service.js'
import { onAddLocation } from '../map-controller.js'

const LOCATIONS = 'locationsDB'
const gLocations = loadFromStorage(LOCATIONS) || []
let markers = []

export function addLocation(name, position) {
  var location = _createLocations(name, position)
  gLocations.push(location)
  _saveLocations()
}

function _createLocations(name, position) {
  return {
    id: makeId(),
    name,
    position,
    lat: position.lat(),
    lng: position.lng(),
    url: createQueryString(position.lat(), position.lng()),
  }
}



export function getLocations() {
  return gLocations
}

export function deleteLocation(locId) {
  const locIdx = gLocations.findIndex(location => location.id === `${locId}`)
  gLocations.splice(locIdx, 1)
  markers[locIdx].setMap(null)
  markers.splice(locIdx, 1)
  _saveLocations()
}

function _saveLocations() {
  saveToStorage(LOCATIONS, gLocations)
}

////////////////////////////////////////////////////////////////

export const mapService = {
  initMap,
  addMarker,
  panTo,
  getPlacesService,
}
var gMap
var service

function initMap(lat = 32.0749831, lng = 34.9120554) {
  return _connectGoogleApi().then(() => {
    gMap = new google.maps.Map(document.querySelector('#map'), {
      center: { lat, lng },
      zoom: 15,
    })
    gMap.addListener('click', e => {
      onAddLocation(e.latLng)
    })
  })
}

function addMarker(position, name, isCustom = false) {
  var marker = new google.maps.Marker({
    position,
    icon: isCustom ? '../images/pin.png' : null,
    map: gMap,
    title: isCustom ? 'You are here' : name,
  })

  const infowindow = new google.maps.InfoWindow({ content: marker.title })
  marker.addListener('click', () => {
    infowindow.open({
      anchor: marker,
      map: gMap,
      shouldFocus: false,
    })
  })
  markers.push(marker)
  return marker
}

function panTo(lat, lng) {
  var laLatLng = new google.maps.LatLng(lat, lng)
  gMap.panTo(laLatLng)
}

function _connectGoogleApi() {
  if (window.google) return Promise.resolve()
  const API_KEY = 'AIzaSyCCepA_c55nnZt5dioo2oR9hO2StyQwkC8&libraries=places'
  var elGoogleApi = document.createElement('script')
  elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
  elGoogleApi.async = true
  document.body.append(elGoogleApi)

  return new Promise((resolve, reject) => {
    elGoogleApi.onload = resolve
    elGoogleApi.onerror = () => reject('Google script failed to load')
  })
}

function createQueryString(lat, lng) {
  const url = window.location.origin + window.location.pathname + `?lat=${lat}&lng=${lng}`
  window.history.pushState({ path: url }, '', url)
  return url
}

export function getPlacesService(query) {
  service = new google.maps.places.PlacesService(gMap)
  console.log(service)
  var location
  var req = {
    query,
    fields: ['name', 'geometry'],
  }

  service.findPlaceFromQuery(req, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {

      // onAddMarker(results[0]['geometry'].location)
      addMarker(results[0]['geometry'].location)
      panTo(results[0]['geometry'].location.lat(), results[0]['geometry'].location.lng())
    }
  })
}
