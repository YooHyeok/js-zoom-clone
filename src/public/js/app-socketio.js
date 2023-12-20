/**
 * html의 script(src="/socket.io/socket.io.js")에 의해 작동된다.
 * socket.io.js파일을 로드함으로써 io함수가 전역객체에 추가된다.
 * socket.io.js의 아래 코드
 * value: function emit(ev) {}
 * io를 호출하면 socket.js의 Socket 클래스를 오브젝트화 하는것같다.
 */
const socket = io();
console.log(socket)

const welcome = document.getElementById("welcome")
const form = document.querySelector("form")

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
   * 2번째 parameter: 데이터변환 없이 object자체로 전송가능
   * 3번째 parameter: server에서 실행할 수 있는 callback함수
   */
  socket.emit("enter_room", {payload: input.value}, () => {
    console.log("server is done")
  });
  input.value = ""


}
form.addEventListener("submit", handleRoomSubmit);