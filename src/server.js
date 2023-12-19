import http from "http"
import WebSocket from "ws";
import express from "express"


const port = 3000;

const app = express();

app.set('view engine', 'pug') //view 엔진을 pug 로 설정 (spring의 view resolver처럼 suffix에 해당)
app.set('views', __dirname + "/views") // root(src)/views 하위의 pug파일을 읽는다.

app.use("/public", express.static(__dirname + "/public")) // 정적파일 공유 url 매핑 작업
//expressJS에 위 코드를 추가함으로써 3000번 포트로 열린 expressJS 서버에서 해당 경로를 탐색할 수 있게끔 열어준것이다.
//따라서 view 엔진인 pug파일에서 해당 script파일을 읽어들여와 정상적으로 실행시켜주게 된다

app.get("/", (req, res)=>{
  res.render("home") // get함수에 지정한 매핑주소로 접속시 home을 렌더링한다. render에 전달받은 매개변수는 view정보이며 파일명의 prefix에 해당한다. (spring의 view resolver처럼 home.pug로 변한됨)
})
app.get("/*", (req, res) => res.redirect("/")) // 어떠한 요청이 와도 home을 렌더링한다.


/**
 * Http 서버 위에 ws서버를 구동
 * 동일한 포트로 서버를 구성하기 위해 WebSocket서버와 Http 서버를 동시에 구성한다.
*/
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

let sockets = []
/**
 * 축적된 모든 Socket들에게 메시지 전송 함수
 * @param {*} msg 
 */
function send(msg) {
  sockets.forEach(aSocket=>aSocket.send(msg))
}

let i = 0;
wss.on("connection", (socket) => { // socket : 연결된 클라이언트 즉, 브라우저와의 contact라인이다. 해당 객체를 이용하여 메시지를 주고받을 수 있다. (연결해제를 위해 저장해야함)
  sockets.push(socket) // 사용자가 접속할 때 마다 배열에 소켓클라이언트를 축적
  socket["nickname"] = ("Anon" + sockets.indexOf(socket))
  
  /* 브라우저 종료시 소켓 종료 */
  socket.on("close", ()=> {
    console.log("Disconnected From the Server ❌")
    send("Disconnected From the Server ❌")
    sockets = sockets.filter(sock => sock !== socket)
  })

  /* 메시지  */
  socket.on("message", (message)=>{ // on이 아닌 addEventListener도 가능 - message.data로 접근해야함
    const parsedMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case "new_message":
        console.log(socket.nickname)
        send(`${socket.nickname}: ${parsedMessage.payload}`)
        break;
      case "nickname": // 현재 socket에 닉네임 추가
        socket["nickname"] = parsedMessage.payload; //socket 은 기본적으로 객체 형태이므로 속성을 자유롭게 추가할 수 있다.
        break;
      default:
        send(`${socket.nickname}: ${parsedMessage.payload}`)
        break;
    }

  })
})

const handleListen = () => console.log(`Listening on http://localhost:${port}`)
server.listen(port, handleListen)
