const socket = io();

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")

let myStream;
let muted = false;
let cameraOff = false;
let myPeerConnection;
let myDataChannel;

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

/**
 * 음소거 버튼 클릭 이벤트 핸들러 함수
 * @returns 
 */
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

/**
 * 카메라 전환 버튼 클릭 이벤트 핸들러 함수
 * @returns 
 */
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

/**
 * 카메라 변경 이벤트 핸들러 함수
 */
async function handleCameraChange() {
  await getMedia(camerasSelect.value)
  if (myPeerConnection) {
    const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === 'video');
    videoSender.replaceTrack(myStream.getVideoTracks()[0])
  }
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)

/* =========================== welcome form 시작 ===========================================================> */
const welcome = document.getElementById("welcome")
const welcomeForm = welcome.querySelector("form")
const call = document.getElementById("call")
call.hidden = true

let roomname;

/**
 * 영역 전환 효과 후 미디어 스트림 저장
 * welcome 영역 숨김
 * call 영역 숨김해제
*/
async function initCall() {
  welcome.hidden = true
  call.hidden = false
  await getMedia();
  makeConnection();
}

/**
 * Enter Room Btn 클릭 이벤트 함수
 * 입력란 방정보 데이터를 서버에 전송한다
 * 전송후 서버측에서 전달받은 콜백함수 startMedia를호출 
 * 영역을 전환함으로써 방 입장 효과를 준다
 * @param {*} event 
*/
async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = this.querySelector("input")
  roomname = input.value;
  await initCall()
  socket.emit("join_room", roomname)
  input.value = ""
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit)

/* ================= Socket Signaling 시작 =================================================================> */

/**
 * [peer A]
 * peer A 정보, 입장 방 정보 서버로 전송
 * peer 연결 객체로부터 Offer 생성
 * 생성한 offer를 다시 peer연결 객체에 저장
 * 서버에 offer과 방이름 전송
 * offer가 주고 받아진 순간 직접적으로 대화가 가능해진다.
 * 
 * (가장 최초로 들어오는 peer는 입장한 room에 아무도 없기 때문에 
 * welcome emit 이벤트가 발생하지만 콜백 함수는 실행되지 않는다.)
 */
socket.on("welcome", async () => {
  console.log("someone Joined!")
  /* 데이터 채널 생성 */
  // 무언가를 offer하는 socket이 dataChannel을 생성하는 주체가 되어야 하며 offer 생성 전에 생성해야한다.
  myDataChannel = myPeerConnection.createDataChannel("chat") 
  myDataChannel.addEventListener("message", event => console.log(event.data))
  console.log("made data channel")
  const offer = await myPeerConnection.createOffer(); // 수신자에게 전달할 SDP 생성
  myPeerConnection.setLocalDescription(offer) // signaling을 위한 SDP수집 (전역으로 저장함으로써 다른 피어 접속시 해당 변수를 통해 통신설정 협상)
  console.log("sent the offer")
  socket.emit("offer", offer, roomname) // 서버에게 peer to peer signaling
})

/**
 * [peer B] A를 제외한 모든 peer 대상 (최초 입장 peer 포함)
 * peer A 정보 서버로부터 수신
 * setRemoteDescription
 * peer B 정보 모든 peer에게 전송
 */
socket.on("offer", async (offer)=>{
  myPeerConnection.addEventListener("datachannel", event => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", event => console.log(event.data))
  })
  console.log("received the offer")
  myPeerConnection.setRemoteDescription(offer)
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer)
  socket.emit("answer", answer, roomname)
  console.log("sent the answer")
})

/**
 * [peer A] B를 제외한 모든 peer 대상
 * B로 부터 받은 answer setRemoteDescription 작업
 */
socket.on("answer", async (answer)=>{
  console.log("received the answer")
  myPeerConnection.setRemoteDescription(answer)
})

/**
 * 서버로부터 상대방 peer의 candidate 프로토컬 정보 반환받는다.
 * 해당 프로토컬 정보를 나의 피어연결객체에 추가한다.
 */
socket.on('ice', ice=>{
  console.log("received candidate")
  myPeerConnection.addIceCandidate(ice)
})

/* =========================== webRTC 시작 =================================================================> */

/**
 * icecandidate이벤트 핸들러 콜백 함수
 * candidate 프로토콜을 서버로 전송한다.
 * setLocalDescript에 의해 로컬 피어가 연결에 추가된 이후
 * icecandidate이벤트가 트리거된다.
 * @param {*} data 
 */
function handleIce(data) {
  console.log("sent candidate")
  socket.emit("ice", data.candidate, roomname)
}

/**
 * peer 즉, 상대방 stream 할당
 * @param {*} data 
 */
function handleAddStream(data) {
  console.log("get an event from my peer")
  const peerFace = document.getElementById("peerFace")
  peerFace.srcObject = data.streams[0]
}

/**
 * RTC Peer Connection 객체 생성
 * 현재 접속한 클라이언트의 비디오, 오디오 스트림을 생성한 객체에 주입한다.
 */
async function makeConnection(){
  myPeerConnection = new RTCPeerConnection();//peer to peer connection 생성
  /**
   * stun 서버 생성
   * stun 서버를 통해 공용 IP주소를 찾는다.
   * 서로 다른 wifi (데이터) 다른 네트워크일 경우 기기를 서로 찾을 수 없다.
   * stun서버에서 어떠한 것을 request 요청하면 인터넷을 통해 내가 누군지 알려주는 서비스이다.
   * 현재 device에 연결된 네트워크의 공용(public) ip주소를 알아낸다.
   * 모바일 등의 기기 호환에 대한 테스트용도로만 사용한다.
   * 
   */
  const stunServer = {iceServers: 
    [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
          ],
      },
    ],
  }
  // myPeerConnection = new RTCPeerConnection(stunServer) //stun server 적용

  /**
   * addEventListener은 해당 이벤트가 발생할 때 마다 콜백함수를 호출하기 위해 등록하는것이기 때문에
   * makeConnection 함수가 종료 한지 한참 뒤에 해당 이벤트가 발생하여도
   * 등록된 콜백 함수가 정상적으로 실행된다.
   */
  myPeerConnection.addEventListener("icecandidate", handleIce) // setLocalDescription에 의해 로컬 피어가 연결에 추가되면 ICE Candidate 이벤트가 트리거
  // myPeerConnection.addEventListener("addstream", handleAddStream) // stream에 addTrack로 stream이 추가되었을때 이벤트가 발생한다.
  myPeerConnection.addEventListener("track", handleAddStream) // addstream이벤트 deprecated 대체 이벤트
  myStream.getTracks()
  .forEach(track => myPeerConnection.addTrack(track, myStream)) // connection에 비디오, 오디오 stream 추가
}