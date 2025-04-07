const { db } = require('../../utils/db');

function createRegion(region) {
    return db.region.create({
        data: region,
    });
}

function findRegionById(id) {
    return db.region.findUnique({
        where: {
            id: id,
        },
    });
}

function editRegionById(id, region) {
    return db.region.update({
        where: {
            id,
        },
        data: region,
    });
}

function deleteRegionById(id) {
    return db.region.delete({
        where: {
            id,
        },
    });
}

module.exports = {
    createRegion,
    findRegionById,
    editRegionById,
    deleteRegionById,
};