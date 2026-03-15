const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const app = require('../../server');

let payload = {}; // данные POST запроса
let response = null; // ответ API
let discount = null; // скидка пользователя


// Проверка доступности сервиса
Given('сервис доступен по адресу {string}', async function (path) {

    const res = await request(app).get(path);

    if (res.status !== 200 || res.body.status !== 'online') {
        throw new Error('Сервис недоступен');
    }

});


// Получение персональной скидки
When(/^пользователь с id (\d+) запрашивает скидку через "(.*)"$/, async function (userId, path) {

    const res = await request(app).get(path);

    if (res.status !== 200) {
        throw new Error('Не удалось получить скидку');
    }

    discount = res.body.discount;
    payload.userId = Number(userId);
    payload.discount = discount;

});


// Получение списка товаров из JSON строки
Given(/^корзина содержит товары "(.*)"$/, function (json) {

    payload.prices = JSON.parse(json);

});


// Отправка запроса оформления заказа
When('пользователь оформляет заказ через {string}', async function (path) {

    response = await request(app)
        .post(path)
        .send(payload);

});


// Проверка статус-кода
Then('API возвращает статус-код {int}', function (expectedStatus) {

    if (response.status !== expectedStatus) {
        throw new Error(
            `Ожидался статус ${expectedStatus}, получен ${response.status}`
        );
    }

});


// Проверка итоговой суммы
Then('итоговая сумма заказа равна {float}', function (expectedTotal) {

    const actual = response.body.total;

    if (Math.abs(actual - expectedTotal) > 0.01) {
        throw new Error(
            `Неверная сумма заказа. Ожидалось ${expectedTotal}, получено ${actual}`
        );
    }

});


// Проверка поля coupon_sent
Then('поле coupon_sent равно {word}', function (expectedValue) {

    const expected = expectedValue === "true";
    const actual = response.body.coupon_sent;

    if (actual !== expected) {
        throw new Error(
            `Ожидалось coupon_sent = ${expected}, получено ${actual}`
        );
    }

});