var apiKey = "dd401e674b4308404ddd898a486aef6b"; // my API key from Open Weather

var cities = [];
cities.reverse();

// I'm saving data to local storage
function saveToStore() {
  localStorage.setItem("cities", JSON.stringify(cities));
}

function loadFromStore() {
  cities = JSON.parse(localStorage.getItem("cities")) || [];
}



$(document).ready(function () {
  loadFromStore();
  if (cities[0]) {
    getCity(cities[cities.length - 1]);
  }

  citiesDisplay();
  
  $(".btn").on("click", function (event) {
    event.preventDefault();

    var input = $(".form-control");
    var city = input.val();
    if (!cities.includes(city)) {
      cities.push(city);
      saveToStore();
    }
    citiesDisplay();
    getCity(city);
  });
  
});


function getCity(city) {
  var currentDate = moment().format("LL");
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=imperial&appid=" +
    apiKey;

  

  $.ajax({ url: queryURL, type: "GET" }).then(function (response) {
    

    var iconLoc = response.weather[0].icon;

    var iconSrc = "https://openweathermap.org/img/wn/" + iconLoc + "@2x.png";
    var iconImage = $("<img>");
    iconImage.attr("src", iconSrc);

    $(".current-city").text(response.name + " (" + currentDate + ")");
    $(".current-city").append(iconImage);
    $("#temp").text("Temperature : " + response.main.temp + " °F");
    $("#hum").text("Humidity : " + response.main.humidity + " %");
    $("#windy").text("Wind Speed : " + response.wind.speed + " MPH");
    
    var tempF = (response.main.temp - 273.15) * 1.8 + 32;
    $(".tempF").text("Temperature (Kelvin) " + tempF);
    getUV(response.coord.lat, response.coord.lon);
    forecast(city);
    input.val("");
  });
}


// This is for displaying cities
function citiesDisplay() {
  var limit;

  if (cities.length < 10) {
    limit = cities.length;
  } else {
    limit = 10;
  }
  $("#cityViewed").html("");
  for (var c = 0; c < limit; c++) {
    var cityViewed = $("<div>");
    cityViewed.addClass("row").css({
      textAlign: "center",
      border: "1px solid silver",
      height: "50px",
      lineHeight: "50px",
      paddingLeft: "40px",
    });
    cityViewed.html(cities[c]);
    $("#cityViewed").prepend(cityViewed);

    //onClick event on every city
    cityViewed.attr("id", `${cities[c]}`);
    $(`#${cities[c]}`).on("click", function () {
      getCity($(this).text());
    });
  }
}

function getUV(lat, lon) {
  var uvIndexURL =
    "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=" +
    apiKey +
    "&lat=" +
    lat +
    "&lon=" +
    lon +
    "&cnt=1";
  $.ajax({ url: uvIndexURL, type: "GET" }).then(function (response) {
    $("#uv").text("UV-index : " + response[0].value);
  });
}
// Forecast for five days in advance

function forecast(city) {
  var forecastURL =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&appid=" +
    apiKey;

  $.ajax({ url: forecastURL, type: "GET" }).then(function (response) {
    var list = response.list;
    console.log(response);
    
    $("#forecast").html("");
    for (var i = 39; i >= 0; i = i - 8) {
      var temp = ((list[i].main.temp - 273.15) * 1.8 + 32).toFixed(2);
      var iconId = list[i].weather[0].icon;
      var humidity = list[i].main.humidity;
      var date = new Date(list[i].dt_txt);

      var day = date.getDate();
      var month = date.getMonth();
      var year = date.getFullYear();

      var formatedDate = `${month + 1}/${day}/${year}`;
      
      var col = $("<div>");
      col.addClass("col");
      var mycard = $("<div>");
      mycard.addClass("card");
      col.append(mycard);

      
      var p = $("<p>").text(formatedDate);
      

      var iconUrl = "https://openweathermap.org/img/wn/" + iconId + "@2x.png";

      var weatherImage = $("<img>");
      
      weatherImage.attr("src", iconUrl);

      var p1 = $("<p>").text("Temp: " + temp + "°F");
      var p2 = $("<p>").text("Humidity: " + humidity + "%");

      
      mycard.append(p);
      mycard.append(weatherImage);
      mycard.append(p1);
      mycard.append(p2);

      

      $("#forecast").prepend(col);
    }
  });
}
