/*import {elastic_connection} from "../elastic_conection";
import {BITS, S2_MULTIPLIER} from "./consts";

const sectorsS1:string[] = ["",""];
const sectorsS2 = sectorsS1;

async function compose(audioData: any) {
  const rangesS1 = [ranges(sectorsS1[0]), ranges(sectorsS1[1])];
  const rangesS2 = [ranges(sectorsS2[0]), ranges(sectorsS2[1])];
  const elasticLeft = new elastic_connection("left");
  const elasticRight = new elastic_connection("right");
  const newLength = sectorsS2[0].length * S2_MULTIPLIER;
  let left = [];
  let right = [];
  const result:Float32Array[] = [];
  let gen = 0;
  let newPercentages = [rangesS1[0][1], rangesS2[1][1]];
  do {
    console.log(`Generacion ${gen++}`);
    while (left.length < newLength) {
      let newLetter = getLetter(rangesS1, 0);
      left.push({letter: newLetter[0], index: newLetter[1]});
    }
    while (right.length < newLength) {
      let newLetter = getLetter(rangesS1, 1);
      right.push({letter: newLetter[0], index: newLetter[1]});
    }
    const start: any = Date.now();
    await elasticLeft.bulkData(left);
    await elasticRight.bulkData(right);
    const end: any = Date.now();
    console.log(end-start);
    let index  = 0;
    while (index < rangesS2[0][0].length) {
      await elasticLeft.getData( Math.round(newLength * rangesS2[0][1][index] / 100), rangesS2[0][0][index]);
      await elasticRight.getData(Math.round(newLength * rangesS2[1][1][index] / 100), rangesS2[1][0][index]);
      index++;
    }
    let a = elasticLeft.getInfo();
    let b = elasticRight.getInfo();
    left = a[0];
    right = b[0];
    newPercentages = [[],[]];
    a[1].forEach((item: number) => newPercentages[0].push(item / newLength * 100));
    b[1].forEach((item: number) => newPercentages[1].push(item / newLength * 100));
    await elasticLeft.deleteData();
    await elasticRight.deleteData();
  } while (!checkPercentages(newPercentages[0], rangesS2[0][1]) || !checkPercentages(newPercentages[1], rangesS2[1][1]));
  result.push(new Float32Array(left.length * 22 * 3));
  result.push(new Float32Array(right.length * 22 * 3));
  const sorted = sortSong([left,right]);
  let resultIndex = 0;
  sorted[0].forEach((item: any) => {
    let index = item.index * 22 * 3;
    const end = index + 22 * 3;
    while (index < end) {
      result[0][resultIndex++] = audioData.channelData[0][index++];
    }
  });
  resultIndex = 0;
  sorted[1].forEach((item: any) => {
    let index = item.index * 22 * 3;
    const end = index + 22 * 3;
    while (index < end) {
      result[1][resultIndex++] = audioData.channelData[1][index++];
    }
  });
  return result;
}
function sortSong(SongCh : any[][]){
  let newSectors2: any[][] = [[],[]];
  for (let channel= 0; channel < 2; channel++) {
    let index  = 0;
    while(index<sectorsS2[channel].length){
      const matches = SongCh[channel].filter((item) => item.letter === sectorsS2[channel][index]);
      for(let i = 0;i < S2_MULTIPLIER; i++){
        const ind = Math.round((matches.length-1) * Math.random());
        newSectors2[channel].push(matches[ind]);
      }
      index++;
    }
  }
  return newSectors2;
}
function getLetter(ranges: any[], channel: number): any[] {
  const rand = Math.round(Math.random() * Math.pow(2, BITS));
  let found = false;
  let index = 0;
  while (!found) {
    if(ranges[channel][2][index][0] <= rand && ranges[channel][2][index][1] > rand) {
      found = true;
    } else {
      index++;
    }
  }

  const newIndex = Math.round((ranges[channel][3][index].length -1) * Math.random());
  return [ranges[channel][0][index], ranges[channel][3][index][newIndex]];
}

function checkPercentages(percentages1: number[], percentages2: number[]) {
  if (percentages1.length === 0) {
    return false;
  }
  console.log(percentages1,percentages2);
  for (let i = 0; i < percentages1.length; i++) {
    const per1 = Math.round(percentages1[i]);
    const per2 = Math.round(percentages2[i]);
    if (per1 != per2) {
      return false;
    }
  }
  return true;
}

function ranges(s: string): any[] {
  const LetterFound: string[] = [];
  const CountFound: number[] = [];
  const RangesFound: number[][] = [];
  const Letters: number[][] = [];
  let lastFound = 0;
  for (let i = 0; i < s.length; i++) {
    let foundIndex = LetterFound.indexOf(s[i]);
    if (foundIndex == -1) {
      LetterFound.push(s[i]);
      CountFound.push(1);
      Letters.push([i]);
    } else {
      CountFound[foundIndex]++;
      Letters[foundIndex].push(i);

    }
  }
  for (let i = 0; i < CountFound.length; i++) {
    CountFound[i] = (CountFound[i]) *100 / s.length;
    const newRange = Math.round(CountFound[i]/100 * Math.pow(2, BITS));
    RangesFound.push([lastFound, lastFound + newRange]);
    lastFound += newRange;
  }
  let Result : any[][]=[];
  Result.push(LetterFound);
  Result.push(CountFound);
  Result.push(RangesFound);
  Result.push(Letters);
  return Result;
}

*/
/*--------------------------------------------------------------------------------------------------------------------*/

/*
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
    const client: any = new Client({node: URL});
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
    const result = await client.bulk(params);
    client.close();
    return result;
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
*/
