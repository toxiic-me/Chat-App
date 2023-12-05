const app = require('express')();
const PORT =  process.env.PORT || 8080
const http = require('http').Server(app);
const path = require('path');
const options = { root: path.join(__dirname) } ;


const io = require('socket.io')(http);

app.get('/',(req,res)=>{
    res.sendFile('index.html',options)
})
app.get('/about',(req,res)=>{
    res.sendFile('about.html',options)
})
app.get('/contact',(req,res)=>{
    res.sendFile('contact.html',options)
})

const users = {};
var active = 0;
io.on('connection', socket =>{
    active++;
    socket.broadcast.emit('showActive',active);
    socket.on('new-user-joined',(name)=>{
        socket.broadcast.emit('showActive',active);
        users[socket.id] = name;
        console.log(`${name} joined chat.`)
        socket.broadcast.emit('user-joined', name)
    });

    socket.on('send',message => {
        socket.broadcast.emit('receive',{message:message,name:users[socket.id]});
    });

    socket.on('disconnect',()=>{
        active--;
        socket.broadcast.emit('showActive',active);
        if(users != null && users != 'null'){
            socket.broadcast.emit('left', users[socket.id]);
        }else{ console.log('Null Identified...')}
        delete users[socket.id];
    });
})

http.listen(PORT,()=>{
    console.log('Live on Port-'+PORT)
})