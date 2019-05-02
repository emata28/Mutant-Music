"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
// import { default as ft } from 'fourier-transform';
const WavDecoder = __importStar(require("wav-decoder"));
// import { complex as fft } from 'fft';
const WavEncoder = __importStar(require("wav-encoder"));
const Patterns_1 = require("./library/Patterns");
const sector_1 = require("./library/sector");
const sectorsS1 = ['', ''];
const sectorsS2 = ['', ''];
const infoChannels = [[], []];
const S1 = process.argv[3];
const S2 = process.argv[4];
const command = process.argv[2];
const readFile = (filepath) => {
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
        const channel1 = sector_1.getSector(audioData.channelData[0][i], audioData.channelData[0][i + 22]);
        const channel2 = sector_1.getSector(audioData.channelData[1][i], audioData.channelData[1][i + 22]);
        sectorsS2[0] = sectorsS2[0] + channel1;
        sectorsS2[1] = sectorsS2[1] + channel2;
        if (sectorsS2[0].length > 8) {
            preAnal(sectorsS2[0], infoChannels[0], count);
            preAnal(sectorsS2[1], infoChannels[1], count);
        }
        count++;
    }
    infoChannels[0] = sortChannel(infoChannels[0]);
    infoChannels[1] = sortChannel(infoChannels[1]);
    let sum = [0, 0];
    sum[0] = getSum(infoChannels[0]);
    sum[1] = getSum(infoChannels[1]);
    count = 0;
    while (count !== infoChannels[0].length) {
        infoChannels[0][count].calcPercentage(sum[0]);
        infoChannels[1][count].calcPercentage(sum[1]);
        count++;
    }
});
function getSum(pChannel) {
    let sum = 0;
    for (const pattern of pChannel) {
        sum += pattern.getPoints().length;
    }
    return sum;
}
readFile(S1).then((buffer) => {
    return WavDecoder.decode(buffer);
}).then(function (audioData) {
    for (let i = 0; i < audioData.channelData[0].length; i += 22) {
        const channel1 = sector_1.getSector(audioData.channelData[0][i], audioData.channelData[0][i + 22]);
        const channel2 = sector_1.getSector(audioData.channelData[1][i], audioData.channelData[1][i + 22]);
        sectorsS1[0] = sectorsS1[0] + channel1;
        sectorsS1[1] = sectorsS1[1] + channel2;
    }
    const indices = getMatches();
    if (command === "mt") {
        const channel1 = match(audioData, indices, 0);
        const channel2 = match(audioData, indices, 1);
        createFile(channel1, channel2, "$S1_mt.wav");
    }
    else if (command === "umt") {
        const channel1 = unMatch(audioData, indices, 0);
        const channel2 = unMatch(audioData, indices, 1);
        createFile(channel1, channel2, "$S1_umt.wav");
    }
});
function sortChannel(pChannel) {
    return pChannel.sort((a, b) => (a.getPoints().length < b.getPoints().length) ? 1 : -1).slice(0, 8);
}
function preAnal(pCHString, infoCH, count) {
    //console.log("Use Lube for PreAnal");
    let temp1 = '';
    let tempPat;
    for (let e = 1; e < 7; e++) {
        temp1 += pCHString[pCHString.length - e];
    }
    tempPat = infoCH.find(obj => obj.getPattern() === temp1);
    if (tempPat === undefined) {
        tempPat = new Patterns_1.Pattern(temp1);
        tempPat.addPoint(count);
        infoCH.push(tempPat);
    }
    else {
        tempPat.addPoint(count);
    }
}
function compareSegment(pCompar, pS1Segment, pPercentages) {
    let count = 0;
    let rPoint;
    let tempString = '';
    let pointsToCompare = pCompar;
    let index = 0;
    const pPatterFound = [];
    const pCountFound = [];
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
        pCountFound[count] = (pCountFound[count]) * 100 / sum;
        count++;
    }
    count = 0;
    let trues = 0;
    let falses = 0;
    while (count !== pPatterFound.length) {
        if (pCountFound[count] > pPercentages[count].getPercentage() - 3
            && pCountFound[count] < pPercentages[count].getPercentage() + 3) {
            trues++;
        }
        else {
            falses++;
        }
        count++;
    }
    return (trues) * 100 / (trues + falses);
}
function getMatches() {
    const indices = [];
    for (let i = 0; i < sectorsS1[0].length; i += Math.floor(sectorsS2[0].length / 32)) {
        const percentage1 = compareSegment(sectorsS2[0].length / 2, sectorsS1[0]
            .slice(i, i + sectorsS2[0].length), infoChannels[0]);
        const percentage2 = compareSegment(sectorsS2[0].length / 2, sectorsS1[1]
            .slice(i, i + sectorsS2[0].length), infoChannels[1]);
        if (percentage1 >= 70 && percentage2 >= 70) {
            //console.log("Daar se la come");
            indices.push(i * 22);
            i += sectorsS2[0].length;
        }
    }
    return indices;
}
function match(audioData, indices, pChannel) {
    let audio = new Float32Array(indices.length * sectorsS2[pChannel].length * 22);
    let newAudioIndex = 0;
    for (const index of indices) {
        for (let i = index; i <= index + sectorsS2[pChannel].length * 22; i++) {
            audio[newAudioIndex++] = audioData.channelData[pChannel][i];
        }
    }
    return audio;
}
function unMatch(audioData, indices, pChannel) {
    let l1 = sectorsS1[pChannel].length * 22;
    let l2 = sectorsS2[pChannel].length * 22 * indices.length;
    let audio = new Float32Array(l1 - l2);
    let newAudioIndex = 0;
    let i = 0;
    for (const index of indices) {
        for (; i < index; i++) {
            audio[newAudioIndex++] = audioData.channelData[pChannel][i];
        }
        i += sectorsS2[pChannel].length * 22;
    }
    return audio;
}
function createFile(pChannel1, pChannel2, pName) {
    const newAudio = {
        sampleRate: 44100,
        numberOfChannels: 2,
        channelData: [
            pChannel1,
            pChannel2,
        ]
    };
    WavEncoder.encode(newAudio).then((buffer) => {
        fs.writeFileSync(pName, Buffer.from(buffer));
    });
}
//# sourceMappingURL=Main.js.map