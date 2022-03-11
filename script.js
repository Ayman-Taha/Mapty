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

class Workout {
	//class fields
	date = new Date();
	id = (Date.now() + "").slice(-10);

	constructor(coords, distance, duration) {
		this.coords = coords;
		this.distance = distance;
		this.duration = duration; //in minutes
	}
}

class Running extends Workout {
	type = "running";
	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration);
		this.cadence = cadence;
		this.calcPace();
	}

	calcPace() {
		this.pace = this.duration / this.distance;
	}
}

class Cycling extends Workout {
	type = "cycling";
	constructor(coords, distance, duration, elevationGain) {
		super(coords, distance, duration);
		this.elevationGain = elevationGain;
		this.calcSpeed();
	}

	calcSpeed() {
		this.speed = this.distance / (this.duration / 60);
	}
}

class App {
	#map;
	#mapEvent;
	#workouts = [];

	constructor() {
		this._getPosition();
		form.addEventListener("submit", this._newWorkout.bind(this));
		inputType.addEventListener("change", this._toggleElevationField);
	}

	_getPosition() {
		navigator.geolocation.getCurrentPosition(
			this._loadMap.bind(this),
			function () {
				alert("Sorry! Location services are not available in the browser");
			}
		);
	}

	_loadMap(position) {
		const { latitude, longitude } = position.coords;
		this.#map = L.map("map").setView([latitude, longitude], 13);

		L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map);
		this.#map.on("click", this._showForm.bind(this));
	}

	_showForm(e) {
		this.#mapEvent = e;
		form.classList.remove("hidden");
		this._clearInputs();
		inputDistance.focus();
	}

	_toggleElevationField() {
		inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
		inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
	}

	_showMarker(workout) {
		L.marker(workout.coords)
			.addTo(this.#map)
			.bindPopup(
				L.popup({
					maxWidth: 250,
					minWidth: 100,
					autoClose: false,
					closeOnClick: false,
					className: `${workout.type}-popup`,
				})
			)
			.setPopupContent(workout.type)
			.openPopup();
	}

	_clearInputs() {
		inputDistance.value =
			inputDuration.value =
			inputCadence.value =
			inputElevation.value =
				"";
	}

	_newWorkout(e) {
		const isValidInputs = (...inputs) =>
			inputs.every((input) => Number.isFinite(input));

		const isPositiveInputs = (...inputs) => inputs.every((input) => input > 0);

		e.preventDefault();

		const type = inputType.value;
		const distance = Number(inputDistance.value);
		const duration = Number(inputDuration.value);
		const { lat, lng } = this.#mapEvent.latlng;
		let workout;

		if (type === "running") {
			const cadence = Number(inputCadence.value);
			if (
				!isValidInputs(distance, duration, cadence) ||
				!isPositiveInputs(distance, duration, cadence)
			) {
				return alert("All inputs must be positive numbers!");
			}

			workout = new Running([lat, lng], distance, duration, cadence);
		}

		if (type === "cycling") {
			const elevation = Number(inputElevation.value);
			if (
				!isValidInputs(distance, duration, elevation) ||
				!isPositiveInputs(distance, duration)
			) {
				return alert("All inputs, except elevation, must be positive numbers!");
			}

			workout = new Cycling([lat, lng], distance, duration, elevation);
		}

		this.#workouts.push(workout);

		this._showMarker(workout);

		this._clearInputs();
	}
}

const app = new App();
