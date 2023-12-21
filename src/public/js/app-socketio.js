/**
 * html의 script(src="/socket.io/socket.io.js")에 의해 작동된다.
 * socket.io.js파일을 로드함으로써 io함수가 전역객체에 추가된다.
 * socket.io.js의 아래 코드
 * value: function emit(ev) {}
 * io를 호출하면 socket.js의 Socket 클래스를 오브젝트화 하는것같다.
 */
const socket = io();
console.log(socket)

/* View - Element */
const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById("room")
room.hidden = true // 룸 비활성화

/**
 * Room 영역을 활성화 시킨다
 * 메시지를 입력하는 영역이 활성화된다.
 * Welcom 영역을 비활성화 시킨다
 * 룸정보를 입력하는 영역이 비활성화 된다.
 */
let roomname;
function showRoom() {
  welcome.hidden = true;
  room.hidden = false
  const h3 = room.querySelector("h3")
  h3.innerText = `Room ${roomname}`
}

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

function addMessage(message) {
  console.log(message)
  const ul = room.querySelector("ul")
  const li = document.createElement("li")
  li.innerText = message;
  ul.appendChild(li);
}

socket.on("welcome", (message) => {
  addMessage(message)
})