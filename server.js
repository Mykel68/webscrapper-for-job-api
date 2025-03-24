const express = require('express');
const app = express();
const jobRoutes = require('./routes/job.routes');
const logger = require('./middlewares/logger');
const { PORT } = require('./config/env');


// Global middleware
app.use(express.json());
app.use(logger);

// API routes
app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => {
    res.send('Welcome... Hello World');
});

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`,
    });
});


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
