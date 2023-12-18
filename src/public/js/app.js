const socket = new WebSocket(`ws://${window.location.host}`)

// 연결이 열리면
socket.addEventListener("open", () => {
  console.log("Connected to Server✅") //server.js로부터 메시지 수신
  socket.send("Connected to Server✅ - Sended By app.js"); // server.js로 메시지 전송!
});

// 메시지 수신
socket.addEventListener("message", (message) => {
  console.log("Message from server ", message.data);
});

socket.addEventListener("close", () => {
  socket.send("Connected from Server ❌"); // 메시지를 전송해도 받을 수 없다...?
})

/**
 * 10초 후 메시지 전송
 * send() 함수를 통해 메시지를 서버로 전송한다.
 */
setTimeout(() => {
  socket.send("ㅁㄴ엠네렘ㄴ렘ㄴ레")
}, 10000)