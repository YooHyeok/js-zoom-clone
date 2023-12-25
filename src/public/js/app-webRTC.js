const socket = io();

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")

let myStream;
let muted = false;
let cameraOff = false;
let roomname;

/**
 * 카메라 목록 콤보 할당
 * enumerateDevices() : 컴퓨터 혹은 모바일이 가지고 있는 모든 장치를 알려준다.
 * 
 */
async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === "videoinput")
    const currentCamera = myStream.getVideoTracks()[0] //현재 선택된 카메라 조회
    cameras.forEach(camera => {
      const option = document.createElement("option")
      option.value = camera.deviceId;
      option.innerText = camera.label
      if(currentCamera.label === camera.label) { // 현재 선택한 카메라 라벨과 일치하는 카메라에 selected옵션 추가
        option.selected = true;
      }
      camerasSelect.appendChild(option)
    })
  } catch (error) {
    console.log(error)
  }
}

/**
 * 미디어 스트림 비디오 할당
 * getUserMedia() : 컴퓨터 혹은 모바일이 가지고 있는 미디어 스트림을 알려준다.
 * 
 */
async function getMedia(deviceId) {

  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" }
  }

  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } } // exact옵션 : 해당 id가 없다면 다른 카메라를 자동으로 연결하지 않고 출력하지않는다.
  }
  try {
    myFace.srcObject = myStream;
    myStream = await navigator.mediaDevices.getUserMedia(deviceId? cameraConstraints: initialConstraints)
    myFace.srcObject = myStream;
    if(!deviceId) await getCameras(); //데이터가 들어오지 않았을 경우에 목록 출력 (!undefined == true)
  } catch (error) {
    console.log(error)
  }
}

function handleMuteClick() {
  myStream.getAudioTracks().forEach(track=>{
    track.enabled = !track.enabled
  })
  if(!muted) {
    muteBtn.innerText = "UnMute"
    muted = !muted
    return
  }
  muteBtn.innerText = "Mute"
  muted = !muted
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach(track=>{
    console.log(track)
    track.enabled = !track.enabled
  })
  if(!cameraOff) {
    cameraBtn.innerText = "Turn Camera On"
    cameraOff = !cameraOff
    return
  }
  cameraBtn.innerText = "Turn Camera Off"
  cameraOff = !cameraOff

}

async function handleCameraChange() {
  await getMedia(camerasSelect.value)
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)

/* welcome form 시작 */
const welcome = document.getElementById("welcome")
const welcomeForm = welcome.querySelector("form")
const call = document.getElementById("call")
call.hidden = true

/**
 * 영역 전환 효과 후 미디어 스트림 저장
 * welcome 영역 숨김
 * call 영역 숨김해제
 */
function startMedia() {
  welcome.hidden = true
  call.hidden = false
  getMedia();
}

/**
 * Enter Room Btn 클릭 이벤트 함수
 * 입력란 방정보 데이터를 서버에 전송한다
 * 전송후 서버측에서 전달받은 콜백함수 startMedia를호출 
 * 영역을 전환함으로써 방 입장 효과를 준다
 * @param {*} event 
 */
function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = this.querySelector("input")
  roomname = input.value;
  socket.emit("join_room", roomname, startMedia)
  input.value = ""
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit)

/* Socket 시작 */
socket.on("welcome", () => {
  console.log("someone Joined!")
})