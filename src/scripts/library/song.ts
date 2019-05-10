import { DumbMap } from "./dumbMap";
import { S2_MULTIPLIER } from "./consts";

export class Song {
  private Left: any[];
  private Right: any[];
  private letters: DumbMap[];

  constructor() {
    this.Left = [];
    this.Right = [];
    this.letters = [new DumbMap(),new DumbMap()];
  }

  public getChannel(pChannel: number) {
    if (pChannel) {
      return this.Left;
    } else {
      return this.Right;
    }
  }

  public addToChannel(pChannel: number, pPoint: any) {
    if(pChannel) {
      this.Right.push(pPoint);
    } else {
      this.Left.push(pPoint);
    }
    const prev = this.letters[pChannel].get(pPoint.letter);
    if (prev != undefined) {
      this.letters[pChannel].set(pPoint.letter, prev + 1);
    } else {
      this.letters[pChannel].set(pPoint.letter, 1);
    }
  }

  public getLetterAmount(pLetter: string, pChannel: number) {
    return this.letters[pChannel].get(pLetter);
  }

  public getJson(pLetters: string[][], pCants: any[][]): number[] {
    let json: number[] = [0,0];
    for (let channel = 0; channel < 2; channel++) {
      let score: number = 0;
    for (let i = 0; i < pLetters[channel].length; i++) {
      const p = (pCants[channel][i].length * S2_MULTIPLIER) / this.letters[channel].get(pLetters[channel][i]);
      if (p > 1) {
        score += 2 - p;
      } else {
        score += p;
      }
    }
    json[channel] = score / pLetters[channel].length;
  }
  return json;
  }

  public sortSong() {
    const sort = (a: any, b: any) => a.letter < b.letter ? 1: -1;
    this.Left = this.Left.sort(sort);
    this.Right = this.Right.sort(sort);
  }
}
