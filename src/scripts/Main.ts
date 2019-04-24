import * as fs from 'fs';
// import { complex as fft } from 'fft';
import * as WavEncoder from 'wav-encoder';
// import { default as ft } from 'fourier-transform';
import * as WavDecoder from 'wav-decoder';
import { getSector } from './library/sector';
let SectorsS1 : String[][] = [[],[]];
let SectorsS2 : String[][] = [[],[]];

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

readFile(S1).then((buffer) => {
    return WavDecoder.decode(buffer);
}).then(function(audioData) {
    const size = 20000;
    let tempLast1 = "";
    let tempLast2 = "";
    let count =0;
    let tempNew1 = "";
    let tempNew2 = "";
    let channel1 ="";
    let channel2 ="";
    for(var i=0; i<audioData.channelData[0].length; i+=44) {
        tempLast1 = "";
        tempLast2 = "";
        for(var a=i; a<44+i; a+=4){
            tempNew1= getSector(audioData.channelData[0][a]);
            tempNew2=getSector(audioData.channelData[1][a]);
            if(tempLast1!=tempNew1){
                channel1+=tempNew1;

            }
            if(tempLast2!=tempNew2){
                channel2+=tempNew2;

            }
            tempLast1=tempNew1;
            tempLast2=tempNew2;

        }
        SectorsS1[0].push(channel1);
        SectorsS1[1].push(channel2);
        channel1 ="";
        channel2 ="";
        count++;

    }
    console.log("S1");
    console.log(SectorsS1[0].length);


});

readFile(S2).then((buffer) => {
    return WavDecoder.decode(buffer);
}).then(function(audioData) {
    const size = 20000;
    let tempLast1 = "";
    let tempLast2 = "";
    let count =0;
    let tempNew1 = "";
    let tempNew2 = "";
    let channel1 ="";
    let channel2 ="";

    for(var i=0; i<audioData.channelData[0].length; i+=44) {
        tempLast1 = "";
        tempLast2 = "";
        for(var a=i; a<44+i; a+=4){
            tempNew1= getSector(audioData.channelData[0][a]);
            tempNew2=getSector(audioData.channelData[1][a]);
            if(tempLast1!=tempNew1){
                channel1+=tempNew1;

            }
            if(tempLast2!=tempNew2){
                channel2+=tempNew2;

            }
            tempLast1=tempNew1;
            tempLast2=tempNew2;

        }
        SectorsS2[0].push(channel1);
        SectorsS2[1].push(channel2);
        channel1 ="";
        channel2 ="";
        count++;

    }
    console.log("S2");
    console.log(SectorsS2[0].length);


});


