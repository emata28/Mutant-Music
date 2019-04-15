
import * as fs from 'fs';
// import { complex as fft } from 'fft';
import * as WavEncoder from 'wav-encoder';
// import { default as ft } from 'fourier-transform';
import * as WavDecoder from 'wav-decoder';


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
    console.log("ampliando 30%");
    const size = 20000;

    for(var i=0; i<44100; i++) {
        console.log(audioData.channelData[0][i]);
        console.log(audioData.channelData[1][i]);
        console.log('*******************');
    }

    for(var i=0; i<audioData.channelData[0].length; i++) {
       audioData.channelData[1][i]+=audioData.channelData[0][i];
       audioData.channelData[0][i]*=20;
       audioData.channelData[0][i]+=0.000000259254;
     }

    for(var i=44100*5; i<44100*10; i++) {
        audioData.channelData[0][i-44100*50] = audioData.channelData[0][i];
    }

    for(var i=44100*11; i<44100*16; i++) {
        audioData.channelData[0][i+44100*60] = audioData.channelData[0][i];
    }


    console.log("writing...");
    WavEncoder.encode(audioData).then((buffer: any) => {
        // @ts-ignore
        fs.writeFileSync(S1, new Buffer.from(buffer));
    });
});