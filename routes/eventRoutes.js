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
    
    // Separate events into upcoming and completed
    const currentDate = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) > currentDate);
    const completedEvents = events.filter(event => new Date(event.date) <= currentDate);
    
    res.render('displayEvents', {
      upcomingEvents,
      completedEvents
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Display event creation form
router.get('/create', (req, res) => {
  res.render('createEvent');
});

// Create an event
router.post('/', async (req, res) => {
  try {
    const { name, description, location, date, time } = req.body;
    
    // Combine date and time
    const eventDateTime = new Date(`${date}T${time}`);
    
    const db = getDB();
    await db.collection('events').insertOne({
      name,
      description,
      location,
      date: eventDateTime,
      createdAt: new Date()
    });
    
    res.redirect('/events');
  } catch (err) {
    console.error(err);
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