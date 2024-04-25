const express = require('express');
const mongoose = require('mongoose');

const app = express();

// MongoDB connection
mongoose.connect('mongodb+srv://jordanandrewww:db123@mycluster.zb2k6aw.mongodb.net/?retryWrites=true&w=majority&appName=mycluster', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schema and model
const companySchema = new mongoose.Schema({
    name: String,
    ticker: String,
    price: Number
});

const Company = mongoose.model('PublicCompanies', companySchema);

// View 1: Home
app.get('/', (req, res) => {
    res.send(`
        <form action="/process" method="GET">
            <label for="searchInput">Search:</label>
            <input type="text" id="searchInput" name="searchInput">
            <br>
            <input type="radio" id="tickerRadio" name="searchType" value="ticker">
            <label for="tickerRadio">Ticker Symbol</label>
            <input type="radio" id="companyRadio" name="searchType" value="company">
            <label for="companyRadio">Company Name</label>
            <br>
            <button type="submit">Search</button>
        </form>
    `);
});

// View 2: Process
app.get('/process', async (req, res) => {
    const searchInput = req.query.searchInput;
    const searchType = req.query.searchType;

    let results = [];
    if (searchType === "ticker") {
        results = await Company.find({ ticker: searchInput });
    } else if (searchType === "company") {
        results = await Company.find({ name: { $regex: searchInput, $options: 'i' } });
    }

    console.log(results); // Display data in the console

    // Display the data also on the web page
    res.send(`
        <h1>Search Results</h1>
        <ul>
            ${results.map(company => `<li>Name: ${company.name}, Ticker: ${company.ticker}, Price: ${company.price}</li>`).join('')}
        </ul>
    `);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

