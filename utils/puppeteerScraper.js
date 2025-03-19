// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// const scrapeIndeedWithPuppeteer = async () => {
//     try {
//         const url = 'https://ng.indeed.com/jobs?q=software+developer&l=&from=searchOnHP%2Cwhatautocomplete&vjk=025a7dea479e33fa';
//         const browser = await puppeteer.launch({ headless: true });
//         const page = await browser.newPage();

//         // Set a realistic User-Agent
//         await page.setUserAgent(
//             'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
//             'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
//         );

//         await page.goto(url, { waitUntil: 'networkidle2' });
//         const html = await page.content();
//         await browser.close();

//         const $ = cheerio.load(html);
//         const jobs = [];

//         // Updated selectors for Indeed's new structure
//         $('a.tapItem').each((i, el) => {
//             // h2.jobTitle > span often holds the job title text
//             const title = $(el).find('h2.jobTitle span').text().trim();
//             const company = $(el).find('.companyName').text().trim();
//             const location = $(el).find('.companyLocation').text().trim();
//             const relativeLink = $(el).attr('href');
//             const link = relativeLink ? `https://www.indeed.com${relativeLink}` : '';
//             // Only add if there's a title (to filter out non-job elements)
//             if (title) {
//                 jobs.push({ title, company, location, link });
//             }
//         });
//         return jobs;
//     } catch (error) {
//         console.error('Error scraping Indeed with Puppeteer:', error.message);
//         return [];
//     }
// };

// module.exports = { scrapeIndeedWithPuppeteer };

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

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
scrapeIndeed('software developer', 'New York, NY').then((jobs) =>
    console.log(jobs)
);
