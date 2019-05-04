export class Pattern {
  private readonly pattern: string;
  private points: number[] = [];
  private percentage: number = 0;

  public constructor(pPattern: string) {
    this.pattern = pPattern;

  }
  public addPoint(pPoint: number) {
    this.points.push(pPoint);
  }

  public getPattern(): string {
    return this.pattern;
  }

  public getPoints(): number[] {
    return this.points;
  }

  public getPercentage(): number {
    return this.percentage;
  }

  public setPercentage(value: number) {
    this.percentage = value;
  }
  public calcPercentage (pSum: number) {
    this.percentage = (this.points.length) * 100 / pSum;

  }

}
