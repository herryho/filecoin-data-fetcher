import { forEachChild } from "typescript";
import WebSocket from "ws";
import axios from "axios";
var request = require("request");

// 导入dotenv模块,获取环境变量
require("dotenv").config();
const FILECOIN_PROJECT_ID = process.env.FILECOIN_PROJECT_ID;
const FILECOIN_PROJECT_SECRET = process.env.FILECOIN_PROJECT_SECRET;

const main = async () => {
  const connectionString = `wss://${FILECOIN_PROJECT_ID}:${FILECOIN_PROJECT_SECRET}@filecoin.infura.io`;
  console.log("connectionString:", connectionString);
  const ws = new WebSocket(connectionString);

  ws.onopen = function (event) {
    console.log("I am open!");
    let param = {
      jsonrpc: "2.0",
      method: "Filecoin.ChainNotify",
      params: [],
      id: 3,
    };

    // send the ChainNotify param to start the receiving process
    ws.send(JSON.stringify(param));
  };

  ws.on("message", async function message(data) {
    let params = JSON.parse(data as any).params;
    for (const paramSet of params) {
      if (paramSet.Type == "apply") {
        let cids = paramSet[0]["Val"]["Cids"];

        // 这里需要将区块号和cid记录下来，区块号作为current区块表
        // 另外还有一个表，记录已经处理的区块，然后根据已处理的区块加一，来查找blockMessages

        let func = `ChainGetBlockMessages`;
        for (const cid of cids) {
          await getData(func, cid);
        }
      }
    }
  });

  ws.on("close", function close() {
    console.log("disconnected");
  });
  ws.on("error", function handleError(error) {
    //handle error
    console.log(error);
  });
};

main();

async function getData(func: any, params: any) {
  var request = require("request");

  var headers = {
    "Content-Type": "application/json",
  };

  const dataString = `{ "id": 100, "jsonrpc": "2.0", "method": "Filecoin.${func}", "params": [${JSON.stringify(
    params
  )}] }`;

  var options = {
    url: "https://filecoin.infura.io",
    method: "POST",
    headers: headers,
    body: dataString,
    auth: {
      user: FILECOIN_PROJECT_ID,
      pass: FILECOIN_PROJECT_SECRET,
    },
  };

  let transfer_set = request(options, callback);
  if (transfer_set.length > 0) {
    //存进数据库里
  }
}

function callback(error: any, response: any, body: any) {
  if (!error && response.statusCode == 200) {
    const data = JSON.parse(body).result;
    let transfer_set = [];
    let datum;

    if (data) {
      if (data.BlsMessages) {
        const blsMessages = data.BlsMessages;
        for (const blsMessage of blsMessages) {
          if (blsMessage.Method == 1) {
            datum = {
              to: blsMessage.To,
              from: blsMessage.From,
              value: blsMessage.Value,
            };

            transfer_set.push(datum);
          }
        }
      }
      if (data.SecpkMessages) {
        const secpkMessages = data.SecpkMessages;
        for (const secpkMessage of secpkMessages) {
          if (secpkMessage.Method == 1) {
            datum = {
              to: secpkMessage.To,
              from: secpkMessage.From,
              value: secpkMessage.Value,
            };

            transfer_set.push(datum);
          }
        }
      }
    }

    return transfer_set;
  }
}
