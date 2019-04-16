"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("./library/consts");
const { Client } = require('@elastic/elasticsearch');
const URL = `http://${consts_1.ELASTIC_IP}:${consts_1.ELASTIC_PORT}`;
const url = 'https://jsonplaceholder.typicode.com/todos/1';
function getData(response) {
    const data = JSON.parse(JSON.stringify(response)).body.hits.hits;
    for (let element of data) {
        element = JSON.parse(JSON.stringify(element));
    }
    return data;
}
function getAll(pIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new Client({ node: URL });
        yield client.search({
            index: pIndex,
            body: {
                query: {
                    match_all: {}
                }
            }
        }).then(function (response) {
            const data = getData(response);
            for (const element of data) {
                console.log(element._source);
            }
        }, function (err) {
            console.trace(err.message);
        });
        client.close();
    });
}
exports.getAll = getAll;
function sendData(info, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new Client({ node: URL });
        let bodyData = [];
        for (const data of info) {
            bodyData.push({ index: { _index: index } });
            bodyData.push(data);
        }
        yield client.bulk({
            index: index,
            refresh: true,
            type: 1,
            body: bodyData
        }).then(function (resp) {
        }, function (err) {
            console.trace(err.message);
        });
        client.close();
    });
}
exports.sendData = sendData;
//# sourceMappingURL=elastic_conection.js.map