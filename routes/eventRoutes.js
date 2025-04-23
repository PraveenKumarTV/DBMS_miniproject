const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const moment = require('moment');

// Display all events
  router.get('/', async (req, res) => {
    try {
      const db = getDB();
  
      const events = await db.collection('events').find({}).toArray();
      const venues = await db.collection('venues').find({}).toArray();
  
      const currentDate = new Date();
      const upcomingEvents = events.filter(event => new Date(event.date) > currentDate);
      const completedEvents = events.filter(event => new Date(event.date) <= currentDate);
  
    
      const venueMap = {};
      venues.forEach(venue => {
        venueMap[venue._id.toString()] = venue.VenueName;
      });
  
     
      upcomingEvents.forEach(event => {
        event.venueName = venueMap[event.location?.toString()] || "Unknown Venue";
      });
      completedEvents.forEach(event => {
        event.venueName = venueMap[event.location?.toString()] || "Unknown Venue";
      });
  
      res.render('displayEvents', {
        upcomingEvents,
        completedEvents
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  


router.get('/create', async (req, res) => {
  try {
    const db = getDB();
    const venues = await db.collection('venues').find({ Availability: true }).toArray();
    res.render('createEvent', { venues });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Create an event
router.post('/', async (req, res) => {
  try {
    const { name, description, venue, date, time } = req.body;
    const { ObjectId } = require('mongodb');

    console.log("POST body:", req.body); // debug

    let venueId;
    try {
      venueId = new ObjectId(venue);
    } catch (err) {
      console.error("Invalid ObjectId:", venue);
      return res.status(400).send("Invalid Venue ID");
    }

    const db = getDB();
    await db.collection('events').insertOne({
      name,
      description,
      location: new ObjectId(venue), // ✅ save venue as ObjectId in location
      date: new Date(`${date}T${time}`),
      createdAt: new Date()
    });
    
    res.redirect('/events');
  } catch (err) {
    console.error("POST /events error:", err);
    res.status(500).send('Server Error');
  }
});


// View event details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).send('Invalid event ID format');
    }
    
    const db = getDB();
    const event = await db.collection('events').findOne({ _id: new ObjectId(id) });
    
    if (!event) {
      return res.status(404).send('Event not found');
    }
    
    res.render('eventDetails', { event });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;