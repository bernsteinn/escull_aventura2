const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const port = process.env.PORT || 5000;
const http = require('http');
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);
const jsonQuestions = require('./options.json');
const bodyparser = require('body-parser');


//App configuration.
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));
//Set view engine ejs
app.set('view engine', 'ejs');
//Routes
app.get("/", (req, res) => {
    res.render('main.ejs');
})
app.post("/questions", (req,res) => {
    const id = req.body.qID
    const user = req.body.user
    res.send(jsonQuestions.questions[id])
    
})
//Handle socket.io events
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on("question", (data) => {
        var info = jsonQuestions.questions[data]
        io.emit("questionData", info)
    })
});

//Server.
server.listen(port, () => console.log(`Listening on port ${port}`));



