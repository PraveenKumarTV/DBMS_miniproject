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
    const { name, organizerName ,description, venue, date, time } = req.body;
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
      organizerName,
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


// Utility to fetch event and venue details
async function getEventWithVenue(db, eventId) {
  const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
  if (!event) return null;

  const venue = await db.collection('venues').findOne({ _id: new ObjectId(event.venueId) });
  event.venueName = venue ? venue.VenueName : 'Unknown Venue';
  return event;
}

// View event details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).send('Invalid event ID format');

    const db = getDB();
    const event = await getEventWithVenue(db, id);
    if (!event) return res.status(404).send('Event not found');

    res.render('eventDetails', { event });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Display all volunteers
router.get('/all/volunteers', async (req, res) => {
  try {
    const db = getDB();
    const volunteers = await db.collection('registrations')
      .find({ type: 'volunteer' }).toArray();

    const volunteersWithEventDetails = await Promise.all(volunteers.map(async (volunteer) => {
      const event = await getEventWithVenue(db, volunteer.eventId);
      return {
        ...volunteer,
        eventName: event ? event.name : 'Unknown Event',
        venueName: event ? event.venueName : 'Unknown Venue'
      };
    }));

    res.render('allVolunteers', { volunteers: volunteersWithEventDetails });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Display all participants
router.get('/all/participants', async (req, res) => {
  try {
    const db = getDB();
    const participants = await db.collection('registrations')
      .find({ type: 'participant' }).toArray();

    const participantsWithEventDetails = await Promise.all(participants.map(async (participant) => {
      const event = await getEventWithVenue(db, participant.eventId);
      return {
        ...participant,
        eventName: event ? event.name : 'Unknown Event',
        venueName: event ? event.venueName : 'Unknown Venue'
      };
    }));

    res.render('allParticipants', { participants: participantsWithEventDetails });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Display volunteers for an event
router.get('/:id/volunteers', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).send('Invalid event ID format');

    const db = getDB();
    const event = await getEventWithVenue(db, id);
    if (!event) return res.status(404).send('Event not found');

    const volunteers = await db.collection('registrations')
      .find({ eventId: new ObjectId(id), type: 'volunteer' }).toArray();

    res.render('volunteerList', { event, volunteers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Display participants for an event
router.get('/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).send('Invalid event ID format');

    const db = getDB();
    const event = await getEventWithVenue(db, id);
    if (!event) return res.status(404).send('Event not found');

    const participants = await db.collection('registrations')
      .find({ eventId: new ObjectId(id), type: 'participant' }).toArray();

    res.render('participantList', { event, participants });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;