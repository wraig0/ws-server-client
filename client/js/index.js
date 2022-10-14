// Starts a websocket connection, sends a message and writes the response to the output element.
(() => {
  let x = 0,
    y = 0,
    times = [];

  const url = "ws://localhost:3001";
  const ws = new WebSocket(url);
  const Events = {
    OPEN: "open",
    CLOSE: "close",
    ERROR: "error",
    MESSAGE: "message",
    INPUT: "input",
    MOUSE_MOVE: "mousemove",
  };
  MsgType = {
    TEXT: "text",
    COORDS: "coords",
  };
  const fps = document.getElementById("fps");
  const input = document.getElementById("textInput");
  const out = document.getElementById("out");
  const coords = document.getElementById("coords");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const WIDTH = window.innerWidth - 20;
  const HEIGHT = window.innerHeight - 50;
  const REAL_WIDTH = 3840;
  const REAL_HEIGHT = 2160;
  const img = new Image(WIDTH, HEIGHT);
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  img.onload = () => ctx.drawImage(img, x, y);

  const sendMessage = (t) => {
    const msg = {
      type: MsgType.TEXT,
      value: t,
    };
    ws.send(JSON.stringify(msg));
  };

  const sendCoords = /*_.throttle(*/ (x, y) => {
    const msg = {
      type: MsgType.COORDS,
      value: { x, y },
    };
    ws.send(JSON.stringify(msg));
  }; /*, 100);*/

  const clear = () => {
    input.value = "";
    input.focus();
  };

  const onError = (e) => console.error(e);

  const onOpen = () => {
    sendMessage("Server up!");

    if (input) {
      document.addEventListener(Events.INPUT, (e) => {
        sendMessage(e.target.value);
      });
      input.focus();

      clearButton = document.getElementById("clear");
      clearButton.addEventListener("click", clear);
    }
    document.addEventListener(Events.MOUSE_MOVE, (e) => {
      sendCoords(e.clientX, e.clientY);
    });
  };

  const onClose = (e) => console.log(e);

  const handleTextMessage = (response) => {
    if (!out) return; //throw new Error("out not defined");
    const today = new Date();
    let hours = today.getHours();
    let mins = today.getMinutes();
    let secs = today.getSeconds();
    let ms = today.getMilliseconds();

    while (hours.toString().length < 2) hours = "0" + hours;
    while (mins.toString().length < 2) mins = "0" + mins;
    while (secs.toString().length < 2) secs = "0" + secs;
    while (ms.toString().length < 3) ms += "0";

    const time = `${hours}:${mins}:${secs}:${ms}`;

    out.innerText = `${time} - ${response.value}\n${out.innerText}`;
  };

  const updateFps = () => {
    console.log(times);
    const now = Date.now();
    times = times.filter((tim) => now - tim < 1000);
    times.push(now);
    fps.innerText = `fps: ${times.length}`;
  };

  const onMessage = (e) => {
    const response = JSON.parse(e.data);
    if (response.type === MsgType.TEXT) {
      handleTextMessage(response);
    } else if (response.type === MsgType.COORDS) {
      if (!coords) return; //throw new Error("coords not defined");
      x = response.value.x;
      y = response.value.y;
      coords.innerText = `x: ${x}, y: ${y}`;
      ctx.drawImage(img, x - REAL_WIDTH / 2, y - REAL_HEIGHT / 2);
      updateFps();
    }
  };

  ws.addEventListener(Events.OPEN, onOpen);
  ws.addEventListener(Events.CLOSE, onClose);
  ws.addEventListener(Events.ERROR, onError);
  ws.addEventListener(Events.MESSAGE, onMessage);

  fetch("/client/js/space4k.jpg")
    .then((response) => response.blob())
    .then((blob) => {
      img.src = URL.createObjectURL(blob);
    })
    .catch((e) => console.error(e));
})();
