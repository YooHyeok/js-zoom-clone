import http from "http"
import SocketIO from "socket.io"; // npm i socket.io
import express from "express"
import { callbackify } from "util";


const port = 3000;

const app = express();

app.set('view engine', 'pug') //view 엔진을 pug 로 설정 (spring의 view resolver처럼 suffix에 해당)
app.set('views', __dirname + "/views") // root(src)/views 하위의 pug파일을 읽는다.

app.use("/public", express.static(__dirname + "/public")) // 정적파일 공유 url 매핑 작업
//expressJS에 위 코드를 추가함으로써 3000번 포트로 열린 expressJS 서버에서 해당 경로를 탐색할 수 있게끔 열어준것이다.
//따라서 view 엔진인 pug파일에서 해당 script파일을 읽어들여와 정상적으로 실행시켜주게 된다

app.get("/", (req, res)=>{
  res.render("home-socketio") // get함수에 지정한 매핑주소로 접속시 home을 렌더링한다. render에 전달받은 매개변수는 view정보이며 파일명의 prefix에 해당한다. (spring의 view resolver처럼 home.pug로 변한됨)
})
app.get("/*", (req, res) => res.redirect("/")) // 어떠한 요청이 와도 home을 렌더링한다.


/**
 * Http 서버 위에 socket.io서버를 구동
 * 동일한 포트로 서버를 구성하기 위해 socket.io서버와 Http 서버를 동시에 구성한다.
*/
const server = http.createServer(app)
const ioServer = SocketIO(server) // http://localhost:3000/socket.io/socket.io.js 접속이 가능해진다.

let connectCount = 0; // 방에 연결된 사람 수
ioServer.on("connection", socket => {
  
  /**
     * onAny(미들웨어) 어느 이벤트이든지 console.log할 수 있다.
     */
  socket.onAny((event)=> {
    console.dir(`Socket Event: ${event}`)
  })
  /**
   * socket.emit("roomId", "Message", callback) // event, 메시지, 콜백함수를 emit(방출)
   * socket.on("roomId", (...msg, callback)=>{}) // 일반적인 socket event 혹은 emit된 event를 대상으로 콜백 함수 핸들러
   * socket.join(roomId) // 나를 포함하여 소켓에 roomid를 등록
   * socket.rooms : set {객체}
   * socket.to(roomId) // 나를 제외한 룸 참여자 전체를 대상으로
   * socket.leave(roomId) // join된 ID를 제거함으로써 Room에서 나간다.
   */
  socket.on("enter_room", (roomname, callback) => {
    socket.join(roomname)
    socket['nickname'] = `Anon${++connectCount}`
    callback();
    socket.to(roomname).emit("welcome", `${socket.nickname}: is Joined!`); // 나를 제외한 join한 모든 client ID에게 event emit
  })
  /**
   * 메시지 전송
   */
  socket.on("new_message", (info, callback) => {
    callback(`You: ${info.message}`);
    socket.to(info.roomname).emit("message", `${socket.nickname}: ${info.message}`);
  })

  /**
   * 닉네임 적용
   */
  socket.on("nickname", (nickname) => {
    socket['nickname'] = nickname;
  })

  /**
   * disconnecting - socket 핸들러 이벤트
   * 브라우저 종료 혹은 새로고침 시 작동한다.
   */
  socket.on("disconnecting", (event) => {
    socket.rooms.forEach(room => socket.to(room).emit("bye", `${socket.nickname} is Leave T.T`))
  })
})

const handleListen = () => console.log(`Listening on http://localhost:${port}`)
server.listen(port, handleListen)
