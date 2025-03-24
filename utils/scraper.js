const axios = require('axios');
const cheerio = require('cheerio');
const axiosRetry = require('axios-retry').default || require('axios-retry');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Enable retry with exponential delay for failed axios requests
axiosRetry(axios, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        // Retry on network errors or DNS lookup errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'EAI_AGAIN';
    }
});

/**
 * Scrape Indeed using Puppeteer.
 * This version uses headless: false for debugging; set headless: true when production-ready.
 */
const scrapeIndeed = async (searchQuery, location) => {
    if (typeof searchQuery !== 'string' || typeof location !== 'string') {
        throw new Error('searchQuery and location must be strings');
    }

    const formattedQuery = searchQuery.replace(/\s+/g, '+');
    const formattedLocation = location.replace(/\s+/g, '+');
    const url = `https://www.indeed.com/jobs?q=${formattedQuery}&l=${formattedLocation}`;

    try {
        // For debugging, headless: false allows you to see the browser
        const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        );

        await page.goto(url, { waitUntil: 'networkidle2' });

        // Take a screenshot for debugging to see if a CAPTCHA or block page is served
        await page.screenshot({ path: 'indeed_debug.png', fullPage: true });

        // Wait for job cards to appear using an updated selector (increase timeout if needed)
        await page.waitForSelector('div.job_seen_beacon', { timeout: 60000 });

        const content = await page.content();
        const $ = cheerio.load(content);
        const jobs = [];

        $('div.job_seen_beacon').each((index, element) => {
            const jobTitle = $(element).find('h2.jobTitle').text().trim();
            const company = $(element).find('.companyName').text().trim();
            const jobLocation = $(element).find('.companyLocation').text().trim();
            const summary = $(element).find('.job-snippet').text().trim();
            const relativeLink = $(element).find('a').attr('href');
            const jobLink = relativeLink ? `https://www.indeed.com${relativeLink}` : '';

            if (jobTitle) {
                jobs.push({
                    jobTitle,
                    company,
                    location: jobLocation,
                    summary,
                    jobLink,
                });
            }
        });

        await browser.close();
        return jobs;
    } catch (error) {
        console.error('Error scraping Indeed:', error.message);
        return [];
    }
};

/**
 * Scrape Monster job listings using axios and cheerio.
 */
const scrapeMonster = async () => {
    try {
        const url = 'https://www.monster.com/jobs/search/?q=Software-Developer';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
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

/**
 * Scrape Glassdoor job listings using axios and cheerio.
 */
const scrapeGlassdoor = async () => {
    try {
        const url = 'https://www.glassdoor.com/Job/software-developer-jobs-SRCH_KO0,18.htm';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
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

/**
 * Scrape CareerBuilder job listings using axios and cheerio.
 */
const scrapeCareerBuilder = async () => {
    try {
        const url = 'https://www.careerbuilder.com/jobs-software-developer';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
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

/**
 * Scrape SimplyHired job listings using axios and cheerio.
 */
const scrapeSimplyHired = async () => {
    try {
        const url = 'https://www.simplyhired.com/search?q=software+developer';
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
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
