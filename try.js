const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Let's create a new piece of code
const express = require('express');
const path = require('path');

// Create a new Express.js app instance


// What do you want to do next?

// ✅ Serve all files in the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Send index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use(express.static(path.join(__dirname, 'public')));
s

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, '../')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/pujaBookings', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  puja: { type: String, required: true },
  date: { type: String, required: true },
  address: { type: String, default: '' },
  details: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);
const express = require('express');
const path = require('path');
const app = express('whatsapp');

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// If using index.html directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Astrology Consultation Schema
const astrologySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  birthDate: { type: String, required: true },
  birthTime: { type: String, required: true },
  birthPlace: { type: String, required: true },
  query: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

const AstrologyConsultation = mongoose.model('AstrologyConsultation', astrologySchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  message: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Routes

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../hi.html'));
});

// Puja booking endpoint
app.post('/api/book-puja', async (req, res) => {
  try {
    const { name, phone, puja, date, address, details } = req.body;
    
    // Validation
    if (!name || !phone || !puja || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: name, phone, puja, and date' 
      });
    }

    const booking = new Booking({
      name,
      phone,
      puja,
      date,
      address: address || '',
      details: details || ''
    });

    await booking.save();
    console.log('📅 New puja booking received:', booking);
    
    res.json({ 
      success: true, 
      message: 'Puja booking received successfully!',
      bookingId: booking._id
    });
  } catch (err) {
    console.error('❌ Error saving puja booking:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving booking. Please try again.' 
    });
  }
});

// Astrology consultation endpoint
app.post('/api/book-astrology', async (req, res) => {
  try {
    const { name, phone, service, birthDate, birthTime, birthPlace, query } = req.body;
    
    // Validation
    if (!name || !phone || !service || !birthDate || !birthTime || !birthPlace) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields for astrology consultation' 
      });
    }

    const consultation = new AstrologyConsultation({
      name,
      phone,
      service,
      birthDate,
      birthTime,
      birthPlace,
      query: query || ''
    });

    await consultation.save();
    console.log('🌟 New astrology consultation received:', consultation);
    
    res.json({ 
      success: true, 
      message: 'Astrology consultation booked successfully!',
      consultationId: consultation._id
    });
  } catch (err) {
    console.error('❌ Error saving astrology consultation:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving consultation. Please try again.' 
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, service, message } = req.body;
    
    // Validation
    if (!name || !phone || !service) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, phone, and service type' 
      });
    }

    const contact = new Contact({
      name,
      phone,
      service,
      message: message || ''
    });

    await contact.save();
    console.log('📞 New contact message received:', contact);
    
    res.json({ 
      success: true, 
      message: 'Message received successfully!' 
    });
  } catch (err) {
    console.error('❌ Error saving contact:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending message. Please try again.' 
    });
  }
});

// Admin routes - Get all bookings
app.get('/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ timestamp: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings.' 
    });
  }
});

// Admin routes - Get all astrology consultations
app.get('/admin/consultations', async (req, res) => {
  try {
    const consultations = await AstrologyConsultation.find().sort({ timestamp: -1 });
    res.json({ success: true, consultations });
  } catch (err) {
    console.error('❌ Error fetching consultations:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching consultations.' 
    });
  }
});

// Admin routes - Get all contacts
app.get('/admin/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ timestamp: -1 });
    res.json({ success: true, contacts });
  } catch (err) {
    console.error('❌ Error fetching contacts:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contacts.' 
    });
  }
});

// Update booking status
app.patch('/admin/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found.' 
      });
    }
    
    console.log(`📝 Booking ${req.params.id} status updated to: ${status}`);
    res.json({ success: true, booking });
  } catch (err) {
    console.error('❌ Error updating booking status:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating status.' 
    });
  }
});

// Update consultation status
app.patch('/admin/consultations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const consultation = await AstrologyConsultation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!consultation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation not found.' 
      });
    }
    
    console.log(`📝 Consultation ${req.params.id} status updated to: ${status}`);
    res.json({ success: true, consultation });
  } catch (err) {
    console.error('❌ Error updating consultation status:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating status.' 
    });
  }
});

// Delete a booking
app.delete('/admin/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found.' 
      });
    }
    
    console.log(`🗑️ Booking ${req.params.id} deleted`);
    res.json({ success: true, message: 'Booking deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting booking:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting booking.' 
    });
  }
});

// Delete a consultation
app.delete('/admin/consultations/:id', async (req, res) => {
  try {
    const consultation = await AstrologyConsultation.findByIdAndDelete(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Consultation not found.' 
      });
    }
    
    console.log(`🗑️ Consultation ${req.params.id} deleted`);
    res.json({ success: true, message: 'Consultation deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting consultation:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting consultation.' 
    });
  }
});

// Delete a contact
app.delete('/admin/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found.' 
      });
    }
    
    console.log(`🗑️ Contact ${req.params.id} deleted`);
    res.json({ success: true, message: 'Contact deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting contact:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting contact.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Admin dashboard route
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vaidik Anusthan - Admin Dashboard</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container mt-5">
            <h1>🕉️ Vaidik Anusthan Admin Dashboard</h1>
            <div class="row mt-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5>📅 Puja Bookings</h5>
                            <a href="/admin/bookings" class="btn btn-primary">View Bookings</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5>🌟 Astrology Consultations</h5>
                            <a href="/admin/consultations" class="btn btn-success">View Consultations</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5>📞 Contact Messages</h5>
                            <a href="/admin/contacts" class="btn btn-info">View Contacts</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`🏠 Website: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
  }
});