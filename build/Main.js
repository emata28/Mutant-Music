"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
//import * as fs from 'fs';
// import { complex as fft } from 'fft';
//import * as WavEncoder from 'wav-encoder';
// import { default as ft } from 'fourier-transform';
//import * as WavDecoder from 'wav-decoder';
const f = __importStar(require("./elastic_conection"));
const data = [{
        character: 'Ned Stark',
        quote: 'Winter is coming.'
    }, {
        character: 'Daenerys Targaryen',
        quote: 'I am the blood of the dragon.'
    }, {
        character: 'Tyrion Lannister',
        quote: 'A mind needs books like a sword needs a whetstone.'
    }];
//f.sendData(data, 'pruebas');
f.getAll('pruebas');
//# sourceMappingURL=Main.js.map