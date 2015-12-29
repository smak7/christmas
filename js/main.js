var map;
var infoWindows = [];
var markers = [];
var imagepopulation;
var updateDuration = 10000; 
var throttleDelay = 5 * 60000;
var maxMarkerCount = 20;


function initialize (){
	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(26.3351, 17.228331),
		zoom: 2,
		mayTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(mapCanvas, mapOptions);		
}
function insertMarkerIntoMap(item){
	if(item.location){
		// console.log(item.location.latitude);
		var lat = item.location.latitude;
		var lng= item.location.longitude;
		var myLatlng = new google.maps.LatLng(lat,lng);

		var imagesURL = item.images.standard_resolution.url;
		// console.log(imagesURL);

		var captionText = item.caption.text;
		
		var contentString = '<img src="'+imagesURL+'" style="max-width:250px">' 

		var infowindow = new google.maps.InfoWindow({
		    content: contentString,
		    maxHeight:0
		  });

		infoWindows.push(infowindow);
		var id = infoWindows.length-1;

		var marker = new google.maps.Marker({
			position: myLatlng,
			map:map
		})

		markers.push(marker);
		var mid  = markers.length-1;

		google.maps.event.addListener(markers[mid], 'click', function(innerKey) {
	      return function() {
	          infoWindows[innerKey].open(map, markers[innerKey]);
	      }
	    }(mid));

	    google.maps.event.addListener(markers[mid], 'closeclick', function(innerKey) {
	      return function() {
	          infoWindows[innerKey].close(map);
	      }
	    }(mid));
	}
}

function updateMap(){
	if(markers.length > maxMarkerCount){
		cleanMarkers();
	}
	var accessToken = "7901708.cf0499d.4a3416c571024368823a287951805252";
	var tag = "christmas";

	var url  = "https://api.instagram.com/v1/tags/"+tag+"/media/recent?count=200&access_token="+accessToken+"";
	if (imagepopulation) {
		url +="&next_max_id="+imagepopulation
	}
		// the if (imagepopulation is the variable we defined for the entire sheet and it's saying that the imagepopulation means 
		// data.pagination.next_max id = marking the last populated image - every 3 seconds it populates)
	$.ajax(
		{ 
			type: 'GET', 
			url: url, 
			data: { get_param: 'value' }, 
			dataType: 'jsonp',
			crossDomain: true, // enable this
			success: function (data) { 
				imagepopulation = data.pagination.next_max_id;
				// console.log(data);
				// console.log(data.data.length);
				for( var i = 0; i < data.data.length; i++){
					insertMarkerIntoMap(data.data[i]);				
				}
				setInterval(updateMap, updateDuration);
			},
			error: function(response) { 
				if(response.status == 429) { //just slow down requests
					setInterval(updateMap, updateDuration + throttleDelay);
				} else {
					alert('Failed! Please try refreshing page!');
				}
			}
		}
	);
}

function cleanMarkers(){
	for(var i = 0; i < markers.length; i++){
		markers[i].setMap(null);
	}
	markers = [];
}


$(document).ready(function(){
	initialize();
	updateMap();
});
