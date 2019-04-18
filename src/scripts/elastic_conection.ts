import { ELASTIC_IP, ELASTIC_PORT } from './library/consts';
const { Client } = require('@elastic/elasticsearch');

const URL = `http://${ELASTIC_IP}:${ELASTIC_PORT}`;
const url = 'https://jsonplaceholder.typicode.com/todos/1';

function getData(response: object): any[] {
  const data = JSON.parse(JSON.stringify(response)).body.hits.hits;
  for (let element of data) {
    element = JSON.parse(JSON.stringify(element));
  }
  return data;
}

export async function getAll(pIndex: string) {
  const client = new Client({ node: URL });
  await client.search({
    index: pIndex,
    body: {
      query: {
        match_all: {}
      }
    }
  }).then(function (response: any) {
    const data = getData(response);
    for (const element of data) {
      console.log(element._source);
    }
  },      function (err: any) {
    console.trace(err.message);
  });
  client.close();
}

export async function sendData(info: any[], index: string) {
  const client = new Client({ node: URL });
  let bodyData = [];
  for (const data of info) {
    bodyData.push({ index: { _index: index } });
    bodyData.push(data);
  }
  await client.bulk({
    index: index,
    refresh : true,
    type: 1,
    body : bodyData
  }).then(function (resp: any) {
  }, function (err: any) {
    console.trace(err.message);
  });
  client.close();
}
