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
app.use('/favicon.ico', express.static(__dirname + '/favicon.icopublic/img/favicon.ico'));
//Set view engine ejs
app.set('view engine', 'ejs');
//Routes
app.get("/", (req, res) => {
    res.render('main.ejs');
})
app.get("/game", (req, res) => {
    res.render('game.ejs')
})
//Handle socket.io events
io.on('connection', (socket) => {
    socketId = socket.id
    console.log('a user connected');
    socket.on('question', (question) => {
        const user = question.user
        const id = question.id
        io.to(socketId).emit('question',jsonQuestions.questions[id])
    })
    socket.on('check', (check) => {
        const question = check.id
        console.log(question)
        const answer = check.content
        console.log(answer)
        if(question > 1){
        for(i = 0; i<3; i++){
        if(jsonQuestions.questions[question].correct[0].option[i] == answer){
            io.to(socketId).emit('check',jsonQuestions.questions[question].correct[i])
            return
        }
        } 
        io.to(socketId).emit('check',jsonQuestions.questions[question].failed[0])
        } 
        else{
            if(jsonQuestions.questions[question].correct[0].option[0] == answer){
                io.to(socketId).emit('check',jsonQuestions.questions[question].correct[0])
            }
            else{
                io.to(socketId).emit('check',jsonQuestions.questions[question].failed[0])
            }
        } 
        
    })
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})
//Server.
server.listen(port, () => console.log(`Listening on port ${port}`));



