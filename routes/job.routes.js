const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controllers');

router.get('/', jobController.getJobs);

module.exports = router;
