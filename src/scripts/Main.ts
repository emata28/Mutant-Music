import * as fs from 'fs';
// import { default as ft } from 'fourier-transform';
import * as WavDecoder from 'wav-decoder';
// import { complex as fft } from 'fft';
import * as WavEncoder from 'wav-encoder';
import { Pattern } from './library/Patterns';
import { PATTERN_SIZE} from './library/consts';

import { getSector } from './library/sector';

const sectorsS1: string[] = ['', ''];
const sectorsS2: string[] = ['', ''];
const infoChannels: Pattern[][] = [[],[]];
const S1: string = process.argv[3];
const S2: string = process.argv[4];
const command: string = process.argv[2];

const readFile = (filepath: string) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer);
    });
  });
};

readFile(S2).then((buffer) => {
  return WavDecoder.decode(buffer);
}).then(function (audioData) {
  let count = 0;
  for (let i = 0; i < audioData.channelData[0].length; i += 22) {
    const channel1 = getSector(audioData.channelData[0][i], audioData.channelData[0][i + 22]);
    const channel2 = getSector(audioData.channelData[1][i], audioData.channelData[1][i + 22]);
    sectorsS2[0] = sectorsS2[0] + channel1;
    sectorsS2[1] = sectorsS2[1] + channel2;
    if (sectorsS2[0].length > PATTERN_SIZE) {
      preAnal(sectorsS2[0], infoChannels[0], count);
      preAnal(sectorsS2[1], infoChannels[1], count);
    }
    count++;
  }
  getForm(sectorsS2[0])
  console.log(sectorsS2[0])
  infoChannels[0] = sortChannel(infoChannels[0]);
  infoChannels[1] = sortChannel(infoChannels[1]);
  let sum: number[] = [0,0];
  sum[0] = getSum(infoChannels[0]);
  sum[1] = getSum(infoChannels[1]);


  count = 0;
  //console.log(infoChannels)

  while (count !== infoChannels[0].length) {
    infoChannels[0][count].calcPercentage(sum[0]);
    infoChannels[1][count].calcPercentage(sum[1]);
    count++;
  }
});
function getSum(pChannel: Pattern[]): number {
  let sum = 0;
  for (const pattern of pChannel) {
    sum += pattern.getPoints().length
  }
  return sum;
}

readFile(S1).then((buffer) => {
  return WavDecoder.decode(buffer);
}).then(function (audioData) {
  for (let i = 0; i < audioData.channelData[0].length; i += 22) {
    const channel1 = getSector(audioData.channelData[0][i], audioData.channelData[0][i + 22]);
    const channel2 = getSector(audioData.channelData[1][i], audioData.channelData[1][i + 22]);
    sectorsS1[0] = sectorsS1[0] + channel1;
    sectorsS1[1] = sectorsS1[1] + channel2;
  }
  if (command === "mt") {
    const indices = getMatches();
    const channel1 = match(audioData, indices, 0);
    const channel2 = match(audioData, indices, 1);
    createFile(channel1, channel2, "$S1_mt.wav")
  } else if (command === "umt") {
    const indices = getMatches();
    const channel1 = unMatch(audioData, indices, 0);
    const channel2 = unMatch(audioData, indices, 1);
    createFile(channel1, channel2, "$S1_umt.wav")
  } else if (command === "dj") {
    const size = Math.round(44100/22 * (Math.random() + 1) / 3);
    const a = loquesea(0,size);
    //console.log(a.length);
    const b = loquesea(1, size);
    //console.log(b.length);
    const newSong = dj(audioData, [a,b]);
    createFile(newSong[0], newSong[1], "$dj.wav");

  }
});

function loquesea(channel: number, size: number) {
  let segmentsOno: any[] = [];
  const str: string = getForm(sectorsS1[channel]);
  for (let compared = 0; compared < 210; compared++) {
    const index = Math.round(Math.random() * str.length);
    let segmentOno = '';
    for (let letter = index; letter < index + size; letter++) {
      segmentOno += str[letter];
    }
    if(segmentOno[0] != 'F' && segmentOno[segmentOno.length - 1] != 'F') {
      const foundIndex = segmentsOno.findIndex((segment) => comp(segment.sector, segmentOno) > 0.7);
      if(foundIndex != -1){
        segmentsOno[foundIndex].cant++;
      } else {
        segmentsOno.push({sector: segmentOno, cant: 1, index: index});
      }
    } else {
      compared--;
    }
  }
  segmentsOno.sort((a, b) => (a.cant < b.cant) ? 1 : -1);
  return segmentsOno.slice(0, 10);
}
function comp(a: any , b: string) {
  let equal = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      equal++;
    }
  }
  return equal/a.length;
}
function makeLoop(segment: number[][], length: number) {
  let exit: number[][] = [[],[]];
  while (exit[0].length < length) {
    for (let i = 0; i < segment[0].length; i++) {
      exit[0].push(segment[0][i]);
      exit[1].push(segment[0][i]);
    }
  }
  return exit;
}
function makeLeftToRight(segment:number[][], length: number) {
  let exit: number[][] = [[],[]];
  while (exit[0].length < length) {
    const side = Math.round(Math.random() * 2);
    for (let i = 0; i < segment[0].length; i++) {
      if (side === 2) {
        exit[0].push(segment[0][i]);
        exit[1].push(segment[1][i]);
      } else if (side === 1) {
        exit[0].push(segment[0][i]);
        exit[1].push(0);
      } else {
        exit[0].push(0);
        exit[1].push(segment[1][i]);
      }
    }
  }
  return exit;
}

function makeSoundAndSilence(segment:number[][], length: number) {
  let exit: number[][] = [[],[]];
  while (exit[0].length < length) {
    const silence = Math.random();
    for (let i = 0; i < segment[0].length; i++) {
      if(silence < 0.3) {
        exit[0].push(0);
        exit[1].push(0);
      } else {
        exit[0].push(segment[0][i]);
        exit[1].push(segment[1][i]);
      }
    }
  }
  return exit;
}
function sortChannel(pChannel: Pattern[]):Pattern[] {
  return pChannel.sort((a, b) => (a.getPoints().length < b.getPoints().length) ? 1 : -1).slice(0, 8);
}


function preAnal(pCHString: string, infoCH: Pattern[], count: number) {
  let temp1 = '';
  let tempPat;
  for (let e = 1; e < PATTERN_SIZE; e++) {
    temp1 += pCHString[pCHString.length - e];
  }
  tempPat = infoCH.find(obj => obj.getPattern()=== temp1);

  if (tempPat === undefined) {

    tempPat = new Pattern(temp1);
    tempPat.addPoint(count);
    infoCH.push(tempPat);
  } else {
    tempPat.addPoint(count);

  }
}

function getForm( pSector: string):string{
  let temp:string = "";
  let cont = 0
  let result="";
  while(cont!=pSector.length){
    temp+=pSector[cont];
    if(temp.length==3){
      if(temp.search("BS" )!=-1||temp=="PSP"||temp.search("SB" )!=-1){
        result+="P";
      }else if(temp.search("SP" )!=-1 ||temp.search("PS" )!=-1 ){
        result+="M";
      }else if(temp.search("BP" )!=-1 ||temp.search("PB" )!=-1){
        result+="V";
      }else if(temp=="PPP"){
        result+="L";
      }else if(temp=="SSS"){
        result+="S";
      }else if(temp=="BBB"){
        result+="B";
      }else if(temp.search("F")!=-1){
        result+="F";

      }
      temp="";
    }
    cont++;
  }
  return result;
}

function compareSegment(pCompar: number, pS1Segment: string, pPercentages: Pattern[]): number {
  let count = 0;
  let rPoint;
  let tempString: string = '';
  let pointsToCompare = pCompar;
  let index = 0;
  const pPatterFound: string[] = [];
  const pCountFound: number[] = [];

  for (const pattern of pPercentages) {
    pPatterFound.push(pattern.getPattern());
    pCountFound.push(0);
  }

  while (pointsToCompare >= 0) {
    rPoint = Math.floor(Math.random() * pS1Segment.length);
    pointsToCompare--;
    tempString = '';
    count = 0;
    while (count !== pPercentages[0].getPattern().length) {
      tempString = tempString + pS1Segment[rPoint + count];

      count++;
    }
    index = pPatterFound.indexOf(tempString);
    if (index !== -1) {
      pCountFound[index] = pCountFound[index] + 1;
    }
  }

  count = 0;
  let sum = 0;
  while (count !== pCountFound.length) {
    sum = sum + pCountFound[count];
    count++;
  }

  count = 0;
  while (count !== pCountFound.length) {
    pCountFound[count] = sum != 0 ? (pCountFound[count]) * 100 / sum : 0;
    count++;
  }

  count = 0;
  let trues = 0;
  let falses = 0;
  //console.log(" ")
  while (count !== pPatterFound.length) {
    //console.log(pCountFound[count]," ",pPercentages[count].getPercentage());

    if (pCountFound[count] > pPercentages[count].getPercentage() - 3
      && pCountFound[count] < pPercentages[count].getPercentage() + 3) {
      //console.log("true")
      trues++;
    } else {
      //console.log("false")
      falses++;
    }
    count++;
  }
  return (trues) * 100 / (trues + falses);

}
function getMatches(): number[] {
  const indices: number[] = [] ;
  for (let i = 0; i < sectorsS1[0].length - 1; i += Math.floor(sectorsS2[0].length / 32)) {
    const percentage1 = compareSegment(sectorsS2[0].length / 1.5, sectorsS1[0]
      .slice(i, i + sectorsS2[0].length), infoChannels[0]);
    const percentage2 = compareSegment(sectorsS2[0].length / 1.5, sectorsS1[1]
      .slice(i, i + sectorsS2[0].length), infoChannels[1]);
    if (percentage1 >= 70 && percentage2 >= 70) {
      //console.log("Daar se la come");
      indices.push(i * 22);
      i += sectorsS2[0].length;
    }
  }
  return indices;
}

function match(audioData:any, indices:number[], pChannel: number): Float32Array {
  let audio: Float32Array = new Float32Array(indices.length * sectorsS2[pChannel].length * 22);
  let newAudioIndex = 0;
  for (const index of indices) {
    for (let i = index; i <= index + sectorsS2[pChannel].length * 22; i++) {
      audio[newAudioIndex++] = audioData.channelData[pChannel][i];
    }
  }
  return audio;
}
function dj(audioData: any, sectors: any[]): Float32Array[] {
  const length = 44100 * 60 * (Math.random() + 1);
  const exit: Float32Array[] = [new Float32Array(length), new Float32Array(length)];
  let exitIndex = 0;
  while (exitIndex < length) {
    //console.log(exit[0].length);
    const effect = Math.round(Math.random() * 2);
    const index = Math.round(Math.random() * (sectors[0].length - 1));
    const data: number[][] = [[],[]];
    for (let side = 0; side < 2; side++) {
      let sectorIndex = sectors[side][index].index * 66;
      const sectorSize = sectorIndex + sectors[side][index].sector.length * 66;
      while (sectorIndex < sectorSize) {
        data[side].push(audioData.channelData[side][sectorIndex]);
        sectorIndex++;
      }
    }
    let newData = [];
    if (effect === 2) {
      const effectLength = (Math.random() * 3 + 4) * 44100;
      newData = makeLoop(data, effectLength);
    } else if (effect === 1) {
      const effectLength = 4 * 44100;
      newData = makeLeftToRight(data, effectLength);

    } else {
      const effectLength = (Math.random() * 4 + 6) * 44100;
      newData = makeSoundAndSilence(data, effectLength);
    }
    for(let i = 0; i < newData[0].length; i++) {
      exit[0][exitIndex] = newData[0][i];
      exit[1][exitIndex++] = newData[1][i];
    }
  }
  return exit;
}
function unMatch(audioData: any, indices: number[], pChannel: number): Float32Array {
  let l1 = sectorsS1[pChannel].length * 22;
  let l2 = sectorsS2[pChannel].length * 22 * indices.length;
  let audio: Float32Array = new Float32Array(l1 - l2);
  let newAudioIndex = 0;
  let i = 0;
  for (const index of indices) {
    for (; i < index ; i++) {
      audio[newAudioIndex++] = audioData.channelData[pChannel][i];
    }
    i += sectorsS2[pChannel].length*22
  }
  return audio;
}
function createFile(pChannel1: Float32Array, pChannel2: Float32Array, pName: string) {
  const newAudio = {
    sampleRate: 44100,
    numberOfChannels: 2,
    channelData: [
      pChannel1,
      pChannel2,
    ]
  };
  WavEncoder.encode(newAudio).then((buffer: any) => {
    fs.writeFileSync(pName, Buffer.from(buffer));
  });
}
