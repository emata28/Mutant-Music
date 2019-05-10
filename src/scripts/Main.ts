import * as fs from 'fs';
// import { default as ft } from 'fourier-transform';
import * as WavDecoder from 'wav-decoder';
// import { complex as fft } from 'fft';
import * as WavEncoder from 'wav-encoder';
import { Pattern } from './library/Patterns';
import {PATTERN_SIZE, BIT_RATE, LATTER_RATE, BITS, S2_MULTIPLIER, AMOUNT_OF_SONGS} from './library/consts';
import { getSector } from './library/sector';
import { elastic_connection } from "./elastic_conection";
import { Song } from "./library/song"

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
if (command === "mt" || command === "umt" || command === "cmp") {
  let rate = LATTER_RATE;
  if("cmp"){
    rate= rate*2;
  }
  readFile(S2).then((buffer) => {
    return WavDecoder.decode(buffer);
  }).then(function (audioData) {
    let count = 0;
    for (let i = 0; i < audioData.channelData[0].length; i += rate) {
      const channel1 = getSector(audioData.channelData[0][i], audioData.channelData[0][i + rate]);
      const channel2 = getSector(audioData.channelData[1][i], audioData.channelData[1][i + rate]);
      sectorsS2[0] = sectorsS2[0] + channel1;
      sectorsS2[1] = sectorsS2[1] + channel2;
      if ((command === "mt"||command === "umt"||command) && sectorsS2[0].length > PATTERN_SIZE) {
        preAnal(sectorsS2[0], infoChannels[0], count);
        preAnal(sectorsS2[1], infoChannels[1], count);
      }
      count++;
    }
    getForm(sectorsS2[0]);
    infoChannels[0] = sortChannel(infoChannels[0]);
    infoChannels[1] = sortChannel(infoChannels[1]);
    let sum: number[] = [0, 0];
    sum[0] = getSum(infoChannels[0]);
    sum[1] = getSum(infoChannels[1]);
    count = 0;
    while (count !== infoChannels[0].length) {
      infoChannels[0][count].calcPercentage(sum[0]);
      infoChannels[1][count].calcPercentage(sum[1]);
      count++;
    }
    if (command === "cmp") {
      sectorsS2[0]=getForm(sectorsS2[0]);
      sectorsS2[1]=getForm(sectorsS2[1]);
    }
  });
}
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
  let count = 0;
  const relevantPointsNameCH1: string[] = [];
  const relevantPointsIndex: number[] = [];
  const relevantPointsNameCH2: string[] = [];
  if(command=="mt"||command == "umt"){

    FillRelevant(relevantPointsNameCH1, 0);
    FillRelevant(relevantPointsNameCH2, 1);

  }

  for (let i = 0; i < audioData.channelData[0].length; i += LATTER_RATE) {
    const channel1 = getSector(audioData.channelData[0][i], audioData.channelData[0][i + LATTER_RATE]);
    const channel2 = getSector(audioData.channelData[1][i], audioData.channelData[1][i + LATTER_RATE]);
    sectorsS1[0] = sectorsS1[0] + channel1;
    sectorsS1[1] = sectorsS1[1] + channel2;
    if ((command === "mt" || command === "umt" ) && sectorsS2[0].length > 4) {
      preAnalS1(sectorsS1[0], relevantPointsNameCH1, relevantPointsIndex, count);
      preAnalS1(sectorsS1[0], relevantPointsNameCH2, relevantPointsIndex, count);
    }
    count++;


  }


  if (command === "mt") {
    let infoS1Ch1: any[][] = [];
    const indices = getMatches(relevantPointsIndex);
    const channel1 = match(audioData, indices, 0);
    const channel2 = match(audioData, indices, 1);
    createFile(channel1, channel2, "$S1_mt.wav")
  } else if (command === "umt") {


    const indices = getMatches(relevantPointsIndex);
    const channel1 = unMatch(audioData, indices, 0);
    const channel2 = unMatch(audioData, indices, 1);
    createFile(channel1, channel2, "$S1_umt.wav")
  } else if (command === "dj") {
    const size = Math.round(BIT_RATE / LATTER_RATE * (Math.random() + 1) / 3);
    const a = djAnalisis(0, size);
    const b = djAnalisis(1, size);
    const newSong = dj(audioData, [a, b]);
    createFile(newSong[0], newSong[1], "$dj.wav");
  } else if (command === "cmp") {
    sectorsS1[0] = getForm(sectorsS1[0]);
    sectorsS1[1] = getForm(sectorsS1[1]);
    //const result = compose(audioData);
    //createFile(result[0], result[1], "$cmp.wav");
    Promise.resolve(compose(audioData))
      .then((result: Float32Array[]) => createFile(result[0], result[1], "$cmp.wav"));
  }
});

function djAnalisis(channel: number, size: number) {
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
  let cont = 0;
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
  let sum = 0;
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
      sum++;
    }
  }


  count = 0;
  while (count !== pCountFound.length) {
    pCountFound[count] = sum != 0 ? (pCountFound[count]) * 100 / sum : 0;
    count++;
  }
  count = 0;
  let trues = 0;
  let falses = 0;
  while (count !== pPatterFound.length) {
    if (pCountFound[count] > pPercentages[count].getPercentage() - 3
      && pCountFound[count] < pPercentages[count].getPercentage() + 3) {
      trues++;
      console.log(true)
    } else {
      falses++;
      console.log(false)
    }
    count++;
  }
  return (trues) * 100 / (trues + falses);

}

function FillRelevant(relevantPointsName: string[], channel: number) {
  let sum = 0;
  for (const pattern of infoChannels[channel]) {
    relevantPointsName.push(pattern.getPattern().slice(0, 4));

  }
}

function preAnalS1(pCHString: string, relevantPointsName: string[], relevantPointsIndex: number[], count: number) {
  let temp1 = "";
  let tempPat;
  for (let e = 1; e < 5; e++) {
    temp1 += pCHString[pCHString.length - e];
  }
  tempPat = relevantPointsName.indexOf(temp1);
  let com = Math.floor(sectorsS2[0].length )+relevantPointsIndex[relevantPointsIndex.length-1];
  if (tempPat != -1) {
    if( (Math.floor(sectorsS2[0].length/3)+relevantPointsIndex[relevantPointsIndex.length-1]<count || relevantPointsIndex.length==0))
      relevantPointsIndex.push(count);
  }
}

function getMatches(relevantPointsIndex:number[]): number[] {
  const indices: number[] = [];
  for (let i of relevantPointsIndex) {

    const percentage1 = compareSegment(sectorsS2[0].length / 1.5, sectorsS1[0]
      .slice(i, i + sectorsS2[0].length), infoChannels[0]);
    const percentage2 = compareSegment(sectorsS2[0].length / 1.5, sectorsS1[1]
      .slice(i, i + sectorsS2[0].length), infoChannels[1]);
    if (percentage1 >= 70 && percentage2 >= 70) {
      indices.push(i * LATTER_RATE);
    }
  }
  return indices;
}

function match(audioData: any, indices: number[], pChannel: number): Float32Array {
  let audio: Float32Array = new Float32Array(indices.length * sectorsS2[pChannel].length * LATTER_RATE);
  let newAudioIndex = 0;
  for (const index of indices) {
    for (let i = index; i <= index + sectorsS2[pChannel].length * LATTER_RATE; i++) {
      audio[newAudioIndex++] = audioData.channelData[pChannel][i];
    }
  }
  return audio;
}
function dj(audioData: any, sectors: any[]): Float32Array[] {
  const length = BIT_RATE * 60 * (Math.random() + 1);
  const exit: Float32Array[] = [new Float32Array(length), new Float32Array(length)];
  let exitIndex = 0;
  while (exitIndex < length) {
    const effect = Math.round(Math.random() * 2);
    const index = Math.round(Math.random() * (sectors[0].length - 1));
    const data: number[][] = [[],[]];
    for (let side = 0; side < 2; side++) {
      let sectorIndex = sectors[side][index].index * LATTER_RATE *3;
      const sectorSize = sectorIndex + sectors[side][index].sector.length * LATTER_RATE *3;
      while (sectorIndex < sectorSize) {
        data[side].push(audioData.channelData[side][sectorIndex]);
        sectorIndex++;
      }
    }
    let newData = [];
    if (effect === 2) {
      const effectLength = (Math.random() * 3 + 4) * BIT_RATE;
      newData = makeLoop(data, effectLength);
    } else if (effect === 1) {
      const effectLength = 4 * BIT_RATE;
      newData = makeLeftToRight(data, effectLength);

    } else {
      const effectLength = (Math.random() * 4 + 6) * BIT_RATE;
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
  let l1 = sectorsS1[pChannel].length * LATTER_RATE;
  let l2 = sectorsS2[pChannel].length * LATTER_RATE * indices.length;
  let audio: Float32Array = new Float32Array(l1 - l2);
  let newAudioIndex = 0;
  let i = 0;
  if (indices.length == 0) {
    audio = audioData.channelData[pChannel];
  } else {
    for (const index of indices) {
      for (; i < index; i++) {
        audio[newAudioIndex++] = audioData.channelData[pChannel][i];
      }
      i += sectorsS2[pChannel].length * LATTER_RATE
    }
  }

  return audio;
}

async function compose(audioData: any) {
  const rangesS1 = [ranges(sectorsS1[0]), ranges(sectorsS1[1])];
  const rangesS2 = [ranges(sectorsS2[0]), ranges(sectorsS2[1])];
  const elastic = new elastic_connection();
  const newLength = sectorsS2[0].length * S2_MULTIPLIER;
  let left: any[] = [];
  let right: any[] = [];
  const result:Float32Array[] = [];
  let gen = 0;
  let songs = getInitialSongs(rangesS1, AMOUNT_OF_SONGS, newLength);
  //await Promise.all([elastic.createIndex("left"), elastic.createIndex("right")]);
  do {
    const Queries = getElasticQueries([rangesS2[0][0],rangesS2[1][0]],[rangesS2[0][3],rangesS2[1][3]], songs, gen);
    /*await Promise.all([
      elastic.deleteData("left")
    ]);*/
    await Promise.all([elastic.sendData(Queries)]);

    await Promise.all([elastic.getData(`left`),
      elastic.getData(`right`)] //${gen}
    );
    //gen++;
    left = elastic.getInfo(0);
    right = elastic.getInfo(1);
    let newSongs: Song[] = [];
    //console.log(left.length, right.length);
    if( left.length < 5 || right.length < 5) {
      console.log("vacio")
    }
    for (let song = 0; newSongs.length < AMOUNT_OF_SONGS; song++) {
      if (song < left.length) {
        newSongs.push(songs[song]);
      } else {
        const rand1 = Math.round(Math.random() * (left.length - 1));
        const rand2 = Math.round(Math.random() * (right.length - 1));
        if(left[rand1].score > right[rand2].score) {
          newSongs.push(cruce(songs[left[rand1].index], songs[right[rand2].index], rangesS1));
        } else {
          newSongs.push(cruce(songs[right[rand2].index], songs[left[rand1].index], rangesS1));
        }

      }
    }
    songs = newSongs;
    console.log(left[0].score, right[0].score);
    //await Promise.all([elastic.deleteData("left"), elastic.deleteData("right")]);
  } while (left[0].score != 1 || right[0].score != 1);
  /*result.push(new Float32Array(left.length * 22 * 3));
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
  });*/
  return result;
}
/*
CANCION PARA COMPOSE
 */

function cruce(pSong1: Song, pSong2: Song, ranges: any[]) {
  const son: Song = new Song();
  for (let channel = 0; channel < 2; channel++) {
    const crossLength = Math.random() * pSong1.getChannel(channel).length;
    const ChosenSong = Math.round(Math.random());
    //son.getChannel(channel)=pSong1.getChannel(channel).slice(0,crossLength);
    for (let index = 0; index < pSong1.getChannel(channel).length; index++) {
      const rand = Math.random() * 100;
      //console.log(pSong1.getChannel(channel)[index], pSong2.getChannel(channel)[index]);
      if (rand >= 40) {
        son.addToChannel(channel, pSong1.getChannel(channel)[index]);
      } else if (rand >= 7) {
        son.addToChannel(channel, pSong2.getChannel(channel)[index]);

      } else if (rand < 7) {
        const newLetter = getLetter(ranges, channel);
        son.addToChannel(channel, {letter: newLetter[0], index: newLetter[1]})
      }
      /*
      if(index < crossLength) {

      } else {
        if (ChosenSong) {
          son.addToChannel(channel, pSong2.getChannel(channel)[index])
        } else {
          son.addToChannel(channel, pSong1.getChannel(channel)[index])
        }
      }*/
    }
  }
  return son;
}

function getElasticQueries(pLetters: string[][], pCants: any[][], pSongs: Song[], pGen: number): any[] {
  let Query: any[] = [];
  let id = 0;
  for (let song = 0; song < pSongs.length; song++) {
    const songScores = pSongs[song].getJson(pLetters, pCants);
    //console.log(songScores)
    Query.push({index:{_index:"left",_id:id++}});
    const data = {
      index: song,
      score: songScores[0]
    };
    Query.push(data);
    Query.push({index:{_index:"right",_id:id++}});
    const data2 = {
      index: song,
      score: songScores[1]
    };
    Query.push(data2);
  }
  return Query;
}

function getInitialSongs(ranges: any[], amountOfSongs: number, sizePerSong: number): Song[] {
  const songs: Song[] = [];
  for (let song = 0; song < amountOfSongs; song++) {
    songs.push(generateSong(ranges, sizePerSong));
  }
  return songs;
}

function generateSong(ranges: any[], size: number): Song {
  let song: Song = new Song();
  for (let channel = 0; channel < 2; channel++) {
    for (let index = 0; index < size; index++) {
      const newLetter = getLetter(ranges, 1);
      song.addToChannel(channel, {letter: newLetter[0], index: newLetter[1]});
    }
  }
  song.sortSong();
  return song;
}
/*


COMPOSE


 */
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
    if(ranges[channel][2][index][0] <= rand && ranges[channel][2][index][1] >= rand) {
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

function createFile(pChannel1: Float32Array, pChannel2: Float32Array, pName: string) {
  const newAudio = {
    sampleRate: BIT_RATE,
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
    RangesFound.push([lastFound, lastFound + 1 + newRange]);
    lastFound += newRange;
  }
  let Result : any[][]=[];
  Result.push(LetterFound);
  Result.push(CountFound);
  Result.push(RangesFound);
  Result.push(Letters);
  return Result;
}
