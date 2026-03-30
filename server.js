const express = require('express');
const path = require('path'); // нужен для корректного пути к папке public
const calculateCartTotal = require('./src/cart');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // говорит серверу раздавать файлы из папки public

const PORT = 3000;

// Статус сервера
app.get('/api/status', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date()
    });
});

// Получение персональной скидки пользователя
app.get('/api/users/:id/discount', (req, res) => {
    const discount = 10; // Имитация БД

    res.status(200).json({
        userId: Number(req.params.id),
        discount: discount
    });
});

// Оформление заказа 
app.post('/api/cart/checkout', async (req, res) => {
    try {
        const { userId, prices, discount } = req.body;

        // Проверка структуры запроса
        if (userId == null || prices == null || discount == null) {
            return res.status(400).json({
                status: "error",
                message: "Некорректные входные данные"
            });
        }

        // Вызов бизнес-логики
        const result = await calculateCartTotal({ userId, prices, discount });

        res.status(200).json({
            status: "success",
            total: result.total,
            coupon_sent: result.total > 10000
        });

    } catch (err) {
        res.status(400).json({
            status: "error",
            message: err.message
        });
    }
});

// сервер запускается ТОЛЬКО если файл запущен напрямую
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
}

// экспорт для Supertest и Cucumber
module.exports = app;