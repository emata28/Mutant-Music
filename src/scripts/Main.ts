import * as fs from 'fs';
// import { complex as fft } from 'fft';
import * as WavEncoder from 'wav-encoder';
// import { default as ft } from 'fourier-transform';
import * as WavDecoder from 'wav-decoder';
import {Pattern} from './library/Patterns';

import {getSector} from './library/sector';
import Patterns from "../../build/library/Patterns";

let SectorsS1: String[] = ["", ""];
let SectorsS2: String[] = ["", ""];
let infoCH1: Pattern[] = [];
let infoCH2: Pattern[] = [];
let S1: string = process.argv[3];
let S2: string = process.argv[4];
let command: string = process.argv[2];


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

  let index = 0;
  let count = 0;
  let channel1 = "";
  let channel2 = "";
  for (let i = 0; i < audioData.channelData[0].length; i += 22) {

    channel1 = getSector(audioData.channelData[0][i], audioData.channelData[0][i + 22]);
    channel2 = getSector(audioData.channelData[1][i], audioData.channelData[1][i + 22]);

    SectorsS2[0] = SectorsS2[0] + channel1;
    SectorsS2[1] = SectorsS2[1] + channel2;
    if (SectorsS2[0].length > 8) {
      preAnal(SectorsS2[0], infoCH1, count);
      preAnal(SectorsS2[1], infoCH2, count);

    }


    count++;
  }
  infoCH1 = infoCH1.sort((a, b) => (a.points.length < b.points.length) ? 1 : -1).slice(0, 8);
  count = 0;
  let sum = 0;
  while (count != infoCH1.length) {
    sum = sum + infoCH1[count].points.length;
    count++;
  }

  count = 0;
  while (count != infoCH1.length) {
    infoCH1[count].calcPorcentage(sum);
    count++;
  }

  console.log(infoCH1);


})


readFile(S1).then((buffer) => {
  return WavDecoder.decode(buffer);
}).then(function (audioData) {


  let channel1 = "";
  let channel2 = "";
  for (var i = 0; i < audioData.channelData[0].length; i += 22) {

    channel1 = getSector(audioData.channelData[0][i], audioData.channelData[0][i + 22]);
    channel2 = getSector(audioData.channelData[1][i], audioData.channelData[1][i + 22]);

    SectorsS1[0] = SectorsS1[0] + channel1;
    SectorsS1[1] = SectorsS1[1] + channel2;
  }
  let porcentage = compareSegement(SectorsS2[0].length / 2, SectorsS1[0].slice(0, SectorsS2[0].length), infoCH1);
  if (porcentage > 70) {

  }
});


function preAnal(pCHString: String, infoCH: Pattern[], count: number) {
  let temp1 = "";
  let tempPat;
  for (let e = 1; e < 7; e++) {
    temp1 += pCHString[pCHString.length - e];
  }
  tempPat = infoCH.find(obj => obj._pattern == temp1);

  if (tempPat == undefined) {

    tempPat = new Pattern(temp1);
    tempPat.addPoint(count);
    infoCH.push(tempPat);
  } else {
    tempPat.addPoint(count);

  }
}


function compareSegement(pCompar: number, pS1Segment: String, pPorcentages: Pattern[]): number {
  let count = 0;
  let rPoint;
  let tempString: String = "";
  let pFinded;
  let index = 0;
  let pPatterFound: String[] = [];
  let pCoundFound: number[] = [];

  for (const i in pPorcentages) {
    pPatterFound.push(pPorcentages[i]._pattern);
    pCoundFound.push(0);
  }


  while (pCompar != 0) {
    rPoint = Math.floor(Math.random() * pS1Segment.length);
    pCompar--;
    tempString = "";
    count = 0;
    while (count != pPorcentages[0]._pattern.length) {
      tempString = tempString + pS1Segment[rPoint + count];


      count++;
    }
    index = pPatterFound.indexOf(tempString);
    if (index != -1) {
      pCoundFound[index] = pCoundFound[index] + 1;


    }
  }

  count = 0;
  let sum = 0;
  while (count != pCoundFound.length) {
    sum = sum + pCoundFound[count];
    count++;
  }

  count = 0;
  while (count != pCoundFound.length) {
    pCoundFound[count] = (pCoundFound[count]) * 100 / sum;
    count++;
  }


  count = 0;
  let trues = 0;
  let falses = 0;

  while (count != pPatterFound.length) {

    if (pCoundFound[count] > pPorcentages[count].porcentage - 3 && pCoundFound[count] < pPorcentages[count].porcentage + 3) {
      trues++;
    } else {
      falses++;
    }
    count++;
  }
  return (trues) * 100 / (trues + falses);

}








