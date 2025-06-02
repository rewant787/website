const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Validation Functions
function validatePhone(phone) {
  // Remove all spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's a valid phone number
  const phoneRegex = /^[+]?[0-9]{10,15}$/;
  
  return phoneRegex.test(cleanPhone);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRequired(value) {
  return value && value.trim().length > 0;
}

function validateBookingData(data) {
  const errors = [];
  
  // Check required fields
  if (!validateRequired(data.name)) {
    errors.push('Name is required');
  }
  
  if (!validateRequired(data.phone)) {
    errors.push('Phone number is required');
  } else if (!validatePhone(data.phone)) {
    errors.push('Please enter a valid phone number (10-15 digits)');
  }
  
  if (!validateRequired(data.puja)) {
    errors.push('Puja type is required');
  }
  
  if (!validateRequired(data.date)) {
    errors.push('Date is required');
  }
  
  return errors;
}

function validateAstrologyData(data) {
  const errors = [];
  
  // Check required fields
  if (!validateRequired(data.name)) {
    errors.push('Name is required');
  }
  
  if (!validateRequired(data.phone)) {
    errors.push('Phone number is required');
  } else if (!validatePhone(data.phone)) {
    errors.push('Please enter a valid phone number (10-15 digits)');
  }
  
  if (!validateRequired(data.service)) {
    errors.push('Service type is required');
  }
  
  if (!validateRequired(data.birthDate)) {
    errors.push('Birth date is required');
  }
  
  if (!validateRequired(data.birthTime)) {
    errors.push('Birth time is required');
  }
  
  if (!validateRequired(data.birthPlace)) {
    errors.push('Birth place is required');
  }
  
  return errors;
}

function validateContactData(data) {
  const errors = [];
  
  // Check required fields
  if (!validateRequired(data.name)) {
    errors.push('Name is required');
  }
  
  if (!validateRequired(data.phone)) {
    errors.push('Phone number is required');
  } else if (!validatePhone(data.phone)) {
    errors.push('Please enter a valid phone number (10-15 digits)');
  }
  
  if (!validateRequired(data.email)) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!validateRequired(data.subject)) {
    errors.push('Subject is required');
  }
  
  if (!validateRequired(data.message)) {
    errors.push('Message is required');
  }
  
  return errors;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Puja Booking API
app.post('/api/book-puja', async (req, res) => {
  try {
    console.log('📝 Puja booking request received:', req.body);
    
    // VALIDATE DATA FIRST
    const validationErrors = validateBookingData(req.body);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const { name, phone, puja, date, address, details } = req.body;
    
    // Clean phone number
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Create booking object
    const booking = {
      name: name.trim(),
      phone: cleanPhone,
      puja: puja.trim(),
      date,
      address: address ? address.trim() : '',
      details: details ? details.trim() : '',
      timestamp: new Date().toISOString(),
      bookingId: `PB${Date.now()}`
    };
    
    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.PRIEST_EMAIL,
      subject: '🕉️ New Puja Booking - Vaidik Anusthan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #ff6b35;">🕉️ New Puja Booking Request</h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ff6b35; margin-top: 0;">Client Details:</h3>
            <p><strong>Name:</strong> ${booking.name}</p>
            <p><strong>Phone:</strong> <a href="tel:${booking.phone}">${booking.phone}</a></p>
            <p><strong>Puja Type:</strong> ${booking.puja}</p>
            <p><strong>Preferred Date:</strong> ${booking.date}</p>
            <p><strong>Address:</strong> ${booking.address || 'Not provided'}</p>
            <p><strong>Additional Details:</strong> ${booking.details || 'None'}</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #28a745; margin-top: 0;">Quick Actions:</h4>
            <p>
              <a href="tel:${booking.phone}" style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-right: 10px;">📞 Call Client</a>
              <a href="https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}" style="background: #25d366; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">💬 WhatsApp</a>
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Booking ID: ${booking.bookingId}<br>
            Received: ${new Date(booking.timestamp).toLocaleString()}
          </p>
        </div>
      `
    });

    // Store booking
    pujaBookings.push(booking);
    
    console.log('✅ Puja booking processed successfully:', booking.bookingId);
    
    res.json({
      success: true,
      message: 'Puja booking request sent successfully!',
      bookingId: booking.bookingId
    });

  } catch (error) {
    console.error('❌ Puja booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process booking. Please try again.',
      error: error.message
    });
  }
});

// Astrology Consultation API
app.post('/api/astrology-consultation', async (req, res) => {
  try {
    console.log('🔮 Astrology consultation request received:', req.body);
    
    // VALIDATE DATA FIRST
    const validationErrors = validateAstrologyData(req.body);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const { name, phone, service, birthDate, birthTime, birthPlace, query } = req.body;
    
    // Clean phone number
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Create consultation object
    const consultation = {
      name: name.trim(),
      phone: cleanPhone,
      service: service.trim(),
      birthDate,
      birthTime,
      birthPlace: birthPlace.trim(),
      query: query ? query.trim() : '',
      timestamp: new Date().toISOString(),
      consultationId: `AC${Date.now()}`
    };
    
    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.PRIEST_EMAIL,
      subject: '⭐ New Astrology Consultation - Vaidik Anusthan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff;">⭐ New Astrology Consultation Request</h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Client Details:</h3>
            <p><strong>Name:</strong> ${consultation.name}</p>
            <p><strong>Phone:</strong> <a href="tel:${consultation.phone}">${consultation.phone}</a></p>
            <p><strong>Service:</strong> ${consultation.service}</p>
            <p><strong>Birth Date:</strong> ${consultation.birthDate}</p>
            <p><strong>Birth Time:</strong> ${consultation.birthTime}</p>
            <p><strong>Birth Place:</strong> ${consultation.birthPlace}</p>
            <p><strong>Query:</strong> ${consultation.query || 'General consultation'}</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #28a745; margin-top: 0;">Quick Actions:</h4>
            <p>
              <a href="tel:${consultation.phone}" style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-right: 10px;">📞 Call Client</a>
              <a href="https://wa.me/${consultation.phone.replace(/[^0-9]/g, '')}" style="background: #25d366; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">💬 WhatsApp</a>
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Consultation ID: ${consultation.consultationId}<br>
            Received: ${new Date(consultation.timestamp).toLocaleString()}
          </p>
        </div>
      `
    });

    // Store consultation
    astrologyBookings.push(consultation);
    
    console.log('✅ Astrology consultation processed successfully:', consultation.consultationId);
    
    res.json({
      success: true,
      message: 'Astrology consultation request sent successfully!',
      consultationId: consultation.consultationId
    });

  } catch (error) {
    console.error('❌ Astrology consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process consultation request. Please try again.',
      error: error.message
    });
  }
});

// Contact Form API
app.post('/api/contact', async (req, res) => {
  try {
    console.log('📧 Contact message received:', req.body);
    
    // VALIDATE DATA FIRST
    const validationErrors = validateContactData(req.body);
    
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const { name, phone, email, subject, message } = req.body;
    
    // Clean phone number
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Create message object
    const contactMessage = {
      name: name.trim(),
      phone: cleanPhone,
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      messageId: `CM${Date.now()}`
    };
    
    // Send email notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.PRIEST_EMAIL,
      subject: `📧 New Contact Message: ${contactMessage.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #28a745;">📧 New Contact Message</h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${contactMessage.name}</p>
            <p><strong>Phone:</strong> <a href="tel:${contactMessage.phone}">${contactMessage.phone}</a></p>
            <p><strong>Email:</strong> <a href="mailto:${contactMessage.email}">${contactMessage.email}</a></p>
            <p><strong>Subject:</strong> ${contactMessage.subject}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>${contactMessage.message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="tel:${contactMessage.phone}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-right: 10px; display: inline-block;">Call Client</a>
            <a href="mailto:${contactMessage.email}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply Email</a>
          </div>
        </div>
      `
    });

    console.log('New Contact Message:', {
      timestamp: new Date().toISOString(),
      name,
      phone,
      email,
      subject
    });

    contactMessages.push({
      ...req.body,
      timestamp: new Date().toISOString(),
      messageId: `CM${Date.now()}`
    });

    res.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you within 24 hours.',
      messageId: `CM${Date.now()}`
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or contact us directly.'
    });
  }
});

// Newsletter Subscription API
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const newsletterEmailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.PRIEST_EMAIL || 'krishnaprasad@vaidikanusthan.com',
      subject: 'New Newsletter Subscription - Vaidik Anusthan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
          <div style="background: #28a745; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Newsletter Subscription</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">A new user has subscribed to your newsletter:</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">${email}</p>
            </div>
            
            <p style="margin-top: 20px; color: #666;">Subscribed at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(newsletterEmailOptions);

    console.log('New Newsletter Subscription:', {
      timestamp: new Date().toISOString(),
      email
    });

    res.json({
      success: true,
      message: 'Thank you for subscribing! You will receive spiritual insights weekly.'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again.'
    });
  }
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running properly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get Booking Status API
app.get('/api/booking/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  
  res.json({
    success: true,
    bookingId,
    status: 'received',
    message: 'Your booking request has been received. We will contact you within 2 hours.',
    estimatedResponse: '2 hours'
  });
});

// Emergency Contact API
app.post('/api/emergency-contact', async (req, res) => {
  try {
    const { name, phone, emergency_type, message } = req.body;

    if (!name || !phone || !emergency_type) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    const emergencyEmailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.PRIEST_EMAIL || 'krishnaprasad@vaidikanusthan.com',
      subject: 'URGENT: Emergency Contact Request - Vaidik Anusthan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc3545;">
          <div style="background: #dc3545; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">EMERGENCY CONTACT REQUEST</h1>
          </div>
          
          <div style="padding: 20px; background: #fff3cd;">
            <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0; font-weight: bold; color: #721c24;">URGENT ATTENTION REQUIRED</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: white;">
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Name:</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${name}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Phone:</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${phone}</td>
              </tr>
              <tr style="background: white;">
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Emergency Type:</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${emergency_type}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Message:</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${message || 'No additional message'}</td>
              </tr>
            </table>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="tel:${phone}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">CALL IMMEDIATELY</a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Emergency request received at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(emergencyEmailOptions);

    console.log('EMERGENCY CONTACT:', {
      timestamp: new Date().toISOString(),
      name,
      phone,
      emergency_type
    });

    res.json({
      success: true,
      message: 'Emergency request sent! We will contact you immediately.',
      priority: 'urgent'
    });

  } catch (error) {
    console.error('Emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emergency request. Please call directly: +91-9339216754'
    });
  }
});

// Serve main HTML file for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../hi.html'));
});

// In-memory storage for bookings
let pujaBookings = [];
let astrologyBookings = [];
let contactMessages = [];

// Admin Dashboard Route
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vaidik Anusthan - Admin Dashboard</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        body { background: #f8f9fa; }
        .dashboard-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .stat-card { transition: transform 0.3s; }
        .stat-card:hover { transform: translateY(-5px); }
        .booking-card { border-left: 4px solid #007bff; }
        .astrology-card { border-left: 4px solid #28a745; }
        .contact-card { border-left: 4px solid #ffc107; }
      </style>
    </head>
    <body>
      <div class="dashboard-header py-4 mb-4">
        <div class="container">
          <h1><i class="fas fa-om me-2"></i>Vaidik Anusthan - Admin Dashboard</h1>
          <p class="mb-0">Manage your bookings and consultations</p>
        </div>
      </div>
      
      <div class="container">
        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="card stat-card text-center">
              <div class="card-body">
                <i class="fas fa-calendar-check fa-3x text-primary mb-3"></i>
                <h3>${pujaBookings.length}</h3>
                <p class="text-muted">Puja Bookings</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card stat-card text-center">
              <div class="card-body">
                <i class="fas fa-star fa-3x text-success mb-3"></i>
                <h3>${astrologyBookings.length}</h3>
                <p class="text-muted">Astrology Consultations</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card stat-card text-center">
              <div class="card-body">
                <i class="fas fa-envelope fa-3x text-warning mb-3"></i>
                <h3>${contactMessages.length}</h3>
                <p class="text-muted">Contact Messages</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs" id="adminTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="puja-tab" data-bs-toggle="tab" data-bs-target="#puja" type="button">
              <i class="fas fa-om me-2"></i>Puja Bookings
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="astrology-tab" data-bs-toggle="tab" data-bs-target="#astrology" type="button">
              <i class="fas fa-star me-2"></i>Astrology Consultations
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button">
              <i class="fas fa-envelope me-2"></i>Contact Messages
            </button>
          </li>
        </ul>
        
        <!-- Tab Content -->
        <div class="tab-content" id="adminTabsContent">
          <!-- Puja Bookings -->
          <div class="tab-pane fade show active" id="puja" role="tabpanel">
            <div class="mt-3">
              ${pujaBookings.length === 0 ? 
                '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No puja bookings yet.</div>' :
                pujaBookings.map(booking => `
                  <div class="card booking-card mb-3">
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-8">
                          <h5 class="card-title"><i class="fas fa-user me-2"></i>${booking.name}</h5>
                          <p class="card-text">
                            <strong>Phone:</strong> <a href="tel:${booking.phone}">${booking.phone}</a><br>
                            <strong>Puja:</strong> ${booking.puja}<br>
                            <strong>Date:</strong> ${booking.date}<br>
                            <strong>Address:</strong> ${booking.address || 'Not provided'}<br>
                            <strong>Details:</strong> ${booking.details || 'None'}
                          </p>
                        </div>
                        <div class="col-md-4 text-end">
                          <small class="text-muted">Booked: ${booking.timestamp ? new Date(booking.timestamp).toLocaleString() : 'Unknown'}</small><br>
                          <a href="tel:${booking.phone}" class="btn btn-primary btn-sm mt-2">
                            <i class="fas fa-phone me-1"></i>Call
                          </a>
                          <a href="https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}" class="btn btn-success btn-sm mt-2" target="_blank">
                            <i class="fab fa-whatsapp me-1"></i>WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>
          
          <!-- Astrology Consultations -->
          <div class="tab-pane fade" id="astrology" role="tabpanel">
            <div class="mt-3">
              ${astrologyBookings.length === 0 ? 
                '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No astrology consultations yet.</div>' :
                astrologyBookings.map(booking => `
                  <div class="card astrology-card mb-3">
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-8">
                          <h5 class="card-title"><i class="fas fa-user me-2"></i>${booking.name}</h5>
                          <p class="card-text">
                            <strong>Phone:</strong> <a href="tel:${booking.phone}">${booking.phone}</a><br>
                            <strong>Service:</strong> ${booking.service}<br>
                            <strong>Birth Date:</strong> ${booking.birthDate}<br>
                            <strong>Birth Time:</strong> ${booking.birthTime}<br>
                            <strong>Birth Place:</strong> ${booking.birthPlace}<br>
                            <strong>Query:</strong> ${booking.query || 'None'}
                          </p>
                        </div>
                        <div class="col-md-4 text-end">
                          <small class="text-muted">Requested: ${booking.timestamp ? new Date(booking.timestamp).toLocaleString() : 'Unknown'}</small><br>
                          <a href="tel:${booking.phone}" class="btn btn-primary btn-sm mt-2">
                            <i class="fas fa-phone me-1"></i>Call
                          </a>
                          <a href="https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}" class="btn btn-success btn-sm mt-2" target="_blank">
                            <i class="fab fa-whatsapp me-1"></i>WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>
          
          <!-- Contact Messages -->
          <div class="tab-pane fade" id="contact" role="tabpanel">
            <div class="mt-3">
              ${contactMessages.length === 0 ? 
                '<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No contact messages yet.</div>' :
                contactMessages.map(message => `
                  <div class="card contact-card mb-3">
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-8">
                          <h5 class="card-title"><i class="fas fa-user me-2"></i>${message.name}</h5>
                          <p class="card-text">
                            <strong>Phone:</strong> <a href="tel:${message.phone}">${message.phone}</a><br>
                            <strong>Email:</strong> <a href="mailto:${message.email}">${message.email}</a><br>
                            <strong>Subject:</strong> ${message.subject}<br>
                            <strong>Message:</strong> ${message.message}
                          </p>
                        </div>
                        <div class="col-md-4 text-end">
                          <small class="text-muted">Sent: ${message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Unknown'}</small><br>
                          <a href="tel:${message.phone}" class="btn btn-primary btn-sm mt-2">
                            <i class="fas fa-phone me-1"></i>Call
                          </a>
                          <a href="mailto:${message.email}" class="btn btn-info btn-sm mt-2">
                            <i class="fas fa-envelope me-1"></i>Reply
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>
        </div>
        
        <!-- Refresh Button -->
        <div class="text-center mt-4">
          <button onclick="window.location.reload()" class="btn btn-outline-primary">
            <i class="fas fa-sync-alt me-2"></i>Refresh Data
          </button>
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `);
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
    ========================================
    🕉️  VAIDIK ANUSTHAN SERVER STARTED  🕉️
    ========================================
    
    🌐 Server running on: https://website-backend-tf7k.onrender.com:${PORT}
    📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}
    🔒 Security: Enabled
    📊 Rate limiting: Active
    
    📋 Available APIs:
    • POST /api/book-puja
    • POST /api/astrology-consultation  
    • POST /api/contact
    • POST /api/newsletter
    • POST /api/emergency-contact
    • GET  /api/health
    • GET  /api/booking/:bookingId
    
    🙏 Ready to serve devotees!
    ========================================
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
