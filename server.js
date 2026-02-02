const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Add CORS headers
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Image proxy endpoint to bypass CORS
server.get('/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    
    res.set('Content-Type', response.headers.get('content-type'));
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(buffer);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

server.use(middlewares);
server.use(router);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`JSON Server with image proxy running on port ${PORT}`);
});
