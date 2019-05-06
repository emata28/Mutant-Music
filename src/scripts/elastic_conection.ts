import {ELASTIC_IP, ELASTIC_PORT} from './library/consts';
import {ApiResponse, Client, RequestParams} from "@elastic/elasticsearch";
import {Index} from "@elastic/elasticsearch/api/requestParams";

//const { Client, RequestParams } = require('@elastic/elasticsearch');

const URL = `http://${ELASTIC_IP}:${ELASTIC_PORT}`;
const url = 'https://jsonplaceholder.typicode.com/todos/1';

export class elastic_connection {
  private Data: object[] = [];
  private client: any;
  private Index: string;
  private Hits: any[] = [];

  constructor(pIndex: string) {
    this.client = new Client({node: URL});
    this.Index = pIndex;
  }


  private readData(response: any) {
    response.body.hits.hits.forEach((element: any) =>
      this.Data.push({
        letter: element._source.letter,
        index: element._source.index
      }));
    this.Hits.push(response.body.hits.total);
  }

  public async getData(pSize: number, pLetter: string) {
    const params: RequestParams.Search = {
      index: this.Index,
      body: {
        size: pSize,
        query: {
          match: {
            "letter": pLetter
          }
        }
      }
    };
    return await this.client.search(params)
      .then((response: ApiResponse) => {
        this.readData(response);
      }, (err: Error) => console.trace(err.message));

  }

  public getInfo(): any[] {
    return [this.Data, this.Hits];
  }

  public async bulkData(info: any[]) {
    await Promise.all([
      this.sendData(info.slice(0, info.length / 3)),
      this.sendData(info.slice(info.length / 3, info.length / 3 * 2)),
      this.sendData(info.slice(info.length/ 3 * 2, info.length)),
    ])
  }

  public async sendData(info: any[]) {
    let bodyData = [];
    for (const data of info) {
      bodyData.push({index: {_index: this.Index}});
      bodyData.push(data);
    }
    const params = {
      index: this.Index,
      refresh: true,
      type: 1,
      body: bodyData
    };
    return await this.client.bulk(params);
  }

  public deleteData() {
    this.Data = [];
    this.Hits = [];
    this.client.indices.delete({
      index: this.Index
    }).then((resp: any) => {},
      (err: any) => console.trace(err.message));
  }
}
