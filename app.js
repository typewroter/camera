const video = document.getElementById('video');
const button = document.getElementById('button');
const select = document.getElementById('select');
let currentStream;

var aCanvas = document.getElementById('canvas');
var context = aCanvas.getContext("2d");
var img = new Image();

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

function gotDevices(mediaDevices) {
  select.innerHTML = '';
  select.appendChild(document.createElement('option'));
  let count = 1;
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      const option = document.createElement('option');
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      select.appendChild(option);
    }
  });
}

button.addEventListener('click', event => {
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream);
  }
  const videoConstraints = {};
  if (select.value === '') {
    videoConstraints.facingMode = 'environment';
  } else {
    videoConstraints.deviceId = { exact: select.value };
  }
  const constraints = {
    video: videoConstraints,
    audio: false
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
      CatchCode()
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    .catch(error => {
      console.error(error);
    });
});

function CatchCode() {
  if (canvas != null) {
    context.drawImage(video, 0, 0, 480, 320);
    img.src = canvas.toDataURL("image/png");
    try {
      qrcode.decode(img.src);
      qrcode.callback = function (imgMsg) {
        if (imgMsg == "error decoding QR Code") {
          console.log("请对准二维码");
          CatchCode()
          return;
        }
        console.log(imgMsg)
        window.open(imgMsg)
        var data = StringToBytes(imgMsg);
        var hex_string = BytesToHexString(data);
        console.log("二维码解析：" + hex_string);
        video.srcObject.getTracks()[0].stop();  //解析成功，关闭摄像头
        console.log("解析成功，关闭摄像头")
      }
    } catch (m) {
      alert(m);
    }
  }
}

function StringToBytes(str) {
  var ch, st, re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i);  // get char
    st = [];                // set up "stack"
    do {
      st.push(ch & 0xFF);  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

function BytesToHexString(bytes) {
  return bytes.map(function (byte) {
    return ("00" + (byte & 0xFF).toString(16)).slice(-2)
  }).join('')
}

navigator.mediaDevices.enumerateDevices().then(gotDevices);