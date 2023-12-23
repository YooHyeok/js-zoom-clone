const socket = io();

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")

let myStream;
let muted = false;
let cameraOff = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({audio: false, video: true})
    console.log(myStream)
    myFace.srcObject = myStream;
  } catch (error) {
    console.log(error)
  }
}
getMedia();

function handleMuteClick(event) {
  if(!muted) {
    muteBtn.innerText = "UnMute"
    muted = !muted
    return
  }
  muteBtn.innerText = "Mute"
  muted = !muted
}

function handleCameraClick(event) {
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