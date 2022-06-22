'use strict'

import { loadFromStorage, saveToStorage } from './storage-service.js'
import { makeId } from './util-service.js'
import { onAddLocation } from '../map-controller.js'

const LOCATIONS = 'locationsDB'
const gLocations = loadFromStorage(LOCATIONS) || []

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
  console.log(locId)
  const locIdx = gLocations.findIndex(location => location.id === `${locId}`)
  gLocations.splice(locIdx, 1)
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
}
var gMap

function initMap(lat = 32.0749831, lng = 34.9120554) {
  console.log('InitMap')
  return _connectGoogleApi().then(() => {
    console.log('google available')
    gMap = new google.maps.Map(document.querySelector('#map'), {
      center: { lat, lng },
      zoom: 15,
    })
    gMap.addListener('click', e => {
      onAddLocation(e.latLng)
    })
  })
}

function addMarker(position, name) {
  var marker = new google.maps.Marker({
    position: position,
    map: gMap,
    title: name,
  })
  return marker
}

function panTo(lat, lng) {
  console.log('hereeee');
  var laLatLng = new google.maps.LatLng(lat, lng)
  gMap.panTo(laLatLng)
}

function _connectGoogleApi() {
  if (window.google) return Promise.resolve()
  const API_KEY = 'AIzaSyCCepA_c55nnZt5dioo2oR9hO2StyQwkC8'
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
