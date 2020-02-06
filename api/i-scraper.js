const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const iUrl = 'https://investegate.co.uk';
const scUrl = 'https://www.sharecast.com/uk_shares/results/news';

const getEndOfDayResults = async () =>
    axios(`${iUrl}/index.aspx?limit=-1`)
        .then(async (response) => {
            const html = response.data;
            const $ = cheerio.load(html);

            //writeFile('AnnouncementsPage.txt', html);

            const annTable = $('.announcementTabOne > tbody > tr');
            let announcements = getAnnouncementsArray($, annTable);
            let newsAndAnnouncements = await matchNewsWithAnnouncements(announcements);
            
            let topRFLink = iUrl + getTopRisersAndFallersLink($);

            let newsAnnMovement = await matchTopRisersWithNews(topRFLink, newsAndAnnouncements);
            let annPrint = [];
            newsAnnMovement.forEach(element => annPrint.push(element.print + '\n'));
            //writeFile('Announcements.txt', annPrint.join(''));
            newsAnnMovement.sort((a, b) => a.movement.localeCompare(b.movement));
            return newsAnnMovement;
        })
        .catch(console.error);

const createReadableResults = (announcements) => {
    let movedResults = [];
    let nonMovedResults = [];
    announcements.forEach(ann => {
        if (ann.movement !== 'N/A') {
            movedResults.push(ann.print + '\n');
        } else {
            nonMovedResults.push(ann.print + '\n');
        }
    });
    
    let resultString = movedResults.join('') + '\n\n\n' + nonMovedResults.join('');
    //writeFile(`Results/Investegate/Investegate-${getDateStamp()}.txt`, resultString);
    return resultString;
};

const getMoversOnly = (announcements) => {
    let movedResults = [];
    announcements.forEach(ann => {
        if (ann.movement !== 'N/A') {
            movedResults.push(ann);
        }
    });
    
    return movedResults;
};

const matchTopRisersWithNews = async (link, announcements) =>
    axios(link)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const risersBody = $('.KonaBody').text();
            //writeFile('TopRF.txt', risersBody);

            let risersArray = risersBody.split('\n');
            let companyRises = [];
            risersArray.forEach(element => {
                let arr = element.split(/   +/g);
                if (arr[2]) {
                    let companyName = arr[0].split(/  +/g);
                    companyRises.push({
                        company: companyName[0].trim(),
                        movement: arr[2].trim(),
                    });
                }
            });
     
            companyRises.forEach(company => {
                announcements.forEach(ann => {
                    if ((company.company == ann.company) || (ann.company.startsWith(company.company))) {
                        ann.movement = company.movement;
                    }
                    ann.print = `Company: ${ann.company}, Announcement: ${ann.announcement}, `;
                    if (ann.news !== 'N/A')
                        ann.print = ann.print + `News: ${ann.news}, `
                    if (ann.movement !== 'N/A')
                        ann.print = ann.print + `Movement: ${ann.movement}`;
                });
            });

            //Sort alphabetically
            announcements.sort((a, b) => a.company.localeCompare(b.company));
            return announcements;
        })
        .catch(console.error);

const getAnnouncementsArray = ($, annTable) => {
    let announcements = [];

    annTable.each(function () {
        const annmt = $(this).find('.annmt').text();
        const company = $(this).find('a > strong').text();

        if ((annmt.length > 0)  && company) {
            //announcements.push(`Company: ${company}, Announcement: ${annmt}`);
            announcements.push({
                company: company.trim(),
                announcement: annmt.trim(),
                news: 'N/A',
                movement: 'N/A',
                print: `Company: ${company}, Announcement: ${annmt}`,
            });
        }
    });

    return announcements;
};

const matchNewsWithAnnouncements = async (announcements) => {
    const news = await getShareCastHeadlines();
    announcements.forEach(annElement => {
        news.forEach(newsElement => {
            let company = annElement.company.replace(/\([^()]*\)/g, '').trim();
            let companyFirstWord = annElement.company.split(' ')[0];
            if (newsElement.includes(company) || newsElement.includes(companyFirstWord)) {
                //console.log(`I found a news match! ${newsElement} WITH ${company} OR ${companyFirstWord}`);
                annElement.news = newsElement;
                annElement.print = annElement.print + `, News: ${newsElement}`;
            }
        });
    });
    return announcements;
};

const getTopRisersAndFallersLink = ($) => {
    let link = '';
    $('a').each(function() { // Go through all links
        if ($(this).text() == 'Market Movers - Top risers and fallers at 16:00') { 
            link = $(this).attr('href');
        }
    });
    return link;
};

const getShareCastHeadlines = () =>
    axios(`${scUrl}`)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            const headlines = createHeadlinesArray($);
            const date = new Date();
            //writeFile(`Results/ShareCast/SharecastNews-${getDateStamp()}.txt`, headlines.join(',\n'));
            return headlines;
        })
        .catch(console.error);

const createHeadlinesArray = ($) => {
    const headlinesArr = [];
    const headlines = $('.headlineh6');
    headlines.each(function() {
        hl = $(this).text();
        headlinesArr.push(hl);
        //console.log(hl);
    });
    return headlinesArr;
};

//MOVE THESE TO UTIL 
const writeFile = (fileName, data) => {
    fs.writeFile(fileName, data, (err) => { 
        if (err) throw err; 
    });
};

const getDateStamp = () => {
    const date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);   
    let year = date_ob.getFullYear();
    return `${date}-${month}-${year}`;
};

exports.getEndOfDayResults = getEndOfDayResults;
exports.createReadableResults = createReadableResults;
exports.getMoversOnly = getMoversOnly;