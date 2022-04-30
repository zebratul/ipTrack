//--------------------------------------------------------------------init---------------------------------------------------------------
import {validateIPaddress, sanitize, googleDNS} from "./helpers"; //мои кастомные функции разбитые по файлам

const searchBar = document.querySelector('.search-bar'); //контейнер общей строки поиска
const form = document.querySelector('form');             //контейнер-форма инпута для поиска
const input = document.querySelector('input');           //строка ввода IP для поиска
const btn = document.querySelector('button');            //кнопка отправки IP
const ipOutput = document.querySelector('#ip');
const locationOutput = document.querySelector('#location');
const timezoneOutput = document.querySelector('#timezone');
const ispOutput = document.querySelector('#isp');        //поля с выводом результата запроса геолокации
const pointer  = document.querySelector('.pointer');     //иконка-маркер для API карты

btn.addEventListener('click', handleSubmit);   
form.addEventListener('submit', handleSubmit);           //основной функционал — получаем IP, отображаем карту
input.addEventListener('focus', () => {
    searchBar.classList.remove('show');
    }); //при фокусе в инпут убираем поп-ап с ошибкой введённого текста, если валидатиция не продейна
document.addEventListener("DOMContentLoaded", startIp);  //отображаем карту с текущей локацией пользователя при загрузке страницы

//---------------------------------------------------------------async func block---------------------------------------------------------

async function startIp() {  //отображаем локацию, с которой зашёл пользователь 
    let response = await fetch(`https://api.ipify.org?format=json`,{ //сначала получаем текущий IP пользователя
        method: 'GET', 
        });
    let result = await response.json();
    requestMapBox(result.ip); //затем запрашиваем геолокацию полученного IP. requestMapBox() также отрисует нам карту с полученными данными
}

async function requestMapBox(ip) { //перерисовываем карту по IP после получения ответа от службы геолокации 
    const apiKey = 'at_cTRu9FLcQSXSN7NvdPwjWq4zOl4y8';  //ключ хорошо бы хранить на сервере, чтобы у пользователя не было доступа сюда 
    const apiUrl = 'https://geo.ipify.org/api/v1?';
    let finalIrl = apiUrl + 'apiKey=' + apiKey + '&ipAddress=' + ip;
    let response = await fetch(`${finalIrl}`,{
        method: 'GET',
        });
    let result = await response.json();
    return initMap(result.location.lng, result.location.lat, result.ip, result.location.country, result.location.city, result.location.timezone, result.isp); //requestMapBox сам инициализирует отрисовку карты в контейнере. Возможно это стоит отсюда убрать, и инициализровать initMap отдельно
}  

async function handleSubmit(event) {
    event.preventDefault();
    let domainIp = sanitize(input.value);               //получаем вход с инпута
    if (validateIPaddress(domainIp)) {                  //сначала проверяем на формат IP, если проходит, то запрашиваем гео-сервер —
        await requestMapBox(domainIp);                  //и отрисовываем карту с полученными данными
        return;
    } 
    let dnsResponse = await googleDNS(`${domainIp}`);   //в случае если проверка regex не прошла, отправляем запрос в гугол dns
    if (dnsResponse.status) {                           //Если он успешно зарезолвился —
        await requestMapBox(dnsResponse.resolvedIp);    //Отрисовываем карту с полученными данными по резолвнутому айпишнику
        return; 
    }
    searchBar.classList.toggle('show');                 //если не то и не другое, то пользователь балбес. Делаем видимым ::after-попап с сообщением об ошибке.
}

//---------------------------------------------------------------normal func block--------------------------------------------------------------

function initMap(lat, lng, ip, country, loc, timezone, isp) {  //отрисовка карты и данных геолокации
    mapboxgl.accessToken = 'pk.eyJ1IjoiemVicmF0dWwiLCJhIjoiY2wyYzd4MW94MGtrbDNrbnJiMWhiMWc1YyJ9.7spJRrwYfDpJUl6SH_X0JA'; //токен хорошо бы хранить на сервере, чтобы у пользователя не было доступа сюда 
    const map = new mapboxgl.Map({
    container: 'map',                            // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [lat, lng], // starting position [lng, lat] //почему-то координаты флипнуты в официальном примере. хз почему, может я не посмотрел 
    zoom: 11                                     // starting zoom
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