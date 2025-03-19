const express = require('express');
const app = express();
const jobRoutes = require('./routes/job.routes');
const logger = require('./middlewares/logger');

// Global middleware
app.use(express.json());
app.use(logger);

// API routes
app.use('/api/jobs', jobRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
