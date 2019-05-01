export function getSector(pNum1: number,pNum2: number): string {
  if(pNum1<0.0001&&pNum2<0.0001&&pNum1>-0.0001&&pNum2>-0.0001){
    return  "F"
  }else if(-0.001<pNum1-pNum2&&pNum1-pNum2<=0.001){
    return "P";
  }else if(pNum1-pNum2>=0.001){
    return "B";
  }else {
    return "S";

  }





}
