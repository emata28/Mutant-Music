export class Sector {
  private sector: string;
  private lowerRange: number; // 0.8
  private higherRange: number; // 1

  constructor(pSector: string, pLower: number, pHigher: number) {
    this.sector = pSector;
    this.lowerRange = pLower;
    this.higherRange = pHigher;
  }

  public checkIfInside(pNum: number): string {
    if (pNum <= this.higherRange && pNum > this.lowerRange) {
      return this.sector;
    }
    return '';
  }
}
