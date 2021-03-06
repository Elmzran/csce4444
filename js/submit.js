/*/*
 * CODE FOR "Where to Eat?"
 * 
 * CODE BY Jonathan Roosa, Brennan Schamberger, Amir Kessler, Sadman Ahmed, and Jay Baek
 * 
 * */
 
// Wait until the document is ready
$(document).ready(function() {
	// Set up pseudo map
	var map = new google.maps.Map(document.getElementById('map'), {
    });
	
	// Wait for submit
	$(".btn-submit").on("click", function() {
		
		// Basic Routing Functionality
		$.router.go("/");
		$.router.add("/", function(data) {
			location.reload();
		});
		
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
				console.log(data);
				$(".main-div").html('<div style="margin: 2em;"><div class="row"> \
							<div class="col-md-12"> \
								<div class="form-group"> \
									<label>Sort By:</label> \
									<select class="form-control" id="sort"> \
										<option value="1">Name (a-z)</option> \
										<option value="2">Name (z-a)</option> \
										<option value="3">Price (low-high)</option> \
										<option value="4">Price (high-low)</option> \
										<option value="5">Rating (low-high)</option> \
										<option value="6">Rating (high-low)</option> \
									</select> \
								</div> \
							</div> \
							<div class="col-md-12"> \
								<button type="button" id="sort-submit" class="btn btn-secondary btn-lg">Sort</button> \
							</div> \
						</div></div><div class="main-listing-div"></div>');
				display_listing(data);
				
				// Function for sorting listing
				$(document).on("click", "#sort-submit", function() {
					// Get the value of the option from the dropdown
					var option = $('select[id=sort]').val();
					
					// In the sort select dropdown, odd options are ascending while even options are descending
					// so, choose proper ordering via trinary operator
					var ascending = option % 2 ? true : false;
					
					// Bubble sort, because native JS sorting wasn't working
					for (var i = 0; i < data.length; ++i) {
						for (var j = 0; j < data.length - 1; ++j) {
							// Name
							if (option == 1 || option == 2) {
								// Ascending
								if (ascending == true) {
									if (data[j].name > data[j + 1].name) {
										var temp = data[j];
										data[j] = data[j + 1];
										data[j + 1] = temp;
									}
								}
								// Descending
								else if (ascending == false) {
									if (data[j].name < data[j + 1].name) {
										var temp = data[j];
										data[j] = data[j + 1];
										data[j + 1] = temp;
									}
								}
							}
							// Price Level
							if (option == 3 || option == 4) {
								// Ascending
								if (ascending == true) {
									if (data[j].price_level > data[j + 1].price_level) {
										var temp = data[j];
										data[j] = data[j + 1];
										data[j + 1] = temp;
									}
								}
								// Descending
								else if (ascending == false) {
									if (data[j].price_level < data[j + 1].price_level) {
										var temp = data[j];
										data[j] = data[j + 1];
										data[j + 1] = temp;
									}
								}
							}
							// Rating
							if (option == 5 || option == 6) {
								// Ascending
								if (ascending == true) {
									if (data[j].rating > data[j + 1].rating) {
										var temp = data[j];
										data[j] = data[j + 1];
										data[j + 1] = temp;
									}
								}
								// Descending
								else if (ascending == false) {
									if (data[j].rating < data[j + 1].rating) {
										var temp = data[j];
										data[j] = data[j + 1];
										data[j + 1] = temp;
									}
								}
							}
						}
					}
					console.log(data);
					$(".main-listing-div").html("");
					display_listing(data);
				});
			});	
		});
	});
	
	// Function to click on a location
	$(document).on("click", ".restaurant-div", function() {
		// Format place details request object with the place attribute	
		var request = {placeId: $(this).attr("place")};
		var myDiv = $(this);
		
		
		// Make place details request
		if (myDiv.data("clicked") != true) {
			var placeService = new google.maps.places.PlacesService(map);
			placeService.getDetails(request, function(place, status) {
				
				console.log(place);
				
				myDiv.data("clicked", true);
				var leftDiv = myDiv.find(".left-restaurant-subdiv");
				var rightDiv = myDiv.find(".right-restaurant-subdiv");
				
				// Append navigation button
				$('<h3 class="nav-header">Navigate</h3>').appendTo(rightDiv);
				$('<button class="nav-button-wrapper"><a target="_blank" href="http://maps.google.com/?daddr=' + place.formatted_address.replace(" ", "+") + '"><img src="../img/car.png" /></a></button>').appendTo(rightDiv);
				
				// Append hours
				$('<h4>Hours</h4>').appendTo(leftDiv);
				for (i = 0; i < place.opening_hours.weekday_text.length; ++i)
				{
					$('<p>' + place.opening_hours.weekday_text[i] + '</p>').appendTo(leftDiv);
				}
				
				// Append phone number
				if (place.international_phone_number != undefined) {
					$('<h4>Phone Number</h4>').appendTo(rightDiv);
					$('<a href="tel:' + place.international_phone_number.replace(" ", "").replace("+", "").replace("-", "") + '">' + place.formatted_phone_number +'</a>').appendTo(rightDiv);
				}
				
				// Append website
				if (place.website != undefined) {
					$('<h4>Website</h4>').appendTo(rightDiv);
					$('<a target="_blank" href="' + place.website + '">' + place.website +'</a>').appendTo(rightDiv);
				}
			});
		}
	});
	
	// Function for displaying restaurants
	function display_listing(data) {
		$(data).each(function(index, data) {

		// Create main restaurant div
		var div = $('<div class="restaurant-div row">').appendTo(".main-listing-div");
		
		// Append left sub and right sub div
		var divLeft = $('<div class="left-restaurant-subdiv col-xs-6">').appendTo(div);
		var divRight = $('<div class="right-restaurant-subdiv col-xs-6">').appendTo(div); 

			
			divLeft.append(
				$(document.createElement('h3')).text(data.name)
			);
			divLeft.append(
				$(document.createElement('h4')).text("Address")
			);
				divLeft.append(
				$(document.createElement('p')).text(data.formatted_address.replace(", United States", ""))
			);
			divLeft.append(
				$(document.createElement('h4')).text("Rating")
			);
			divLeft.append(
				$(document.createElement('div')).rateYo({rating: data.rating, readOnly: true})
			);
			divLeft.append(
				$(document.createElement('h4')).text("Price")
			);
			divLeft.append(
				$(document.createElement('h4')).text("$".repeat(data.price_level)).css("color", "#42f48c").css("font-weight", 800)
			);
				
			// Check to make sure a photo exists
			if (data.photos != undefined) {
				var img = data.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500})
				divRight.append("<img class='restaurant-img' src='" + img +"'/>");
			}
			

			div.attr("place", data.place_id);
		});
	}
});
