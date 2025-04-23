const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Display registration form
router.get('/:eventId/:type', async (req, res) => {
  try {
    const { eventId, type } = req.params;
    const db = getDB();
    
    // Make sure eventId is a valid ObjectId
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send('Invalid event ID format');
    }
    
    const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
    
    if (!event) {
      return res.status(404).send('Event not found');
    }
    
    res.render('register', {
      event,
      type, // 'volunteer' or 'participant'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Process registration
router.post('/', async (req, res) => {
  try {
    const { name, department, yearOfStudy, eventId, contactNo, email, type } = req.body;
    const db = getDB();
    
    // Validate eventId before creating ObjectId
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send('Invalid event ID format');
    }
    
    // Create registration ID (you could use a more sophisticated method)
    const lastRegistration = await db.collection('registrations')
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
    
    const registrationId = lastRegistration.length > 0 
      ? `REG${parseInt(lastRegistration[0].registrationId.substring(3)) + 1}` 
      : 'REG1001';
    
    await db.collection('registrations').insertOne({
      registrationId,
      name,
      department,
      yearOfStudy: parseInt(yearOfStudy),
      eventId: new ObjectId(eventId),
      contactNo,
      email,
      type, // 'volunteer' or 'participant'
      registeredAt: new Date()
    });
    
    res.redirect('/events');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;