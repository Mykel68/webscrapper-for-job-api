const axios = require('axios');
const cheerio = require('cheerio');

// Scrape Indeed job listings
const scrapeIndeed = async () => {
    try {
        const url = 'https://www.indeed.com/jobs?q=software+developer';
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const jobs = [];

        // The selectors may need to be updated based on Indeed's current HTML structure.
        $('.jobsearch-SerpJobCard').each((i, el) => {
            const title = $(el).find('.jobtitle').text().trim();
            const company = $(el).find('.company').text().trim();
            const location = $(el).find('.location').text().trim();
            // Construct a full URL if necessary
            const relativeLink = $(el).find('a').attr('href');
            const link = relativeLink ? `https://www.indeed.com${relativeLink}` : '';
            jobs.push({ title, company, location, link });
        });
        return jobs;
    } catch (error) {
        console.error('Error scraping Indeed:', error);
        return [];
    }
};

// Scrape Monster job listings
const scrapeMonster = async () => {
    try {
        const url = 'https://www.monster.com/jobs/search/?q=Software-Developer';
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const jobs = [];

        // Update the selectors to match Monster's current HTML structure.
        $('.summary').each((i, el) => {
            const title = $(el).find('h2.title').text().trim();
            const company = $(el).find('.company').text().trim();
            const location = $(el).find('.location').text().trim();
            const link = $(el).find('a').attr('href');
            jobs.push({ title, company, location, link });
        });
        return jobs;
    } catch (error) {
        console.error('Error scraping Monster:', error);
        return [];
    }
};

module.exports = {
    scrapeIndeed,
    scrapeMonster,
};
