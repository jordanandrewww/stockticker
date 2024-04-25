const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

// MongoDB connection
const uri = 'mongodb+srv://jordanandrewww:db123@mycluster.zb2k6aw.mongodb.net/?retryWrites=true&w=majority&appName=mycluster';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}
connectDB();

// view 1: home
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

// view 2: process
app.get('/process', async (req, res) => {
    const searchInput = req.query.searchInput;
    const searchType = req.query.searchType;

    console.log('Search Input:', searchInput);
    console.log('Search Type:', searchType);

    try {
        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        let results = [];
        if (searchType === "ticker") {
            results = await collection.find({ ticker: searchInput }).toArray();
        } else if (searchType === "company") {
            results = await collection.find({ name: { $regex: searchInput, $options: 'i' } }).toArray();
        }

        console.log(results); // displays data in the console

        // displays the data also on the web page
        res.send(`
            <h1>Search Results</h1>
            <ul>
                ${results.map(company => `<li>Name: ${company.name}, Ticker: ${company.ticker}, Price: ${company.price}</li>`).join('')}
            </ul>
        `);
    } catch (err) {
        console.error("Error processing request:", err);
        res.status(500).send("Internal Server Error");
    }
});

// starts server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

