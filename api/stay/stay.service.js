// const fs = require('fs')
const dbService = require('../../services/db.service.js');
const ObjectId = require('mongodb').ObjectId;
const logger = require('../../services/logger.service.js');
const asyncLocalStorage = require('../../services/als.service');

module.exports = {
  query,
  getById,
  remove,
  add,
  update,
  getHostStays,
};
async function getHostStays(hostId) {
  try {
    const collection = await dbService.getCollection('stay');
    const id = new ObjectId(hostId);
    var stays = await collection.find({ 'host._id': id }).toArray();
    return stays;
  } catch (err) {
    logger.error('Cannot find stays owned by this host', err);
    throw err;
  }
}
async function query(filterBy) {
  try {
    const criteria = _buildCriteria(filterBy);
    const collection = await dbService.getCollection('stay');
    const stays = await collection.find(criteria).toArray();
    return stays;
  } catch (err) {
    logger.error('cannot find stays', err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.propertyType) {
    criteria.type = { $in: [filterBy.propertyType] };
  }
  if (filterBy.priceRange && filterBy.priceRange.length) {
    criteria.price = {
      $gte: +filterBy.priceRange[0],
      $lte: +filterBy.priceRange[1],
    };
  }
  if (filterBy.amenities && filterBy.amenities.length) {
    criteria.amenities = { $all: filterBy.amenities };
  }
  if (filterBy.city) {
    if (filterBy.city === 'flexible') {
      criteria['loc.city'] = { $in: ['Bora Bora', 'Hawaii', 'France'] };
    } else {
      const cityCriteria = { $regex: filterBy.city, $options: 'i' };
      criteria['loc.address'] = cityCriteria;
    }
  }
  if (filterBy.totalGuests) {
    criteria.capacity = { $gte: +filterBy.totalGuests };
  }

  if (filterBy.hostId) {
    criteria['host._id'] = ObjectId(filterBy.hostId);
  }
  return criteria;
}

async function getById(stayId) {
  try {
    const collection = await dbService.getCollection('stay');
    const stay = collection.findOne({ _id: ObjectId(stayId) });
    return stay;
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err);
    throw err;
  }
}

async function remove(stayId) {
  try {
    const collection = await dbService.getCollection('stay');
    await collection.deleteOne({ _id: ObjectId(stayId) });
  } catch (err) {
    logger.error(`cannot remove stay ${stayId}`, err);
    throw err;
  }
}

async function add(stay) {
  try {
    const stayToAdd = {
      name: stay.name,
      price: stay.price,
      host: {
        _id: ObjectId(stay.host._id),
        fullname: stay.host.fullname,
        imgUrl: stay.host.imgUrl,
      },
      summary: stay.summary || '',
      imgUrls: stay.imgUrls,
      type: stay.type || 'Entire rental unit',
      capacity: stay.capacity || 2,
      amenities: stay.amenities || [],
      loc: stay.loc,
      avgRate: stay.avgRate,
      reviews: stay.reviews || [],
    };
    const collection = await dbService.getCollection('stay');
    await collection.insertOne(stayToAdd);
    return stayToAdd;
  } catch (err) {
    logger.error('Cannot insert stay', err);
    throw err;
  }
}
async function update(stay) {
  try {
    const stayToUpdate = {
      _id: ObjectId(stay._id),
      name: stay.name,
      type: stay.type,
      imgUrls: stay.imgUrls,
      price: stay.price,
      avgRate: stay.avgRate,
      summary: stay.summary,
      capacity: stay.capacity,
      amenities: stay.amenities || [],
      // host: stay.host,
      host: {
        _id: ObjectId(stay.host._id),
        fullname: stay.host.fullname,
        imgUrl: stay.host.imgUrl,
      },
      loc: stay.loc,
      reviews: stay.reviews || [],
      likedByUsers: stay.likedByUsers || [],
    };
    const collection = await dbService.getCollection('stay');
    await collection.updateOne(
      { _id: stayToUpdate._id },
      { $set: stayToUpdate }
    );
    console.log('stayToUpdate', stayToUpdate);
    return stayToUpdate;
  } catch (err) {
    logger.error(`cannot update stay ${stay._id}`, err);
    throw err;
  }
}


