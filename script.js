"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

let map, mapEvent;

navigator.geolocation.getCurrentPosition(
	function (position) {
		const { latitude, longitude } = position.coords;
		map = L.map("map").setView([latitude, longitude], 13);

		L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		map.on("click", function (e) {
			mapEvent = e;
			form.classList.remove("hidden");
			inputDistance.focus();
		});
	},
	function () {
		alert("Sorry! Location services are not available in the browser");
	}
);

form.addEventListener("submit", function (e) {
	e.preventDefault();
	inputDistance.value =
		inputDuration.value =
		inputCadence.value =
		inputElevation.value =
			"";
	const { lat, lng } = mapEvent.latlng;
	L.marker([lat, lng])
		.addTo(map)
		.bindPopup(
			L.popup({
				maxWidth: 250,
				minWidth: 100,
				autoClose: false,
				closeOnClick: false,
				className: "running-popup",
			})
		)
		.setPopupContent("workout!")
		.openPopup();
});

inputType.addEventListener("change", function () {
	inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
	inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
});
