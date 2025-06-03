const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test server running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running at https://website-backend-tf7k.onrender.com:${PORT}`);
});
