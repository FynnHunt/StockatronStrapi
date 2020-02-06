const iscraper = require('../../api/i-scraper');

'use strict';

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/concepts/configurations.html#cron-tasks
 */

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  // '0 1 * * 1': () => {
  //
  // }
  '0 18 * * *': async () => {
    let result = await iscraper.getEndOfDayResults();
    let movers = iscraper.getMoversOnly(result);

    movers.forEach(async ann => {
      console.log(`Movement: ${ann.movement} News: ${ann.news}`);
      let entity = await strapi.services.announcement.create({
        "company": ann.company,
        "announcement": ann.announcement,
        "news": ann.news,
        "movement": ann.movement,
        "date": new Date(),
      });
    });
  }
};
