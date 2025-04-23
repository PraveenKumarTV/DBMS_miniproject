const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Display venue creation form
router.get('/add', (req, res) => {
  res.render('add_venues');
});

// Create a new venue
router.post('/add', async (req, res) => {
  try {
    const db = getDB();
    const { VenueID, VenueName, VenueType, Timings, Capacity, Facilities, Availability } = req.body;
    
    await db.collection('venues').insertOne({
      VenueID,
      VenueName,
      VenueType,
      Timings,
      Capacity: parseInt(Capacity),
      Facilities,
      Availability: !!Availability
    });

    res.redirect('/venue/list');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// List all venues
router.get('/list', async (req, res) => {
  try {
    const db = getDB();
    const venues = await db.collection('venues').find({}).toArray();
    res.render('displayVenues', { venues });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Toggle venue availability
router.post('/toggle/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const venue = await db.collection('venues').findOne({ VenueID: id });
    if (!venue) {
      return res.status(404).send('Venue not found');
    }

    await db.collection('venues').updateOne(
      { VenueID: id },
      { $set: { Availability: !venue.Availability } }
    );

    res.redirect('/venue/list');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;