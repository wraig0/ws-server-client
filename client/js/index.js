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
  };
  const onError = (e) => console.error(e);
  const onOpen = (e) => {
    console.log(e);
    ws.send(`hello!`);

    const input = document.getElementById("textInput");
    if (input) {
      document.addEventListener(Events.INPUT, (e) => {
        ws.send(e.target.value);
      });
    }
  };
  const onClose = (e) => console.log(e);
  const onMessage = (e) => {
    console.log(e.data);
    const out = document.getElementById("out");
    if (out) {
      const today = new Date();
      const time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      out.innerText = `${time}:${encodeURIComponent(e.data)}\n${out.innerText}`;
    }
  };

  ws.addEventListener(Events.OPEN, onOpen);
  ws.addEventListener(Events.CLOSE, onClose);
  ws.addEventListener(Events.ERROR, onError);
  ws.addEventListener(Events.MESSAGE, onMessage);
})();
