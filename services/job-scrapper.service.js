const scraper = require('../utils/scraper');

exports.scrapeAllJobPlatforms = async () => {
    try {
        const [
            indeedJobs,
            monsterJobs,
            glassdoorJobs,
            careerBuilderJobs,
            simplyHiredJobs
        ] = await Promise.all([
            scraper.scrapeIndeed(),
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
        throw error;
    }
};
