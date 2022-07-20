var request = require("request");

const CHAIN_HEAD = "ChainHead";
const CHAIN_GET_BLOCK_MESSAGES = "ChainGetBlockMessages";
const CHAIN_GET_TIPSET_BY_HEIGHT = "ChainGetTipSetByHeight";

// 导入dotenv模块,获取环境变量
require("dotenv").config();
const FILECOIN_PROJECT_ID = process.env.FILECOIN_PROJECT_ID;
const FILECOIN_PROJECT_SECRET = process.env.FILECOIN_PROJECT_SECRET;

const main = async () => {
  let para = [1999837, null];
  // await getData(CHAIN_HEAD, null);
  await getData(CHAIN_GET_TIPSET_BY_HEIGHT, para);
};

main();

async function getData(func: any, params: any) {
  var headers = {
    "Content-Type": "application/json",
  };

  let paramsString = "";
  if (params) {
    paramsString = `, "params": ${JSON.stringify(params)}`;
  }

  console.log(`paramsString: ${paramsString}`);

  const dataString = `{ "id": 100, "jsonrpc": "2.0", "method": "Filecoin.${func}"${paramsString} }`;

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

  switch (func) {
    case CHAIN_HEAD:
      request(options, chainHeadCallBack);
      // 存在数据库里
      break;
    case CHAIN_GET_BLOCK_MESSAGES:
      request(options, transferMessageCallback);
      break;
    case CHAIN_GET_TIPSET_BY_HEIGHT:
      request(options, chainGetTipSetByHeightCallBack);
      break;
  }
}

function transferMessageCallback(error: any, response: any, body: any) {
  if (!error && response.statusCode == 200) {
    const data = JSON.parse(body).result;
    let transfer_set = [];
    let datum;

    if (data.BlsMessages) {
      const blsMessages = data.BlsMessages;
      for (const blsMessage of blsMessages) {
        if (blsMessage.Method == 1) {
          datum = {
            to: blsMessage.To,
            from: blsMessage.From,
            value: blsMessage.Value,
            cid: blsMessage.CID["/"],
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
            cid: secpkMessage.CID["/"],
          };

          transfer_set.push(datum);
        }
      }
    }

    // 将transfer_set存储到数据库里
    console.log(`transfer_set: ${JSON.stringify(transfer_set)}`);
  }
}

function chainHeadCallBack(error: any, response: any, body: any) {
  let data = JSON.parse(body);
  let blockHeight;
  if (!error && response.statusCode == 200) {
    console.log(`data: ${body}`);

    if (data.result) {
      blockHeight = data.result.Height;
    }
  }

  // 记录到 current的数据库里（Filecoin 30秒出一个块）
}

async function chainGetTipSetByHeightCallBack(
  error: any,
  response: any,
  body: any
) {
  let data = JSON.parse(body);
  if (!error && response.statusCode == 200) {
    if (data.result) {
      if (data.result.Cids) {
        for (const cid of data.result.Cids) {
          // 每一个调用transferMessageCallback
          await getData(CHAIN_GET_BLOCK_MESSAGES, [cid]);
        }
      }
    }
  }

  // 记录到 current的数据库里（Filecoin 30秒出一个块）
}
