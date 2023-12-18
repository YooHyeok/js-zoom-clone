const messageList = document.querySelector("ul")
const messageForm = document.querySelector("#message")
const nickForm = document.querySelector("#nick")

const socket = new WebSocket(`ws://${window.location.host}`)

// 연결이 열리면
socket.addEventListener("open", () => {
  console.log("Connected to Server✅") //server.js로부터 메시지 수신
  socket.send("Connected to Server✅ - Sended By app.js"); // server.js로 메시지 전송!
});

// 메시지 수신
socket.addEventListener("message", (message) => {
  const li = document.createElement("li")
  li.innerText = message.data;
  messageList.append(li);
  console.log("Message from server ", message.data);
});

socket.addEventListener("close", () => {
  socket.send("Disconnected from Server ❌"); // 메시지를 전송해도 받을 수 없다...?
})

/**
 * Enter혹은 send버튼클릭시 서버에 메시지 전송
 * @param {*} event 
 */
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input")
  socket.send(makeMessage('new_message', input.value));

  input.value = "";
}
messageForm.addEventListener("submit", handleMessageSubmit)

function makeMessage(type, payload) {
  const msg = {type, payload}
  return JSON.stringify(msg);
}

/**
 * 
 * @param {*} event 
 */
function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input")
  socket.send(makeMessage('nickname', input.value));
  input.value = "";
}
nickForm.addEventListener("submit", handleNickSubmit)