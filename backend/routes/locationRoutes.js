const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// GET all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error });
  }
});

// GET location by address
router.get('/address/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const location = await Location.findOne({ address });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching location details', error });
  }
});

// POST create a location
router.post('/', async (req, res) => {
  try {
    const { name, address, city, state, latitude, longitude } = req.body;
    const location = new Location({ name, address, city, state, latitude, longitude });
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: 'Error creating location', error });
  }
});

// DELETE a location by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.status(200).json({ message: 'Location deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting location', error });
  }
});

module.exports = router;
