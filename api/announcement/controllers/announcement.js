'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const getMovement = movement => {
    let numMovement = movement.replace('%', '');
    if (numMovement[0] === '-') numMovement = -Math.abs(Number(numMovement));
    else numMovement = Number(numMovement);
    return numMovement;
}

module.exports = {
    async getAnnList(ctx) {
        const entities = await strapi.services.announcement.find(ctx.query);
        const annData = entities.map(ann => {
            const movement = getMovement(ann.movement);
            return { Announcement: ann.announcement, Movement: movement };
        });   
        return annData;
    },
    async getNewsList(ctx) {
        const entities = await strapi.services.announcement.find(ctx.query);
        const annData = entities.map(ann => {
            if (ann.news !== 'N/A') {
                const movement = getMovement(ann.movement);
                return { Announcement: ann.news, Movement: movement };
            } else return null;
        }).filter(n => n);
        return annData;
    },
};
