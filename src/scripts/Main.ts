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

        channel1= getSector(audioData.channelData[0][i],audioData.channelData[0][i+22]);
        channel2=getSector(audioData.channelData[1][i],audioData.channelData[1][i+22]);

        SectorsS2[0]=SectorsS2[0]+channel1;
        SectorsS2[1]=SectorsS2[1]+channel2;


    }



}).then(function(Analyze){

    let Combinaciones : String[] = [];
    let concurrenciaValueCH1 : number[] = [];
    let concurrenciaValueCH2 : number[] = [];
    let infoCH1=[];
    let infoCH2 =[];
    let temp1 ="";

    let index=0;
    let count=0;
    while(count+1!=SectorsS2[0].length){
        temp1=SectorsS2[0][count]+SectorsS2[0][count+1];
        index = Combinaciones.indexOf(temp1);

        if(index==-1){
            Combinaciones.push(temp1);
            concurrenciaValueCH1.push(1);
        }else{
            concurrenciaValueCH1[index]+=1;

        }


        count++;
    }
    infoCH1.push(Combinaciones);
    infoCH1.push(concurrenciaValueCH1);
    //infoCH2.push(Combinaciones);
    //infoCH2.push(concurrenciaValueCH2);

    count = 0;
    //while(count !=5){
    //    concurrenciaValueCH1.
   // }
    console.log(infoCH1);


    var topValues = infoCH1.sort((a,b)=>b-a)
    console.log(topValues); // [ 1, 2, 3, 8, 12 ]

    let top3Number;
})



readFile(S1).then((buffer) => {
    return WavDecoder.decode(buffer);
}).then(function(audioData) {


    let channel1 ="";
    let channel2 ="";
    for(var i=0; i<audioData.channelData[0].length; i+=22) {

        channel1= getSector(audioData.channelData[0][i],audioData.channelData[0][i+22]);
        channel2=getSector(audioData.channelData[1][i],audioData.channelData[1][i+22]);

        SectorsS1[0]=SectorsS1[0]+channel1;
        SectorsS1[1]=SectorsS1[1]+channel2;


    }
    console.log("S2");
    console.log(SectorsS2[0].length);
    console.log("S1");
    console.log(SectorsS1[0].length);


});
function  indexOfMax(arr: number[]) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}
