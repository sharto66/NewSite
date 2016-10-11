var app = angular.module('myApp', []);
var selectEvent;
var eventsLoaded = false;

app.controller('eventsCtrl', function($scope, $http) {
	$http.get('/events')
	.then(function(res) {
		$scope.events = res.data;
	});
	$scope.finished = function() {
		console.log('test');
		var events = document.getElementsByClassName('eventSelect');
		for (var i = 0; i < events.length; i++) {
			console.log(events[i]);
			events[i].addEventListener('click', eventClickHandler);
		}
	}
});

app.controller('bookingCtrl', function($scope, $http) {
	$scope.createBooking = function() {
		var checkedItems = getCheckedCheckBoxes();
		var event_id = selectEvent;
		var minAttend = document.getElementById('booking-minAttend').value;
		var date = document.getElementById('booking-date-picker').value;
		$http.post('/bookings?event_id=' + event_id + '&date=' + date + '&minAttend=' + minAttend)
		.then(function(res) {
			console.log(res);
			alert('Booking made!');
		});
	}
});

app.controller('friendsCtrl', function($scope, $http) {
	$http.get('https://graph.facebook.com/v2.6/' + $scope.id + '/friends?access_token=' + $scope.token)
	.then(function(res) {
		console.log(res);
		for(var i = 0; i < res.data.data.length; i++) {
			$http.get('https://graph.facebook.com/v2.6/' + res.data.data[i].id + '/picture?redirect=0')
			.then(function(picRes) {
				console.log('i = ' + i);
				i = i - 1;
				console.log('i = ' + i);
				Object.defineProperty(res.data.data[i], 'picture',
					{
						value : picRes.data.data.url,
						writable : true,
						enumerable : true,
						configurable : true
					}
				);
			});
		}
		console.log(res);
		$scope.friends = res.data.data;
	});
});

$(function () { $('[data-toggle="popover"]').popover(); });

function getCheckedCheckBoxes() {
	var inputs = document.getElementsByTagName('input');
	var checkedFriends = [];
	for(var i = 0; i < inputs.length; i++) {
		if (inputs[i].type == 'checkbox') {
			if (inputs[i].checked) {
				if (inputs[i].id == 'friendSelect') {
					checkedFriends.push(inputs[i].name);
				}
			}
		}
	}
	return checkedFriends;
}

function eventClickHandler(event) {
	selectEvent = event.toElement.name;
	console.log(selectEvent);
	var events = document.getElementsByClassName('eventSelect');
	for (var i = 0; i < events.length; i++) {
		if (events[i].name != selectEvent) {
			events[i].checked= false;
		}
	}
}
