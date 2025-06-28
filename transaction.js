// Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Change ObjectId to String
    transactionType: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true }
});

module.exports = mongoose.model('Transaction', transactionSchema);
