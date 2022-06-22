'use strict'

const LOCATIONS = 'locationsDB'
const gLocations = loadFromStorage(LOCATIONS) || []


function addLocation(name, position) {
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
    url: createQueryString(position.lat(), position.lng())
  }
}

function getLocations() {
  return gLocations
}

function deleteLocation(locId) {
  const locIdx = gLocations.findIndex(location => location.id === `${locId}`)
  gLocations.splice(locIdx, 1)
  _saveLocations()
}

function _saveLocations() {
  saveToStorage(LOCATIONS, gLocations)
}

function createQueryString(lat, lng) {

  const url = window.location.origin + window.location.pathname + `?lat=${lat}&lng=${lng}`
  window.history.pushState({ path: url }, '', url)
  return url
}
// function saveQueryString(bookId = '') {
//   const filter = getFilterBy()

//   const queryStringParams = `?name=${filter.name}&maxPrice=${filter.maxPrice}&readingId=${bookId}`
//   const newUrl =
//     window.location.protocol +
//     '//' +
//     window.location.host +
//     window.location.pathname +
//     queryStringParams
//   window.history.pushState({ path: newUrl }, '', newUrl)
// }

// function renderQueryStringModalParam() {
//   const queryStringParams = new URLSearchParams(window.location.search)
//   const readingId = queryStringParams.get('readingId') || ''
//   if (readingId) onOpenModal(readingId)
// }

