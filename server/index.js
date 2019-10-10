const express = require('express');
const path = require('path');

let app = express();
app.use(express.static('/dist'));
app.use(express.static('dist'));

app.get('/', (req, res) => {
    console.log(req);
    res.sendFile('index.html',{ root: path.join(__dirname, '../dist') });
});

app.listen(3434);
