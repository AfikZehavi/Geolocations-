'use strict'
const gLocations = []

function addLocation(name, position) {
    var location = _createLocations(name, position);
    console.log('lat',location.lat);
    gLocations.push(location)
}

function _createLocations(name, position) {
    return {
        id: makeId(),
        name,
        position,
        lat: position.lat(),
        lng: position.lng()    
    }
}

function getLocations() {
    return gLocations
}

function deleteLocation(locId) {
    console.log(locId);
    const locIdx = gLocations.findIndex(location => location.id === `${locId}`)
    gLocations.splice(locIdx, 1)
}