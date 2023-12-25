import http from "http"
import {Server} from "socket.io";
import express from "express"

const port = 3000;

const app = express();

app.set('view engine', 'pug')
app.set('views', __dirname + "/views")

app.use("/public", express.static(__dirname + "/public"))

app.get("/", (req, res)=>{
  res.render("home-webRTC")
})
app.get("/*", (req, res) => res.redirect("/"))


const server = http.createServer(app)
const rtcServer = new Server(server) 

rtcServer.on("connection", socket => {
  
  socket.on("join_room", (roomname, callback)=>{
    socket.join(roomname)
    callback();
    socket.to(roomname).emit("welcome")
  })

  socket.on("offer", (offer, roomname) => {
    socket.to(roomname).emit("offer", offer)
  })

})
const handleListen = () => console.log(`Listening on http://localhost:${port}`)
server.listen(port, handleListen)
