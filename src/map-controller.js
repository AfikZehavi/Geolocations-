'use strict'


var gMap

function initMap(lat = 31.977334843289025, lng = 34.77963258643429) {
    var elMap = document.querySelector('.map')
    var options = {
        center: { lat, lng },
        zoom: 15
    }

    gMap = new google.maps.Map(
        elMap,
        options
    )



    gMap.addListener('click', function (e) {
        placeMarker(e.latLng, gMap);
        console.log('e', e.latLng.lat());

    });

}

function renderLocations() {
    const locations = getLocations()
    const strHTMLs = locations.map(
        (location) =>
            `
            <div class="location-container" onclick="onGoToMarker(${location.lat}, ${location.lng})">${location.name} <span class="delete-btn" onclick="onDeleteLocation(${location.id})">X</span></div>
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
    console.log('showlocation', position);
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
    placeMarker(latLng, gMap)
}



function handleLocationError(error) {
    var locationError = document.getElementById("locationError")

    switch (error.code) {
        case 0:
            locationError.innerHTML = "There was an error while retrieving your location: " + error.message
            break
        case 1:
            locationError.innerHTML = "The user didn't allow this page to retrieve a location."
            break
        case 2:
            locationError.innerHTML = "The browser was unable to determine your location: " + error.message
            break
        case 3:
            locationError.innerHTML = "The browser timed out before retrieving the location."
            break
    }
}

function placeMarker(position, map) {
    var marker = new google.maps.Marker({
        position: position,
        map: map,
    });
    map.panTo(position);
    console.log('position', position);

    marker.addListener("click", () => {
        // map.setZoom(8);
        console.log(marker.getPosition());
        onAddLocation(marker.getPosition());
    });
}


function onAddLocation(position) {
    // Check that the location isnt already in the list
    var position = position
    var locations = getLocations()

    if (locations.find(loc => (loc.position === position))) {
        alert('this place is already in the list')
        return
    }

    // if the location isnt already in the list then add it to the list
    const name = prompt('Enter Location Name: ')
    if (!name || !name.length) return


    addLocation(name, position)
    renderLocations()
}
function onGoToMarker(lat, lng) {
    const latLng = new google.maps.LatLng(lat, lng)
    placeMarker(latLng, gMap)
}

function onDeleteLocation(locId) {
    deleteLocation(locId)
    renderLocations()
}

function onSearchLocation() {
    var elSearchInput = document.querySelector('.search-input')
    var placeName = elSearchInput.value
    // console.log(placeName);

    var request = {
        query: placeName,
        fields: ['name', 'geometry']
    }

    // console.log(request.query)
    var service = new google.maps.places.PlacesService(gMap);

    service.findPlaceFromQuery(request, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                console.log(results[i]['geometry'].location);
            }
            placeMarker(results[0]['geometry'].location, gMap)
        }
    });
}