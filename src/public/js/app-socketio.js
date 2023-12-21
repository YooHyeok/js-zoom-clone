/**
 * html의 script(src="/socket.io/socket.io.js")에 의해 작동된다.
 * socket.io.js파일을 로드함으로써 io함수가 전역객체에 추가된다.
 * socket.io.js의 아래 코드
 * value: function emit(ev) {}
 * io를 호출하면 socket.js의 Socket 클래스를 오브젝트화 하는것같다.
 */
const socket = io();

/* View - Element */
const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById("room")
room.hidden = true // 룸 비활성화

let roomname;

/**
 * 
 * @param {*} event 
 */
async function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("input") // 직계자식 뿐만아니라 손자도 가져올 수 있다...
  /* socket.emit("new_message", {roomname: roomname, message: input.value}, ()=>{
    addMessage(`You: ${info.value}`)
    input.value = ""
  }) */
  socket.emit("new_message", {roomname: roomname, message: input.value}, addMessage)
  input.value = ""
  
}

/**
 * Room 영역을 활성화 시킨다
 * 메시지를 입력하는 영역이 활성화된다.
 * Welcom 영역을 비활성화 시킨다
 * 룸정보를 입력하는 영역이 비활성화 된다.
 */
function showRoom() {
  welcome.hidden = true;
  room.hidden = false
  const h3 = room.querySelector("h3")
  h3.innerText = `Room ${roomname}`
  /* 활성화 됬을때 메시지 전송작업 진행 */
  const form = room.querySelector("form")
  form.addEventListener("submit", handleMessageSubmit)
}

/**
 * 채팅 room name 입력후 
 * EnterRoom 버튼 클릭시 실행되는 함수
 * @param {*} event 
 */
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input")
   
  //emit: socket.io에서 메시지 전송해주는 함수
  // 1번째 parameter: event(커스텀)로 사용
  // 2번째 parameter: 데이터변환 없이 object자체로 전송가능
  // 3번째 parameter: server에서 실행할 수 있는 callback함수
  /**
   * [emit] : socket.io에서 메시지 전송해주는 함수
   * 1번째 parameter: event(커스텀)로 사용
   * 2번째 parameter~: 데이터변환 없이 object자체로 전송가능
   * (3번째 4번째 등 데이터 arg 개수 제한없음)
   * last parameter: server에서 실행할 수 있는 callback함수
   */
  roomname = input.value;
  socket.emit("enter_room", roomname, showRoom);
  input.value = ""
}
form.addEventListener("submit", handleRoomSubmit);

/**
 * 메시지 목록 출력 함수
 * @param {*} message 
 */
function addMessage(message) {
  console.log(message)
  const ul = room.querySelector("ul")
  const li = document.createElement("li")
  li.innerText = message;
  ul.appendChild(li);
}

/**
 * 채팅 room 입장시 메시지 전송 함수
 * 나를 제외한 다른 클라이언트 대상
 */
socket.on("welcome", (message) => {
  addMessage(message)
})

/**
 * 브라우저 종료시 메시지 전송 함수
 * 나를 제외한 다른 클라이언트 대상
 */
socket.on("bye", (message) => {
  addMessage(message)
})

/**
 * 메시지 전송 함수
 * 나를 제외한 다른 클라이언트 대상
 */
socket.on("message", (message) => {
  addMessage(message)
})
