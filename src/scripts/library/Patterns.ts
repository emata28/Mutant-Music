export  class Pattern {
  _pattern: String;
  private _points: number[]=[];
  private _porcentage: number=0;

  public constructor( pPattern: String) {
    this._pattern = pPattern;

  }
  public addPoint(pPoint: number){
    this._points.push(pPoint);
  }

  get pattern(): String {
    return this._pattern;
  }

  get points(): number[] {
    return this._points;
}


  get porcentage(): number {
    return this._porcentage;
  }

  set porcentage(value: number) {
    this._porcentage = value;
  }
  public calcPorcentage (pSum: number) {
    this.porcentage = (this._points.length) * 100 / pSum;

  }

}