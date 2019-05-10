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
const elasticsearch_1 = require("@elastic/elasticsearch");
//const { Client, RequestParams } = require('@elastic/elasticsearch');
const URL = `http://${consts_1.ELASTIC_IP}:${consts_1.ELASTIC_PORT}`;
class elastic_connection {
    constructor() {
        this.Indices = [[], []];
        this.client = new elasticsearch_1.Client({ node: URL });
    }
    readData(response) {
        const hits = response.body.hits.hits;
        let channel = 0;
        if (this.Indices[0].length !== 0) {
            channel = 1;
        }
        hits.forEach((song) => this.Indices[channel].push(song._source));
    }
    getData(pIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log("getData");
            const client = new elasticsearch_1.Client({ node: URL });
            const params = {
                index: pIndex,
                body: {
                    from: 0,
                    size: 5,
                    sort: [
                        {
                            score: {
                                order: "desc"
                            }
                        }
                    ]
                }
            };
            const x = yield client.search(params);
            yield this.readData(x);
            client.close();
            return x;
        });
    }
    getInfo(pChannel) {
        return this.Indices[pChannel];
    }
    sendData(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new elasticsearch_1.Client({ node: URL });
            this.Indices = [[], []];
            //console.log("sendData");
            const result = client.bulk({
                index: "_all",
                body: info
            });
            client.close();
            return result;
        });
    }
    deleteData(pIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new elasticsearch_1.Client({ node: URL });
            this.Indices = [[], []];
            console.log("deleteData");
            /*return this.client.indices.delete({
              index: pIndex
            })*/
            const a = client.delete_by_query({
                index: "_all",
                body: {
                    query: {
                        match_all: {}
                    }
                }
            }, (err, resp) => {
                if (err) {
                    console.log(err.meta.body.failures);
                }
            });
            client.close();
            return a;
        });
    }
    createIndex(pIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.indices.create({
                index: pIndex
            });
        });
    }
}
exports.elastic_connection = elastic_connection;
//# sourceMappingURL=elastic_conection.js.map