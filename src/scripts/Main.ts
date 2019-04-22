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

readFile(S1).then((buffer) => {
    return WavDecoder.decode(buffer);
}).then(function(audioData) {
    const size = 20000;
    let tempLast1 = "";
    let tempLast2 = "";

    let tempNew1 = "";
    let tempNew2 = "";

    for(var i=0; i<audioData.channelData[0].length; i+=44) {
        tempLast1 = "";
        tempLast2 = "";
        for(var a=i; a<44+i; a+=4){
            tempNew1= getSector(audioData.channelData[0][a]);
            tempNew2=getSector(audioData.channelData[1][a]);
            if(tempLast1!=tempNew1){
                SectorsS1[0]+=tempNew1;
            }
            if(tempLast2!=tempNew2){
                SectorsS1[1]+=tempNew2;

            }
            tempLast1=tempNew1;
            tempLast2=tempNew2;

        }

    }
    for(var i=0; i<audioData.channelData[0].length; i+=44) {
        tempLast1 = "";
        tempLast2 = "";
        for(var a=i; a<44+i; a+=4){
            tempNew1= getSector(audioData.channelData[0][a]);
            tempNew2=getSector(audioData.channelData[1][a]);
            if(tempLast1!=tempNew1){
                SectorsS1[0]+=tempNew1;
            }
            if(tempLast2!=tempNew2){
                SectorsS1[1]+=tempNew2;

            }
            tempLast1=tempNew1;
            tempLast2=tempNew2;

        }

    }
});
readFile(S2).then((buffer) => {
    return WavDecoder.decode(buffer);
}).then(function(audioData) {
    const size = 20000;
    let tempLast1 = "";
    let tempLast2 = "";

    let tempNew1 = "";
    let tempNew2 = "";

    for(var i=0; i<audioData.channelData[0].length; i+=44) {
        tempLast1 = "";
        tempLast2 = "";
        for(var a=i; a<44+i; a+=4){
            tempNew1= getSector(audioData.channelData[0][a]);
            tempNew2=getSector(audioData.channelData[1][a]);
            if(tempLast1!=tempNew1){
                SectorsS2[0]+=tempNew1;
            }
            if(tempLast2!=tempNew2){
                SectorsS2[1]+=tempNew2;

            }
            tempLast1=tempNew1;
            tempLast2=tempNew2;

        }

    }
    for(var i=0; i<audioData.channelData[0].length; i+=44) {
        tempLast1 = "";
        tempLast2 = "";
        for(var a=i; a<44+i; a+=4){
            tempNew1= getSector(audioData.channelData[0][a]);
            tempNew2=getSector(audioData.channelData[1][a]);
            if(tempLast1!=tempNew1){
                SectorsS2[0]+=tempNew1;
            }
            if(tempLast2!=tempNew2){
                SectorsS2[1]+=tempNew2;

            }
            tempLast1=tempNew1;
            tempLast2=tempNew2;

        }

    }
    console.log(SectorsS2[0]);
    console.log(SectorsS1[0]);
});

