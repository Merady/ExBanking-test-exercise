const express = require('express');
const PORT = 3000;
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./db.sqlite'); 

app.use(bodyParser.json());

//Create a simple database for users
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00
  )`);
});

app.listen(PORT, () => {
    console.log('Our app is listening for request on port 3000');
  });

// Endpoint to create a new user
app.post('/create_user', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send({message:'Name is required'});
  }
  const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
  stmt.run(name, function (err) {
    if (err) {
      return res.status(500).send({message:'Error creating user'});
    }
    res.status(201).send({ userId: this.lastID, message: 'User created successfully' });
  });
});

// Endpoint to deposit money into a user's account
app.post('/deposit', (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) {
    return res.status(400).send({message:'UserId and amount are required'});
  }
  const stmt = db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
  stmt.run(amount, userId, function (err) {
    if (err) {
      return res.status(500).send({ message:'Error depositing money' });
    }
    res.status(200).send({ message:'Deposit successful' });
  });
});

// Endpoint to withdraw money from a user's account
app.post('/withdraw', (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) {
    return res.status(400).send({message:'UserId and amount are required'});
  }
  const stmt = db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?');
  stmt.run(amount, userId, function (err) {
    if (err) {
      return res.status(500).send({ message:'Error withdrawing money' });
    }
    res.status(200).send({ message:'Withdrawal successful' });
  });
});

// Endpoint to get a user's balance
app.get('/get_balance/:userId', (req, res) => {
  const { userId } = req.params;
  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).send({ message:'Error fetching balance' });
    }
    if (row) {
      res.status(200).send({ balance: row.balance });
    } else {
      res.status(404).send({ message:'User not found' });
    }
  });
});

// Endpoint to send money from one user to another
app.post('/send', (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  if (!fromUserId || !toUserId || !amount) {
    return res.status(400).send({ message:'FromUserId, toUserId, and amount are required' });
  }
  
  // Start a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, fromUserId]);
    db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, toUserId], (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).send({ message:'Error sending money' });
      }
      db.run('COMMIT');
      res.status(200).send({ message:'Money sent successfully' });
    });
  });
});

