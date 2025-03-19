const puppeteerScraper = require('../utils/puppeteerScraper');
// You can still import axios-based scrapers if needed
const scraper = require('../utils/scraper');

exports.scrapeAllJobPlatforms = async () => {
    try {
        // Use Puppeteer for Indeed and axios-based for others, for instance
        const [
            indeedJobs,
            monsterJobs,
            glassdoorJobs,
            careerBuilderJobs,
            simplyHiredJobs
        ] = await Promise.all([
            puppeteerScraper.scrapeIndeedWithPuppeteer(),
            scraper.scrapeMonster(),
            scraper.scrapeGlassdoor(),
            scraper.scrapeCareerBuilder(),
            scraper.scrapeSimplyHired()
        ]);
        return [
            ...indeedJobs,
            ...monsterJobs,
            ...glassdoorJobs,
            ...careerBuilderJobs,
            ...simplyHiredJobs
        ];
    } catch (error) {
        console.error('Error in scraping service:', error.message);
        throw error;
    }
};
