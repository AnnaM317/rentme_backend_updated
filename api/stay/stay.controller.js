const stayService = require('./stay.service.js');
const logger = require('../../services/logger.service');

module.exports = {
  getStays,
  getStayById,
  removeStay,
  addStay,
  updateStay,
  getHostStays,
};

async function getHostStays(req, res) {
  try {
    const hostId = req.params.id;
    const stays = await stayService.getHostStays(hostId);
    res.json(stays);
  } catch {
    logger.error('Cannot get stay', err);
    res.status(500).send({ err: 'Failed to get stay' });
  }
}

async function getStays(req, res) {
  try {
    const stays = await stayService.query(req.query);
    res.json(stays);
    console.log('stays in stay.controll:', stays.length);
  } catch (err) {
    logger.error('Cannot get stays', err);
    res.status(500).send({ err: 'Failed to get stays' });
  }
}

async function getStayById(req, res) {
  try {
    const stayId = req.params.id;
    const stay = await stayService.getById(stayId);
    res.json(stay);
  } catch {
    logger.error('Cannot get stay', err);
    res.status(500).send({ err: 'Failed to get stay' });
  }
}

async function addStay(req, res) {
  try {
    const stay = req.body;
    // console.log('controller', stay);
    const addedStay = await stayService.add(stay);
    res.json(addedStay);
  } catch (err) {
    logger.error('Failed to add stay', err);
    res.status(500).send({ err: 'Failed to add stay' });
  }
}

async function updateStay(req, res) {
  try {
    const stay = req.body;
    const updatedStay = await stayService.update(stay);
    res.json(updatedStay);
  } catch (err) {
    logger.error('Failed to update stay', err);
    res.status(500).send({ err: 'Failed to update stay' });
  }
}

async function removeStay(req, res) {
  try {
    const stayId = req.params.id;
    await stayService.remove(stayId);
    res.send({ msg: 'Deleted successfully' });
  } catch {
    logger.error('Failed to remove stay', err);
    res.status(500).send({ err: 'Failed to remove stay' });
  }
}

