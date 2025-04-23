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
    const { name, department, yearOfStudy, eventId, contactNo, email, type, hoursWorked } = req.body;
    const db = getDB();
    
    // Validate eventId before creating ObjectId
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send('Invalid event ID format');
    }
    
    let registrationData = {
      name,
      department,
      yearOfStudy: parseInt(yearOfStudy),
      eventId: new ObjectId(eventId),
      contactNo,
      email,
      type, // 'volunteer' or 'participant'
      registeredAt: new Date()
    };

    // Create appropriate ID based on type
    const collection = db.collection('registrations');
    let lastId;
    
    if (type === 'volunteer') {
      lastId = await collection.find({ type: 'volunteer' }).sort({ _id: -1 }).limit(1).toArray();
      const volunteerId = lastId.length > 0 && lastId[0].volunteerId 
        ? `VOL${parseInt(lastId[0].volunteerId.substring(3)) + 1}` 
        : 'VOL1001';
      
      registrationData.volunteerId = volunteerId;
      registrationData.hoursWorked = hoursWorked ? parseInt(hoursWorked) : 0;
    } else {
      lastId = await collection.find({ type: 'participant' }).sort({ _id: -1 }).limit(1).toArray();
      const participantId = lastId.length > 0 && lastId[0].participantId 
        ? `PAR${parseInt(lastId[0].participantId.substring(3)) + 1}` 
        : 'PAR1001';
      
      registrationData.participantId = participantId;
    }
    
    await collection.insertOne(registrationData);
    
    res.redirect('/events');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;