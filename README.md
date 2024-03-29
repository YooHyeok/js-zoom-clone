# js-zoom-clone

Zoom Clone Using NodeJS, WebRTC and WebSockets

# `프로젝트 설정`

<details>
<summary>설정 상세보기</summary>
　

### `[Node 프로젝트 초기 세팅]`
 * https://u-it.tistory.com/482

### `[NPM install]`
* websocket
  - expressjs: `npm i express`
  - websocket: `npm i websocket`


* socketIO
  - socketIO: `npm i socketIO`
  - admin: `npm i @socket.io/admin-ui`

* localtunnel
  - `npm i -g localtunnel`
  - `lt --port 3000`

공인 ip 주소 조회
https://studio-jt.co.kr/my-ip/


</details>
<br/>
<hr/>


[Socket.io] `Adapter`

Adapter란?

기본적으로 하는 일은 다른 서버들 사이에 실시간 어플리케이션을 동기화한다.
동기화란? 프로세스 또는 스레드들이 수행되는 시점을 조절하여 서로가 알고 있는 정보가 일치하는 것

채팅 프로그램 
서버종료 후 재실행 시 모든 room과 message와 socket이 없어진다

또한, 앱에 많은 클라이언트가 있을 때 모든 클라이언트에 대해서 connection을 열어 둬야 한다.
서버는 Connection이 오픈된 상태를 유지해야한다.
각 브라우저는 서버로 하나의 Connection을 연다.
브라우저 즉, 클라이언트수가 많아지면 서버에 많은 Connection이 들어온다.
서버는 그 많은 Connection들을 메모리에 저장한다.

만약 서버를 여러개 생성했다면 각 서버는 같은 메모리풀을 공유하지 않는다.

누가 연결되었는 지, 현재 어플리케이션에 room이 얼마나 있는지에 대한 정보

sids : 소켓의 아이디이다.
rooms는 sid도 가지고 있는데, socket별로 전용 방이 있기 때문이다.
socket 전용 room은 private room이므로 private message를 보낼 수 있다.

학습목표
socket ID Sids를 가져와서 해당 시드와 일치하는 방을 확인하고
그 방이 어던 socket을 위해 만들어졌는지 확인한다.

[webRTC] - 웹 실시간 소통 (Web Real Time Communication)

실시간 커뮤니케이션을 가능하게 해주는 기술

`peer to peer`

socket.io로 만든 채팅은 peer to peer가 아니다
한 서버에 많은 web socket이 연결된다.
한 web socket이 메시지를 보냈을 때 서버에 전송된다.
서버는 메시지를 전송한 web socket을 제외한 모든 web socket에게 받은 메시지를 다시 전송한다.(브로드 캐스트)
모든 web socket은 서버에 연결되어있고 서버는 연결된 모든 websocket에게 메시지를 전달하는 역할을 한다.
만약 A와 B가 socket IO를 사용하고 채팅방에 입장한 상태일 때
A가 B에게 "Hello"라는 메시지를 보내면 "Hello" 메시지가 바로 B에게 전송되는것이 아니라
서버로 전송된 후 서버가 다시 B에게 "Hello"를 전달하는 것이다.
이와같이 socketIO를 사용한 채팅은 언제나 서버를 사용해야 한다.

webRTC는 peer to peer 커뮤니케이션이 가능하다.
비디오와 오디오, 그리고 메시지가 서버로 가지 않음을 의미한다.
즉, 서버를 거치지 않고 직접 실시간 전송을 한다.
서버가 필요하지 않기 때문에, 실시간(real time) 전송 속도가 엄청 빠르다.

만약 전송자의 모든 비디오와 오디오를 서버에 업로드 해야 한다면
그리고 수신자가 그것을 실시간으로 서버에서 다운받는 상황이라면 
해당 서버는 너무나도 많은 cost가 발생하며, 결국 서버는 매번 터질거다.
반면 webRTC는 peer to peer 연결 방식이므로 더이상 전송자가 서버에 전달하지 않아도 된다.
컴퓨터, 즉 수신자의 브라우저에 직접 전달하면 된다.
다시말해 A의 브라우저가 B의 브라우저에 직접 연결되는거다.
서버가 비디오나 오디오를 보내고 받을 필요가 없게 된다.

webRTC에서 peer to peer 연결을 위해서는 서버가 필요하다.
하지만 영상이나 오디오를 전송하기 위해 필요한것은 아니고 signaling이란것을 하기 위해 서버가 필요하다

signaling이란?
A와 B가 서로 소통하기 위해서는 각자의 브라우저 위치 정보등을 알아야 한다.
(IP주소, 방화벽존재, 라우터정보, 컴바인네트워크(회사), public, port 정보 등)
브라우저로 하여금 서버가 상대가 어디에 있는지 알게 하는것이 필요하다.
A가 B에게 peer to peer 연결을 희망할 때  A의 브라우저는 서버에게 자신의 configuration정보만을 전달한다. (ip, port, location 등)
반대로 B가 A에게 peer to peer 연결을 희망할 때도 동일하게 configuration 정보를 전달한다.
서버는 받은 정보들을 각각 상대방에게 다시 전달해 줌으로써 peer to peer로 연결된다.
서버는 각 상대의 정보를 얻고, 다른 상대에게 다시 그 정보를 되돌려 줄 뿐이다. (offer와 answer)

offer와 answer이 모두 끝났을 대 iceCandidate 이벤트 실행

icecandidate란?
ice : internet Connectivity Establishement 인터넷 연결 생성
멀리 떨어진 장치와 소통할 수 있게 해주는 webRTC에 필요한 프로토콜들을 의미한다.
브라우저간 소통을 중재하는 프로세스로 어떤 소통 방법이 가장 좋을 것인지 제안할때 사용한다.
다수의 candidate(후보) 들이 각각의 연결에서 제안되고 서로의 동의 하에 하나의 프로토콜을 선택하여 소통방식에 사용한다.

[DataChannel]
peer to peer 사용자가 모든 종류의 데이터를 주고 받을 수 있는 채널이다.

[webRTC 단점]

너무 많은 peer를 가질 때 속도가 느려진다.
실시간 화상음성 채팅이 아닌 단순 저용량 메시지 전송의 경우
2명이면 1업 1다운 이지만
3명이면 2업 2다운 
4명이면 3업 3다운 즉 같은 스트림을 세명의 다른 유저에게 업로드하고 다운로드해야 한다.

이것을 Mesh(그물망) 네트워크 구조라고 하며, 이로인해 느려진다.

SFU - Selective Forwarding Unit
서버에 의존한다.
스트림 업로드는 1번만 하고 기존 peer에 대한 스트림 다운로드와
새로운 peer접근시 다운로드가 발생한다.

각 peer의 스트림이 서버에 업로드되면 서버는 호스트정보와 말하는사람의 정보를 알 수 있게 되고
듣고만 있는 스트림은 압축한다.(낮은 사양)
말하거나 스크린을 공유하고 있는 사람의 화면이라면 서버가 조금 더 좋은 사양으로 제공한다.

DataChannel들은 텍스트일 뿐이므로 업로드와 다운로드 하는게 빠르다.
모든 문제는 비디오와 오디오를 다룰 때 생긴다.
무겁고 까다롭기때문에 ZOOM은 엄청 큰 서버를 가지고 있는 이유중 하나이다.