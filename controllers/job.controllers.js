const jobScraperService = require('../services/job-scrapper.service');

exports.getJobs = async (req, res) => {
    try {
        const jobs = await jobScraperService.scrapeAllJobPlatforms();
        res.json({ success: true, data: jobs });
    } catch (error) {
        console.error('Error in job controller:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
