const axios = require('axios');
const cheerio = require('cheerio');
const axiosRetry = require('axios-retry').default || require('axios-retry');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());


// Enable retry with exponential delay for failed requests
axiosRetry(axios, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        // Retry on network errors or DNS lookup errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'EAI_AGAIN';
    }
});

// Scrape Indeed job listings
const scrapeIndeed = async (searchQuery, location) => {
    const formattedQuery = searchQuery.replace(/\s+/g, '+');
    const formattedLocation = location.replace(/\s+/g, '+');
    const url = `https://www.indeed.com/jobs?q=${formattedQuery}&l=${formattedLocation}`;

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Set a realistic User-Agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        );

        // Navigate to the Indeed search results page
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for job cards to load
        await page.waitForSelector('a.tapItem');

        // Extract the page content
        const content = await page.content();
        const $ = cheerio.load(content);
        const jobs = [];

        // Parse job listings
        $('a.tapItem').each((index, element) => {
            const jobTitle = $(element).find('h2.jobTitle span').text().trim();
            const company = $(element).find('.companyName').text().trim();
            const location = $(element).find('.companyLocation').text().trim();
            const summary = $(element).find('.job-snippet').text().trim();
            const postDate = $(element).find('.date').text().trim();
            const jobLink = 'https://www.indeed.com' + $(element).attr('href');

            jobs.push({
                jobTitle,
                company,
                location,
                summary,
                postDate,
                jobLink,
            });
        });

        await browser.close();
        return jobs;
    } catch (error) {
        console.error('Error scraping Indeed:', error);
        return [];
    }
};

// Example usage
// scrapeIndeed('software developer', 'New York, NY').then((jobs) =>
//     console.log(jobs)
// );

// Scrape Monster job listings
const scrapeMonster = async () => {
    try {
        const url = 'https://www.monster.com/jobs/search/?q=Software-Developer';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        const $ = cheerio.load(data);
        const jobs = [];
        $('.summary').each((i, el) => {
            const title = $(el).find('h2.title').text().trim();
            const company = $(el).find('.company').text().trim();
            const location = $(el).find('.location').text().trim();
            const link = $(el).find('a').attr('href');
            jobs.push({ title, company, location, link });
        });
        return jobs;
    } catch (error) {
        console.error('Error scraping Monster:', error.message);
        return [];
    }
};

// Scrape Glassdoor job listings
const scrapeGlassdoor = async () => {
    try {
        const url = 'https://www.glassdoor.com/Job/software-developer-jobs-SRCH_KO0,18.htm';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        const $ = cheerio.load(data);
        const jobs = [];
        $('.jl').each((i, el) => {
            const title = $(el).find('.jobInfoItem.jobTitle').text().trim();
            const company = $(el).find('.jobInfoItem.jobEmpolyerName').text().trim();
            const location = $(el).find('.subtle.loc').text().trim();
            const relativeLink = $(el).find('a').attr('href');
            const link = relativeLink ? `https://www.glassdoor.com${relativeLink}` : '';
            jobs.push({ title, company, location, link });
        });
        return jobs;
    } catch (error) {
        console.error('Error scraping Glassdoor:', error.message);
        return [];
    }
};

// Scrape CareerBuilder job listings
const scrapeCareerBuilder = async () => {
    try {
        const url = 'https://www.careerbuilder.com/jobs-software-developer';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        const $ = cheerio.load(data);
        const jobs = [];
        $('.data-results-content').each((i, el) => {
            const title = $(el).find('h2').text().trim();
            const company = $(el).find('.data-details .company').text().trim();
            const location = $(el).find('.data-details .location').text().trim();
            const link = $(el).find('a').attr('href');
            jobs.push({ title, company, location, link });
        });
        return jobs;
    } catch (error) {
        console.error('Error scraping CareerBuilder:', error.message);
        return [];
    }
};

// Scrape SimplyHired job listings
const scrapeSimplyHired = async () => {
    try {
        const url = 'https://www.simplyhired.com/search?q=software+developer';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        const $ = cheerio.load(data);
        const jobs = [];
        $('.SerpJob-jobCard').each((i, el) => {
            const title = $(el).find('.SerpJob-link').text().trim();
            const company = $(el).find('.jobposting-company').text().trim();
            const location = $(el).find('.jobposting-location').text().trim();
            const link = $(el).find('a').attr('href');
            jobs.push({ title, company, location, link });
        });
        return jobs;
    } catch (error) {
        console.error('Error scraping SimplyHired:', error.message);
        return [];
    }
};

module.exports = {
    scrapeIndeed,
    scrapeMonster,
    scrapeGlassdoor,
    scrapeCareerBuilder,
    scrapeSimplyHired
};
