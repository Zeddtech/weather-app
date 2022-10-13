import {
  countries
} from "./vendor/countries.js";
import {
  key
} from './config.js';
const currentLocation = document.querySelector(".header");
const parameters = document.querySelector(".parameters");
const sun = document.querySelector(".sun-box");
const daily = document.querySelector(".days");
const hourly = document.querySelector(".hours");
const input = document.querySelector(".input-search");
const slider = document.querySelectorAll(".slider");
const weatherImg = document.querySelector(".weather-app");

getLocation();


// hourl and daily carousel
let isDown = false;
let startX;
let scrollLeft;
slider.forEach((slider) => {
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    // get the click point of the mouse
    startX = e.pageX - slider.offsetLeft;
    // get the lenght the mouse of drag to
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("mouseleave", () => (isDown = false));
  slider.addEventListener("mouseup", () => (isDown = false));
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; //scroll-fast
    slider.scrollLeft = scrollLeft - walk;
  });
  slider.addEventListener("wheel",
    (evt) => {
      evt.preventDefault();
      slider.scrollLeft += evt.deltaY/2;
    });
});
// round to the nearest integer
function f(int) {
  return Math.round(int);
}
// get the user current location
function getLocation() {
  if (navigator.geolocation) {
    var options = {
      timeout: 60000,
      enableHighAccuracy: true,
      maximumAge: 2000
    };
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);
  } else {
    alert(" unable to get your geolocation information, your browser does not support geolocation! to get your current position weather information click on the search icon then search for your city name ");
    getCityInfo(6.605874, 3.349149)
  }

}
function successHandler(location) {
  let {
    latitude,
    longitude
  } = location.coords;
  // fetch current user city info
  getCityInfo(latitude, longitude);
}
function errorHandler(err) {
  if (err.code == 1) {
    alert("Error: Unable to get your geolocation information  because the page didn't have the permission to do it. please turn on your device  location and grant acess to location to get your weather information or You can  search city names to get it's current weather information");
  } else if (err.code == 2) {
    alert("Error: your geolocation lnformation is  unavailable!");
  } else if (err.code == 3) {
    alert("Error Timeout: Failed to get  geolocation lnformation !");
  }
  getCityInfo(6.605874, 3.349149)
}



async function getCityInfo(lat, long) {
  try {
    let res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&limit=1&appid=${key}`
    );
    res = await res.json();
    if (res.message) {
      throw new Error(` Bad Request, ${res.message}`);
    } else if (res.length < 1) {
      throw new Error(" Sorry Could Not Get Your City Info ");
    } else {
      fetchWeather(res[0]);
    }
  } catch (error) {
    weatherImg.style.opacity = 1;
    alert(error);
  }
}

function fetchWeather(coords) {
  let {
    name,
    lat,
    lon,
    state,
    country
  } = coords;
  fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=alerts,minutely&appid=${key}`
  )
  .then((data) => data.json())
  .then((data) => {
    if (data.message) throw new Error(data.message);
    render(name, state, country, data);
  })
  .catch((err) => {
    weatherImg.style.opacity = 1;
    alert("Bad Request, " + err);
  });
}

// search city
document.querySelector(".form").addEventListener("submit", (e) => {
  e.preventDefault();
  let city = input.value.trim();
  if (city === "") {
    return;
  } else {
    getcitycords(city);
  }
  input.value = "";
});

const cities = document.querySelectorAll(".city-el");
cities.forEach((city) => {
  city.addEventListener("click", (e) => {
    e.preventDefault();

    let city = e.currentTarget.innerText;
    getcitycords(city);
  });
});

function getcitycords(city) {
  weatherImg.style.opacity = 0;
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`
  )
  .then((data) => data.json())
  .then((res) => {
    if (res.cod != 200) {
      throw new Error(res.message);
    } else {
      getCityInfo(res.coord.lat, res.coord.lon);
    }
  })
  .catch((err) => {
    weatherImg.style.opacity = 1;
    alert(err);
  });
}

// render to the browser
function render(cityname, state, country, weatherInfo) {
  let date = moment
  .unix(weatherInfo.current.dt)
  .format(" dddd MMMM Do, h:mm A");
  let hour = "";
  let day = "";
  let weather = weatherInfo.current.weather[0].main;
  currentLocation.innerHTML = ` <div class="city">${cityname} , ${
  state ? state + ",": ""
  } ${country ? countries[country]: ""}</div>
  <div class="weather">
  <h1 class="current-temp" title="Temperature">${f(
    weatherInfo.current.temp
  )}&deg;</h1>
  <div class="weather-condition">
  <img src="https://openweathermap.org/img/wn/${
  weatherInfo.current.weather[0].icon
  }@2x.png" alt="${weatherInfo.current.weather[0].description}" title="${
  weatherInfo.current.weather[0].description
  }">
  <p >${weather}</p>
  </div>
  </div>
  <p class="date">

  ${date}

  </p>`;

  parameters.innerHTML = `
  <!-- humidity -->
  <div class="humidity param-box">
  <i class="bx bx-droplet"></i>
  <div class="param-body">
  <p class="param-name">humidity</p>
  <p class="param-value">${f(
    weatherInfo.current.humidity
  )}<small>%</small></p>
  </div>
  </div>
  <!-- pressure -->
  <div class="pressure param-box">
  <i class="bx bx-tachometer"></i>
  <div class="param-body">
  <p class="param-name">pressure</p>
  <p class="param-value">${f(
    weatherInfo.current.pressure * 0.1
  )}<small>kPa</small></p>
  </div>
  </div>
  <!-- wind speed -->
  <div class="wind param-box">
  <i class="bx bx-wind"></i>
  <div class="param-body">
  <p class="param-name">wind speed</p>
  <p class="param-value">${f(
    weatherInfo.current.wind_speed
  )}<small>m/s</small></p>
  </div>
  </div>
  `;
  sun.innerHTML = `<div class="sun-rise-con">
  <div class="sun-rise" title="Sun-rise"></div>
  <p class="sun-rise">${moment
  .unix(weatherInfo.current.sunrise)
  .format("h:mm A")}</p>
  </div>
  <div class="sun-set-con">
  <div class="sun-set" title="sun-set"></div>
  <p class="sun-set">${moment
  .unix(weatherInfo.current.sunset)
  .format("h:mm A")}</p>
  </div>`;
  // hourly forecast
  weatherInfo.hourly.forEach((el, indx) => {
    if (indx != 0) {
      hour += `<div class="hourly">
      <p class="time">${moment.unix(el.dt).format("h:mm A")}</p>
      <img src="https://openweathermap.org/img/wn/${
      el.weather[0].icon
      }@2x.png" alt="${el.weather[0].description}" title="${
      el.weather[0].description
      }" />
      <p class="temp" title="Temperature">${f(el.temp)}&deg;</p>
      </div>`;
    }
  });
  hourly.innerHTML = hour;
  // daily forecast
  weatherInfo.daily.forEach((el, indx) => {
    if (indx != 0) {
      day += `
      <div class="daily">
      <p class="day">${moment.unix(el.dt).format("ddd")}</p>
      <img src="https://openweathermap.org/img/wn/${
      el.weather[0].icon
      }@2x.png" alt="${el.weather[0].description}" title="${
      el.weather[0].description
      }"/>
      <p class="temp" title='temperature'>${f(el.temp.day)}&deg;</p>
      <p class="temp" title='humidity'>${f(el.humidity)}<small>%</small></p>
      <p class="temp" title='wind speed'>${f(el.wind_speed)}<small>m/s</small></p>
      </div>`;
    }
  });
  daily.innerHTML = day;
  // switch background
  switch (weather) {
    case "Thunderstorm":
      weatherImg.style.backgroundImage = "url(../img/thunderstorm.gif)";
      break;
    case "Drizzle":
    case "Rain":
      weatherImg.style.backgroundImage = "url(../img/rain.gif)";
      break;
    case "Snow":
      weatherImg.style.backgroundImage = "url(../img/snow.gif)";
      break;
    case "Mist":
    case "Fog":
    case "Smoke":
    case "Haze":
      weatherImg.style.backgroundImage = "url(../img/fog.gif)";
      break;
    case "Clear":
      weatherImg.style.backgroundImage = "url(../img/clear.gif)";
      break;

    default:
      weatherImg.style.backgroundImage = "url(../img/clouds.gif)";
      break;
  }
  weatherImg.style.opacity = 1;
}
