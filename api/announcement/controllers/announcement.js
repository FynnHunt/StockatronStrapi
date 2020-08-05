'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async getList(ctx) {
        const entities = await strapi.services.announcement.find(ctx.query);
        const annData = entities.map(ann => {
            let movement = ann.movement.replace('%', '');
            if (movement[0] === '-') movement = -Math.abs(Number(movement));
            else movement = Number(movement);
            return { Announcement: ann.announcement, Movement: movement };
        })
    
        return annData;
    },
};
