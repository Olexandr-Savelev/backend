const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/errorMiddleware');
const userRouter = require('./routes/userRoute');
const productRouter = require('./routes/productRoute');
const contactRouter = require('./routes/contactRoute');

mongoose.set('strictQuery', false);

const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

//Routes Middlewares
app.use('/api/users', userRouter);
app.use('/api/product', productRouter);
app.use('/api/contact', contactRouter);

app.get('/', async (req, res) => {
    res.send('Hi man!');
});

//Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

//Server starting
mongoose
    .connect(process.env.MONGO_URI)
    .then(
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        })
    )
    .catch((err) => console.log(err));
