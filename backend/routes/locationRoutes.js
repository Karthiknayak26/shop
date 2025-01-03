const express = require('express');
const app = express.Router();
const Location = require('../models/Location');

// GET all locations
app.get('/', async (req, res) => {
  try {
    // Fetch all locations
    const locations = await Location.find(); // Return all locations
    res.status(200).json(locations); // Send the array of locations
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error });
  }
});

// GET location by address (for the selected address fetching)
app.get('/address/:address', async (req, res) => {
  const { address } = req.params;
  try {
    // Find the location by address
    const location = await Location.findOne({ address });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(200).json(location); // Send the location details
  } catch (error) {
    res.status(500).json({ message: 'Error fetching location details', error });
  }
});

// POST create a location
app.post('/', async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    const location = new Location({ name, address, latitude, longitude });
    await location.save();
    res.status(201).json(location); // Return the created location
  } catch (error) {
    res.status(400).json({ message: 'Error creating location', error });
  }
});

// DELETE a location
app.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    res.status(200).json({ message: 'Location deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting location', error });
  }
});

module.exports = app;
