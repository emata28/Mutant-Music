export function getSector(pNum1: number,pNum2: number): string {
  if(pNum1<0.0001&&pNum2<0.0001&&pNum1>-0.0001&&pNum2>-0.0001){
    return  "F"
  }else if(-0.01<Math.abs(pNum1-pNum2)&&Math.abs(pNum1-pNum2)<=0.01){
    return "P";
  }else if(pNum1+0.01>pNum2){
    return "B";
  }else {
    return "S";
  }
}
