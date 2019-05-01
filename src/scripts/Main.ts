import * as fs from 'fs';
// import { default as ft } from 'fourier-transform';
import * as WavDecoder from 'wav-decoder';
// import { complex as fft } from 'fft';
import * as WavEncoder from 'wav-encoder';
import { Pattern } from './library/Patterns';

import { getSector } from './library/sector';

const sectorsS1: string[] = ['', ''];
const sectorsS2: string[] = ['', ''];
let infoCH1: Pattern[] = [];
const infoCH2: Pattern[] = [];
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
  let channel1 = '';
  let channel2 = '';
  for (let i = 0; i < audioData.channelData[0].length; i += 22) {

    channel1 = getSector(audioData.channelData[0][i], audioData.channelData[0][i + 22]);
    channel2 = getSector(audioData.channelData[1][i], audioData.channelData[1][i + 22]);

    sectorsS2[0] = sectorsS2[0] + channel1;
    sectorsS2[1] = sectorsS2[1] + channel2;
    if (sectorsS2[0].length > 8) {
      preAnal(sectorsS2[0], infoCH1, count);
      preAnal(sectorsS2[1], infoCH2, count);

    }

    count++;
  }
  infoCH1 = infoCH1.sort((a, b) => (a.getPoints().length < b.getPoints().length) ? 1 : -1)
    .slice(0, 8);
  count = 0;
  let sum = 0;
  while (count !== infoCH1.length) {
    sum = sum + infoCH1[count].getPoints().length;
    count++;
  }

  count = 0;
  while (count !== infoCH1.length) {
    infoCH1[count].calcPercentage(sum);
    count++;
  }

  console.log(infoCH1);

});

readFile(S1).then((buffer) => {
  return WavDecoder.decode(buffer);
}).then(function (audioData) {

  let channel1 = '';
  let channel2 = '';
  for (let i = 0; i < audioData.channelData[0].length; i += 22) {

    channel1 = getSector(audioData.channelData[0][i], audioData.channelData[0][i + 22]);
    channel2 = getSector(audioData.channelData[1][i], audioData.channelData[1][i + 22]);

    sectorsS1[0] = sectorsS1[0] + channel1;
    sectorsS1[1] = sectorsS1[1] + channel2;
  }
  const percentage = compareSegement(sectorsS2[0].length / 2,
                                     sectorsS1[0].slice(0, sectorsS2[0].length), infoCH1);
  if (percentage > 70) {

  }
});

function preAnal(pCHString: string, infoCH: Pattern[], count: number) {
  let temp1 = '';
  let tempPat;
  for (let e = 1; e < 7; e++) {
    temp1 += pCHString[pCHString.length - e];
  }
  tempPat = infoCH.find(obj => obj.getPattern() === temp1);

  if (tempPat === undefined) {

    tempPat = new Pattern(temp1);
    tempPat.addPoint(count);
    infoCH.push(tempPat);
  } else {
    tempPat.addPoint(count);

  }
}

function compareSegement(pCompar: number, pS1Segment: string, pPercentages: Pattern[]): number {
  let count = 0;
  let rPoint;
  let tempString: string = '';
  let pointsToCompare = pCompar;
  let index = 0;
  const pPatterFound: string[] = [];
  const pCoundFound: number[] = [];

  for (const pattern of pPercentages) {
    pPatterFound.push(pattern.getPattern());
    pCoundFound.push(0);
  }

  while (pointsToCompare !== 0) {
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
      pCoundFound[index] = pCoundFound[index] + 1;

    }
  }

  count = 0;
  let sum = 0;
  while (count !== pCoundFound.length) {
    sum = sum + pCoundFound[count];
    count++;
  }

  count = 0;
  while (count !== pCoundFound.length) {
    pCoundFound[count] = (pCoundFound[count]) * 100 / sum;
    count++;
  }

  count = 0;
  let trues = 0;
  let falses = 0;

  while (count !== pPatterFound.length) {

    if (pCoundFound[count] > pPercentages[count].getPercentage() - 3
      && pCoundFound[count] < pPercentages[count].getPercentage() + 3) {
      trues++;
    } else {
      falses++;
    }
    count++;
  }
  return (trues) * 100 / (trues + falses);

}
