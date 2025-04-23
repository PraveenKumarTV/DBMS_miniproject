const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const moment = require('moment');
const { connectDB } = require('./config/db');
require('dotenv').config();
// Import routes
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const venueRoutes = require('./routes/venue');



// Initialize app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars Middleware
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.handlebars',
  helpers: {
    formatDate: function(date) {
      return moment(date).format('MMMM Do YYYY, h:mm a');
    },
    isFutureDate: function(date, options) {
      return moment(date).isAfter(moment()) ? options.fn(this) : options.inverse(this);
    },
    eq: function(v1, v2) {
      return v1 === v2;
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Routes
app.use('/events', eventRoutes);
app.use('/register', registrationRoutes);
app.use('/venue', venueRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Start the server after connecting to MongoDB
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();