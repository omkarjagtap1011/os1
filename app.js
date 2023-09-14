const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Import and use the 'submit' route
const submitRoute = require('./functions/submit'); // Adjust the path as needed
app.use('/.netlify/functions/submit', submitRoute);


if (!process.env.NETLIFY) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app;
module.exports.handler = serverless(app);
