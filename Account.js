const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    userid: { type: String, required: true, unique: true },
    phone: String,
    password: String,
    accountType: String,
    aadhar: String,
    age: Number,
    marital_status: String,
    gender: String,
    dob: Date,
    pan: String,
    account_number: String,
    branch: String,
    initial_balance: { type: Number, required: true } // Ensure initial_balance is required
});

module.exports = mongoose.model('Account', accountSchema);