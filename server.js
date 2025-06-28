const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const app = express();
const Account = require('./Account'); // User model
const Transaction = require('./Transaction'); // Transaction model

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 } // Adjust as needed
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/project', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('Failed to connect to MongoDB', err));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve login.html as the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route to fetch account details
app.get('/account_details', (req, res) => {
    if (req.session.userid) {
        const {
            userid, fullname, phone, aadhar, age, marital_status, gender, dob, pan,
            accountType, accountNumber, initial_balance, branch
        } = req.session;

        res.json({
            fullname,
            userid,
            phone,
            aadhar,
            age,
            marital_status,
            gender,
            dob,
            pan,
            accountType,
            accountNumber,
            initial_balance,
            branch
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Route to fetch transaction history for the logged-in user
app.get('/transaction_history', async (req, res) => {
    if (!req.session.userid) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const transactions = await Transaction.find({ userId: req.session.userid })
            .sort({ date: -1 }) // Sort by date, descending
            .limit(3); // Get only the last 3 transactions

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ error: 'Failed to fetch transaction history.' });
    }
});

// Route to handle account creation
app.post('/submit_account', async (req, res) => {
    const { fullname, userid, phone, password, accountType, aadhar, age, marital_status, gender, dob, pan, account_number, branch, initial_balance } = req.body;

    try {
        const newAccount = new Account({
            fullname,
            userid,
            phone,
            password,
            accountType,
            aadhar,
            age,
            marital_status,
            gender,
            dob,
            pan,
            account_number,
            branch,
            initial_balance
        });
        
        await newAccount.save();
        res.send('Account created successfully!');
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).send('Failed to create account.');
    }
});

// Route to handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Account.findOne({ userid: username, password });

        if (user) {
            // Store all necessary details in the session
            req.session.userid = user.userid;
            req.session.fullname = user.fullname;
            req.session.accountType = user.accountType;
            req.session.phone = user.phone;
            req.session.aadhar = user.aadhar;
            req.session.age = user.age;
            req.session.marital_status = user.marital_status;
            req.session.gender = user.gender;
            req.session.dob = user.dob;
            req.session.pan = user.pan;
            req.session.accountNumber = user.account_number;
            req.session.branch = user.branch;
            req.session.initial_balance = user.initial_balance;

            // Redirect to home page on successful login
            res.redirect('/home');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

// Route to serve home.html for authenticated users
app.get('/home', (req, res) => {
    if (req.session.userid) {
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    } else {
        res.redirect('/');
    }
});

// Route to handle withdrawal
app.post('/withdraw', async (req, res) => {
    const { amount, password } = req.body;

    if (req.session.userid) {
        try {
            const user = await Account.findOne({ userid: req.session.userid, password });
            if (!user) {
                return res.status(401).send('Invalid credentials');
            }

            if (user.initial_balance < amount) {
                return res.status(400).send('Insufficient balance');
            }

            user.initial_balance -= parseFloat(amount);
            await user.save();

            req.session.initial_balance = user.initial_balance;

            const transaction = new Transaction({
                userId: user.userid, // Use String for userId
                transactionType: 'Withdraw',
                amount: parseFloat(amount),
                date: new Date().toISOString(),
            });
            await transaction.save();

            res.send('Withdrawal successful! New balance: ₹' + user.initial_balance);
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            res.status(500).send('Failed to process withdrawal.');
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Route to handle deposit
app.post('/deposit', async (req, res) => {
    const { amount } = req.body;

    if (req.session.userid) {
        try {
            const user = await Account.findOne({ userid: req.session.userid });
            if (!user) {
                return res.status(401).send('User not found');
            }

            user.initial_balance += parseFloat(amount);
            await user.save();

            req.session.initial_balance = user.initial_balance;

            const transaction = new Transaction({
                userId: user.userid, // Use String for userId
                transactionType: 'Deposit',
                amount: parseFloat(amount),
                date: new Date().toISOString(),
            });
            await transaction.save();

            res.send('Deposit successful! New balance: ₹' + user.initial_balance);
        } catch (error) {
            console.error('Error processing deposit:', error);
            res.status(500).send('Failed to process deposit.');
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

app.post('/transaction_history2', async (req, res) => {
    const { startDate, endDate } = req.body;

    try {
        // Adjust the dates to start and end of the desired range in UTC
        const start = new Date(startDate + 'T00:00:00Z'); // Start of the day in UTC
        const end = new Date(endDate + 'T23:59:59Z');     // End of the day in UTC

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        console.log(`Fetching transactions for userId: ${req.session.userid} from ${start} to ${end}`);

        const transactions = await Transaction.find({
            userId: req.session.userid,
            date: { $gte: start, $lte: end }
        });

        if (transactions.length > 0) {
            console.log(`Transactions found:`);
            transactions.forEach(transaction => {
                console.log(`- Type: ${transaction.transactionType}, Amount: ₹${transaction.amount}, Date: ${transaction.date}`);
            });
        } else {
            console.log(`No transactions found for userId: ${req.session.userid} in the specified date range.`);
        }

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        res.status(500).json({ message: 'Error fetching transaction history' });
    }
});




// Route to handle password change
app.post('/change_password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!req.session.userid) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await Account.findOne({ userid: req.session.userid });

        if (!user || user.password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        // Update password (you may want to hash the password before saving)
        user.password = newPassword; // Use hashing for production
        await user.save();

        res.status(200).send('Password changed successfully!');
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password.' });
    }
});

// Route to handle phone number change
app.post('/change_phone', async (req, res) => {
    const { currentPassword, newPhone } = req.body;

    if (!req.session.userid) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Find the user by session ID and check if the current password matches
        const user = await Account.findOne({ userid: req.session.userid });

        if (!user || user.password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        // Update phone number and save it to the database
        user.phone = newPhone;
        await user.save();

        // Update the session to reflect the new phone number
        req.session.phone = newPhone;

        res.status(200).send('Phone number changed successfully!');
    } catch (error) {
        console.error('Error changing phone number:', error);
        res.status(500).json({ error: 'Failed to change phone number.' });
    }
});

// Route to handle logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to log out.');
        }
        res.redirect('/');
    });
});






app.get('/get_users', async (req, res) => {
    try {
        const searchText = req.query.searchText || '';

        const query = {
            $or: [
                { fullname: { $regex: searchText, $options: 'i' } },
                { userid: { $regex: searchText, $options: 'i' } },
                { phone: { $regex: searchText, $options: 'i' } }
            ]
        };

        const users = await Account.find(searchText ? query : {});
        res.json(users);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to retrieve user details.' });
    }
});



// Route to get all transactions, optionally filtered
app.get('/get_transactions', async (req, res) => {
    const { userId, transactionType, searchInput } = req.query;

    let filter = {};

    // Apply filters
    if (userId) {
        filter.userId = userId;
    }
    if (transactionType && transactionType !== 'all') {
        filter.transactionType = transactionType;
    }
    if (searchInput) {
        const date = new Date(searchInput);
        if (!isNaN(date.getTime())) {
            filter.date = { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) }; // Filter for that day
        }
    }

    try {
        const transactions = await Transaction.find(filter).exec();
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions.' });
    }
});





// Route to fetch user details based on user ID
app.get('/api/getUserDetails', async (req, res) => {
    const userId = req.query.userId;

    try {
        const user = await Account.findOne({ userid: userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Sending user details excluding the password
        res.json({
            userId: user.userid,
            fullName: user.fullname,
            phone: user.phone,
            password: user.password, // This should ideally not be sent in production
            accountType: user.accountType,
            aadhar: user.aadhar,
            age: user.age,
            maritalStatus: user.marital_status,
            gender: user.gender,
            pan: user.pan,
            branch: user.branch,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Failed to fetch user details.' });
    }
});

// Route to handle user details update
app.post('/api/updateUserDetails', async (req, res) => {
    const {
        userId,
        fullName,
        phone,
        password,
        accountType,
        aadhar,
        age,
        maritalStatus,
        gender,
        pan,
        branch
    } = req.body;

    try {
        const user = await Account.findOne({ userid: userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user details
        user.fullname = fullName;
        user.phone = phone;
        user.password = password; // Ideally, hash this password before saving
        user.accountType = accountType;
        user.aadhar = aadhar;
        user.age = age;
        user.marital_status = maritalStatus;
        user.gender = gender;
        user.pan = pan;
        user.branch = branch;

        await user.save();

        res.status(200).json({ message: 'User details updated successfully!' });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ error: 'Failed to update user details.' });
    }
});







// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
