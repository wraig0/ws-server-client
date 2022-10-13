// Starts a websocket connection, sends a message and writes the response to the output element.
(() => {
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
  const input = document.getElementById("textInput");
  const out = document.getElementById("out");
  const coords = document.getElementById("coords");
  const canvas = document.getElementById("canvas");

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

  const onMessage = (e) => {
    const response = JSON.parse(e.data);
    if (response.type === MsgType.TEXT) {
      handleTextMessage(response);
    } else if (response.type === MsgType.COORDS) {
      if (!coords) return; //throw new Error("coords not defined");
      coords.innerText = `x: ${response.value.x}, y: ${response.value.y}`;
    }
  };

  ws.addEventListener(Events.OPEN, onOpen);
  ws.addEventListener(Events.CLOSE, onClose);
  ws.addEventListener(Events.ERROR, onError);
  ws.addEventListener(Events.MESSAGE, onMessage);

  fetch("/client/js/space4k.jpg")
    .then((response) => response.blob())
    .then((blob) => {
      const ctx = canvas.getContext("2d");
      const WIDTH = window.innerWidth - 20;
      const HEIGHT = window.innerHeight - 200;
      const img = new Image(WIDTH, HEIGHT);
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      img.onload = () => ctx.drawImage(img, -300, -300);
      img.src = URL.createObjectURL(blob);
    })
    .catch((e) => console.error(e));
})();
