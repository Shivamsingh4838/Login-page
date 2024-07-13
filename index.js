const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config'); // Assuming this is where your MongoDB collection/model is defined

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await collection.findOne({ name: username });
        if (existingUser) {
            return res.status(400).send('User already exists.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await collection.create({ name: username, password: hashedPassword });
        console.log('User created:', newUser);
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Check if user exists
        const user = await collection.findOne({ name: username });
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Compare the hashed password from the database with the plain text
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        
        if (isPasswordMatch) {
            res.render('home');
        } else {
            res.status(400).send('Wrong password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Wrong details');
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
});
