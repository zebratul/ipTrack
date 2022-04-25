//--------------------------------------------------------------------init---------------------------------------------------------------

const form = document.querySelector('form'); //контейнер-форма 
const input = document.querySelector('input'); //строка ввода IP для поиска
const btn = document.querySelector('button'); //кнопка отправки IP
const ipOutput = document.querySelector('#ip');
const locationOutput = document.querySelector('#location');
const timezoneOutput = document.querySelector('#timezone');
const ispOutput = document.querySelector('#isp'); //поля с выводом результата запроса геолокации
 
btn.addEventListener('click', submitIp);   
form.addEventListener('submit', submitIp); //основной функционал — получаем IP, отображаем карту
document.addEventListener("DOMContentLoaded", startIp); //отображаем карту с текущей локацией пользователя

//---------------------------------------------------------------async func block---------------------------------------------------------

async function startIp(){
    let response = await fetch(`https://api.ipify.org?format=json`,{
        method: 'GET', 
        });
    let result = await response.json();
    input.value = sanitize(result.ip);
    const clickEvent = new Event("click", {"bubbles":true, "cancelable":false});
    btn.dispatchEvent(clickEvent); //я не знаю как нормально инициализировать карту — мне нужно в submitIp передать ивент, чтобы event.preventDefault() формы сработал. Поэтому я симулирую клик мышкой на кнопку... Звучит супер-тупо но работает. 
    input.value = '';
}

async function submitIp(event) { //перерисовываем карту после получения ответа от службы геолокации по IP
    event.preventDefault();
    const apiKey = 'at_cTRu9FLcQSXSN7NvdPwjWq4zOl4y8';  //ключ хорошо бы хранить на сервере, чтобы у пользователя не было доступа сюда 
    const apiUrl = 'https://geo.ipify.org/api/v1?';
    let ip = sanitize(input.value);
    if (ValidateIPaddress(ip)) {
        let finalIrl = apiUrl + 'apiKey=' + apiKey + '&ipAddress=' + ip;
        console.log(ip, 'has been submitted');
        let response = await fetch(`${finalIrl}`,{
            method: 'GET',
            });
        let result = await response.json();
        console.log(result);
        return initMap(result.location.lng, result.location.lat, result.ip, result.location.country, result.location.city, result.location.timezone, result.isp); //чёртовы объекты, немного триггерят длинные дата.субдата.субдата.субдата конструкции
    }
}   

function initMap(lat, lng, ip, country, loc, timezone, isp) {  //отрисовка карты и данных геолокации
    mapboxgl.accessToken = 'pk.eyJ1IjoiemVicmF0dWwiLCJhIjoiY2wyYzd4MW94MGtrbDNrbnJiMWhiMWc1YyJ9.7spJRrwYfDpJUl6SH_X0JA'; //токен хорошо бы хранить на сервере, чтобы у пользователя не было доступа сюда 
    const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [lat, lng], // starting position [lng, lat] //почему-то координаты флипнуты в официальном примере. хз почему, может я не посмотрел 
    zoom: 11 // starting zoom
    });
    ipOutput.textContent = ip;
    locationOutput.textContent = country + ' ' + loc;
    timezoneOutput.textContent = timezone;
    ispOutput.textContent = isp;
}

//---------------------------------------------------------------normal func block--------------------------------------------------------------

function sanitize(input) {
    let result = input.trim(); 
    return result;
}

function ValidateIPaddress(userInput) {  //валидация инпута от юзера. Честно скопировано из этих ваших интернетов 
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(userInput)) {  
      return true
    }  
    alert("You have entered an invalid IP address!");
    return false
}