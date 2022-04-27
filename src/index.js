//--------------------------------------------------------------------init---------------------------------------------------------------
import {lookup, resolve} from "dns"; //что я делаю не так
import {validateIPaddress, sanitize} from "./helpers"; //мои кастомные функции разбитые по файлам без проблем подгружаются

const searchBar = document.querySelector('.search-bar'); //контейнер общей строки поиска
const form = document.querySelector('form'); //контейнер-форма для поиска
const input = document.querySelector('input'); //строка ввода IP для поиска
const btn = document.querySelector('button'); //кнопка отправки IP
const ipOutput = document.querySelector('#ip');
const locationOutput = document.querySelector('#location');
const timezoneOutput = document.querySelector('#timezone');
const ispOutput = document.querySelector('#isp'); //поля с выводом результата запроса геолокации
const pointer  = document.querySelector('.pointer');

btn.addEventListener('click', submitIp);   
form.addEventListener('submit', submitIp); //основной функционал — получаем IP, отображаем карту
input.addEventListener('focus', () => {
    searchBar.classList.remove('show');
  }); //при фокусе в инпут убираем поп-ап с ошибкой введённого текста, если валидатиция не продейна
document.addEventListener("DOMContentLoaded", startIp); //отображаем карту с текущей локацией пользователя


//---------------------------------------------------------------async func block---------------------------------------------------------

lookup('nodejs.org', (err, value) => { //нихрена не работает
    if(err) { 
        console.log(err); 
        return; 
    } 
    console.log(value); 
}) 

resolve('https://yandex.ru/', (err, value) => {  //нихрена не работает as well
    if(err) { 
        console.log(err); 
        return; 
    } 
    console.log(value); 
}) 

async function startIp() {  //отображаем локацию, с которой зашёл пользователь 
    let response = await fetch(`https://api.ipify.org?format=json`,{
        method: 'GET', 
        });
    let result = await response.json();
    input.value = sanitize(result.ip);
    const clickEvent = new Event("click", {"bubbles":true, "cancelable":false}); //я не знаю как нормально инициализировать карту — мне нужно в submitIp передать ивент, чтобы event.preventDefault() формы сработал. Поэтому я симулирую клик мышкой на кнопку... Звучит супер-тупо но работает. 
    btn.dispatchEvent(clickEvent); //если отказаться от формы то естественно работает лучше — можно инициализировать напрямую не боясь перезагрузки страницы 
    input.value = '';
}

async function submitIp(event) { //перерисовываем карту по введённому IP после получения ответа от службы геолокации 
    event.preventDefault();
    const apiKey = 'at_cTRu9FLcQSXSN7NvdPwjWq4zOl4y8';  //ключ хорошо бы хранить на сервере, чтобы у пользователя не было доступа сюда 
    const apiUrl = 'https://geo.ipify.org/api/v1?';
    let ip = sanitize(input.value);
    if (validateIPaddress(ip)) {
        let finalIrl = apiUrl + 'apiKey=' + apiKey + '&ipAddress=' + ip;
        console.log(ip, 'has been submitted');
        let response = await fetch(`${finalIrl}`,{
            method: 'GET',
            });
        let result = await response.json();
        console.log(result);
        return initMap(result.location.lng, result.location.lat, result.ip, result.location.country, result.location.city, result.location.timezone, result.isp); //чёртовы объекты, немного триггерят длинные дата.субдата.субдата.субдата конструкции
    } else {
        searchBar.classList.toggle('show'); //если проверка не пройдена, отрисовываем ::after-попап с сообщением об ошибке 
    }
}   

//---------------------------------------------------------------normal func block--------------------------------------------------------------

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
    const marker = new mapboxgl.Marker({
        element: pointer,
        anchor: 'bottom'
    }).setLngLat([lat, lng])
        .addTo(map);
    pointer.style.display = 'block'; //отрисовываем указатель после того как его карта поставила куда надо
}
