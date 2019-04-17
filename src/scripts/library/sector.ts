class Sector {
  sector: string;
  lowerRange: number;
  higherRange: number;

  constructor(pSector: string, pLower: number, pHigher: number) {
    this.sector = pSector;
    this.lowerRange = pLower;
    this.higherRange = pHigher;
  }

  checkIfInside(pNum: number): string {
    if (pNum <= this.higherRange && pNum > this.lowerRange) {
      return this.sector;
    }
    return '';
  }
}
