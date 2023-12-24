const socket = io();

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")

let myStream;
let muted = false;
let cameraOff = false;


/**
 * 미디어 스트림 비디오 할당
 * getUserMedia() : 컴퓨터 혹은 모바일이 가지고 있는 미디어 스트림을 알려준다.
 * 
 */
async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
    myFace.srcObject = myStream;
  } catch (error) {
    console.log(error)
  }
}
getMedia();

function handleMuteClick(event) {
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

function handleCameraClick(event) {
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

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)