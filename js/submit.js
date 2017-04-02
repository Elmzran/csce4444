/*
 * TEMPORARY CODE FOR PROTOTYPE
 * 
 * The full version of this application will use Angular 2. But for
 * the purposes of deadlines and time constraints, the prototype will
 * utilize jQuery. 
 * 
 * */
 
// Wait until the document is ready
$(document).ready(function() {
	// Set up pseudo map
	var map = new google.maps.Map(document.getElementById('map'), {
    });
	
	// Wait for submit
	$(".btn-submit").on("click", function() {
		// Get the user inputted address for geocoding to LatLng
		var userAddress = $("input[name=address]").val();
		
		// Replace all spaces in the userAddress with + for proper URL encoding
		userAddress = userAddress.replace(/ /g, "+");
		
		// Make the geocoding request
		$.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + userAddress + "&key=AIzaSyDL-MdwQhdf_xhUlmBmA3E6sGe9uUAG4c4",
		function(data) {
			// Create Places API request object
			var request = {};
			
			// Get new LatLng property in the request object from the data returned via geocoding
			request.location = new google.maps.LatLng(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
			
			// Get the user's max distance that they're willing to travel
			var distanceToCheck = $("input[name=distance]").val();

			if (distanceToCheck == undefined || distanceToCheck == '') {
				// Default to 10 miles in meters
				distanceToCheck = "10";
			}
			else if (parseInt(distanceToCheck) > 31) {
				// Otherwise, if distance is greater than the max of 31 miles, set to 50,000 meters
				distanceToCheck = "31";
			}

			// Put this max distance in the request object
			//request.radius = '' + (parseInt(distanceToCheck) * 1609.34);
			
			// Find the highest and lowest price as specified by the user.
			var pricesArr = $(".btn-price-group").children();
			var lowest;
			var highest;
			var i;
			
			// Find lowest
			for (i = 0; i < pricesArr.length; ++i) {
				if (pricesArr.eq(i).children().eq(0).is(":checked")) {
					lowest = i;
					break;
				}
			}
			
			// If the user failed to select a lowest, then set the lowest to free
			if (i == pricesArr.length) {
				lowest = 0;
			}
			
			// Find highest
			for (i = pricesArr.length - 1; i >= 0; --i) {
				if (pricesArr.eq(i).children().eq(0).is(":checked")) {
					highest = i;
					break;
				}
			}
			
			// If the user failed to select a highest, then set the highest to $$$$
			if (i == -1) {
				highest = 4;
			}
			
			// Put the lowest and highest into the proper format of the request obj
			request.minPriceLevel = lowest;
			request.maxPriceLevel = highest;
			
			// Get the user specified type for the restaurant
			request.query = $("input[name=type]").val();
			
			// Make the official main request!
			var placeService = new google.maps.places.PlacesService(map);
			placeService.textSearch(request, function(data) {
				$(".main-div").empty();
				$(".main-div").text(JSON.stringify(data));
			});
		});
	});
});