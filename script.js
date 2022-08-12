'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimb = document.querySelector('.form__input--climb');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.calculatePace();
  }

  calculatePace() {
    // min / km
    this.pace = this.duration / this.distance;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.calculateSpeed();
  }
  calculateSpeed() {
    // km / h
    this.speed = this.distance / this.duration / 60;
  }
}
// const running = new Running([35, 12], 7, 40, 150);
// const cykling = new Cycling([35, 12], 37, 20, 150);
// console.log(running, cykling);

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleClimbField);
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Невозможно определить ваше местоположение');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(position);
    console.log(latitude, longitude);
    console.log(
      `https://www.google.com/maps/@${latitude},${longitude},22265m/data=!3m1!1e3?hl=en`
    );

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);
    console.log(this.#map);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords).addTo(this.#map).bindPopup('You are here!').openPopup();

    // Обработка клика на карте

    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(e) {
    this.#mapEvent = e;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleClimbField() {
    inputClimb.closest('.form__row').classList.toggle('form__row--hidden');
    inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // Проверка является ли числом
    const areNumbers = (...numbers) =>
      numbers.every(num => Number.isFinite(num));
    // Проверка являются ли числа положительными
    const areNumbersPositive = (...numbers) => numbers.every(num => num > 0);

    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // Получить данные из формы
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    // Если тренировка пробежка, создать объект Running
    if (type === 'running') {
      const temp = +inputTemp.value;
      // Проверка валидности данных
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(temp)
        !areNumbers(distance, duration, temp) ||
        !areNumbersPositive(distance, duration, temp)
      )
        return alert('Введите положительное число!');
      workout = new Running([lat, lng], distance, duration, temp);
    }
    // Если тренировка велотренировка, создать объект Cycling
    if (type === 'cycling') {
      const climb = +inputClimb.value;

      // Проверка валидности данных
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(climb)
        !areNumbers(distance, duration, climb) ||
        !areNumbersPositive(distance, duration)
      )
        return alert('Введите положительное число!');
      workout = new Cycling([lat, lng], distance, duration, climb);
    }

    // Добавить новый объект в массив тренировок
    this.#workouts.push(workout);
    console.log(workout);

    // Отобразить тренировку на карте

    this.displayWorkout(workout);

    // Отобразить тренировку в списке

    // Очистка полей ввода данных и спрятать форму
    inputDistance.value =
      inputClimb.value =
      inputDuration.value =
      inputTemp.value =
        '';
    form.classList.add('hidden');
  }
  displayWorkout(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Training')
      .openPopup();
  }
}

const app = new App();
// app._getPosition();
