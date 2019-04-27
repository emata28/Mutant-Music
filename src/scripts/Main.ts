import * as fs from 'fs';
// import { complex as fft } from 'fft';
import * as WavEncoder from 'wav-encoder';
// import { default as ft } from 'fourier-transform';
import * as WavDecoder from 'wav-decoder';
import { getSector } from './library/sector';
let SectorsS1 : String[] = ["",""];
let SectorsS2 : String[] = ["",""];

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
}).then(function(audioData) {


    let channel1 ="";
    let channel2 ="";
    for(var i=0; i<audioData.channelData[0].length; i+=22) {

        channel1= getSector(audioData.channelData[0][i]-audioData.channelData[0][i+22]);
        channel2=getSector(audioData.channelData[1][i]-audioData.channelData[1][i+22]);

        SectorsS2[0]=SectorsS2[0]+" "+channel1;
        SectorsS2[1]=SectorsS2[1]+" "+channel2;


    }



});


readFile(S1).then((buffer) => {
    return WavDecoder.decode(buffer);
}).then(function(audioData) {


    let channel1 ="";
    let channel2 ="";
    for(var i=0; i<audioData.channelData[0].length; i+=22) {

        channel1= getSector(audioData.channelData[0][i]-audioData.channelData[0][i+22]);
        channel2=getSector(audioData.channelData[1][i]-audioData.channelData[1][i+22]);

        SectorsS1[0]=SectorsS1[0]+" "+channel1;
        SectorsS1[1]=SectorsS1[1]+" "+channel2;


    }
    console.log("S2");
    console.log(SectorsS2[0].length);
    console.log("S1");
    console.log(SectorsS1[0].length);


});

