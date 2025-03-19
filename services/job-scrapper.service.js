const scraper = require('../utils/scraper');

exports.scrapeAllJobPlatforms = async () => {
    try {
        // Run scraping functions concurrently
        const [indeedJobs, monsterJobs] = await Promise.all([
            scraper.scrapeIndeed(),
            scraper.scrapeMonster()
        ]);
        return [...indeedJobs, ...monsterJobs];
    } catch (error) {
        throw error;
    }
};
