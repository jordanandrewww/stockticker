const express = require('express');
const mongoose = require('mongoose');

const app = express();

// MongoDB connection
mongoose.connect('mongodb+srv://jordanandrewww:db123@mycluster.zb2k6aw.mongodb.net/?retryWrites=true&w=majority&appName=mycluster');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// defines schema and model
const companySchema = new mongoose.Schema({
    name: String,
    ticker: String,
    price: Number
});

const Company = mongoose.model('PublicCompanies', companySchema);

// view 1: home
app.get('/', (req, res) => {
    res.send(`
        <form action="https://jordanandrew-stockticker-0ae39ecb6ad3.herokuapp.com/" method="GET">
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

// view 2: process
app.get('/process', async (req, res) => {
    const searchInput = req.query.searchInput;
    const searchType = req.query.searchType;

    console.log('Search Input:', searchInput);
    console.log('Search Type:', searchType);

    let results = [];
    if (searchType === "ticker") {
        results = await Company.find({ ticker: searchInput });
    } else if (searchType === "company") {
        results = await Company.find({ name: { $regex: searchInput, $options: 'i' } });
    }

    console.log(results); // displays data in the console

    // displays the data also on the web page
    res.send(`
        <h1>Search Results</h1>
        <ul>
            ${results.map(company => `<li>Name: ${company.name}, Ticker: ${company.ticker}, Price: ${company.price}</li>`).join('')}
        </ul>
    `);
});

// starts server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
