import { FilecoinSigner } from "@blitslabs/filecoin-js-signer";
import WebSocket from "ws";

const filecoinSigner = new FilecoinSigner();

// 导入dotenv模块,获取环境变量
require("dotenv").config();
const FILECOIN_PROJECT_ID = process.env.FILECOIN_PROJECT_ID;
const FILECOIN_PROJECT_SECRET = process.env.FILECOIN_PROJECT_SECRET;
const WSS_ENDPOINT = process.env.WSS_ENDPOINT;

const main = async () => {
  const connectionString = `wss://${FILECOIN_PROJECT_ID}>:${FILECOIN_PROJECT_SECRET}@filecoin.infura.io`;

  console.log("connectionString:", connectionString);

  console.log(new WebSocket(connectionString));

  const ws = new WebSocket(connectionString);

  console.log("ws:", ws);

  ws.on("open", function open() {
    ws.send("something");
  });

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });
};

ws.on("close", function close() {
  console.log("disconnected");
});

main();
