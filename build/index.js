"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var request = require("request");
var CHAIN_HEAD = "ChainHead";
var CHAIN_GET_BLOCK_MESSAGES = "ChainGetBlockMessages";
var CHAIN_GET_TIPSET_BY_HEIGHT = "ChainGetTipSetByHeight";
// 导入dotenv模块,获取环境变量
require("dotenv").config();
var FILECOIN_PROJECT_ID = process.env.FILECOIN_PROJECT_ID;
var FILECOIN_PROJECT_SECRET = process.env.FILECOIN_PROJECT_SECRET;
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var para;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                para = [1999837, null];
                // await getData(CHAIN_HEAD, null);
                return [4 /*yield*/, getData(CHAIN_GET_TIPSET_BY_HEIGHT, para)];
            case 1:
                // await getData(CHAIN_HEAD, null);
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
main();
function getData(func, params) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, paramsString, dataString, options;
        return __generator(this, function (_a) {
            headers = {
                "Content-Type": "application/json",
            };
            paramsString = "";
            if (params) {
                paramsString = ", \"params\": ".concat(JSON.stringify(params));
            }
            console.log("paramsString: ".concat(paramsString));
            dataString = "{ \"id\": 100, \"jsonrpc\": \"2.0\", \"method\": \"Filecoin.".concat(func, "\"").concat(paramsString, " }");
            options = {
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
            return [2 /*return*/];
        });
    });
}
function transferMessageCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var data = JSON.parse(body).result;
        var transfer_set = [];
        var datum = void 0;
        if (data.BlsMessages) {
            var blsMessages = data.BlsMessages;
            for (var _i = 0, blsMessages_1 = blsMessages; _i < blsMessages_1.length; _i++) {
                var blsMessage = blsMessages_1[_i];
                if (blsMessage.Method == 7) {
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
            var secpkMessages = data.SecpkMessages;
            for (var _a = 0, secpkMessages_1 = secpkMessages; _a < secpkMessages_1.length; _a++) {
                var secpkMessage = secpkMessages_1[_a];
                if (secpkMessage.Method == 7) {
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
        console.log("transfer_set: ".concat(JSON.stringify(transfer_set)));
    }
}
function chainHeadCallBack(error, response, body) {
    var data = JSON.parse(body);
    var blockHeight;
    if (!error && response.statusCode == 200) {
        console.log("data: ".concat(body));
        if (data.result) {
            blockHeight = data.result.Height;
        }
    }
    // 记录到 current的数据库里（Filecoin 30秒出一个块）
}
function chainGetTipSetByHeightCallBack(error, response, body) {
    return __awaiter(this, void 0, void 0, function () {
        var data, _i, _a, cid;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = JSON.parse(body);
                    if (!(!error && response.statusCode == 200)) return [3 /*break*/, 4];
                    if (!data.result) return [3 /*break*/, 4];
                    if (!data.result.Cids) return [3 /*break*/, 4];
                    _i = 0, _a = data.result.Cids;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    cid = _a[_i];
                    // 每一个调用transferMessageCallback
                    return [4 /*yield*/, getData(CHAIN_GET_BLOCK_MESSAGES, [cid])];
                case 2:
                    // 每一个调用transferMessageCallback
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
