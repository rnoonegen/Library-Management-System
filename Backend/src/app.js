const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { errorHandler, AppError } = require('./middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;
