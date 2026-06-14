require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { execSync } = require('child_process');

const { connectMySQL, getPool } = require('./db/connection');

const { getDbMode, isMySQLEnabled, getDbModeLabel } = require('./config/database');



const booksRouter = require('./routes/books');

const membersRouter = require('./routes/members');

const transactionsRouter = require('./routes/transactions');

const dashboardRouter = require('./routes/dashboard');



const app = express();

const PORT = process.env.PORT || 5000;



function getPortBlockerPid(port) {

  try {

    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });

    const line = output.split('\n').find((l) => l.includes('LISTENING'));

    if (!line) return null;

    const parts = line.trim().split(/\s+/);

    return parts[parts.length - 1] || null;

  } catch {

    return null;

  }

}



app.use(cors());

app.use(express.json());



app.get('/api/health', (req, res) => {

  res.json({

    status: 'ok',

    dbMode: isMySQLEnabled() && getPool() ? getDbMode() : 'memory',

  });

});



app.use('/api/books', booksRouter);

app.use('/api/members', membersRouter);

app.use('/api/transactions', transactionsRouter);

app.use('/api/dashboard', dashboardRouter);



async function startServer() {

  const mode = getDbMode();



  if (isMySQLEnabled()) {

    try {

      await connectMySQL();

      console.log(`Connected to ${getDbModeLabel()}`);

    } catch (err) {

      console.error('MySQL connection failed:', err.message);

      console.log('Falling back to in-memory storage. Check backend/.env or run: npm run db:init');

      process.env.DB_PROFILE = 'memory';

    }

  } else {

    console.log('Running with in-memory storage');

    console.log('To use MySQL: copy .env.local.example or .env.online.example to .env');

  }



  const server = app.listen(PORT, () => {

    console.log(`Library API running at http://localhost:${PORT}`);

  });



  server.on('error', (err) => {

    if (err.code === 'EADDRINUSE') {

      const blockingPid = getPortBlockerPid(PORT);

      console.error(`Port ${PORT} is already in use${blockingPid ? ` by process PID ${blockingPid}` : ''}.`);

      console.error('Stop the other process (taskkill /PID <pid> /F) or change PORT in backend/.env');

      process.exit(1);

    }

    throw err;

  });

}



startServer();



module.exports = app;

