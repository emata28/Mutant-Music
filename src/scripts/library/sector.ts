export function getSector(pNum: number): string {
  if(-0.001<pNum&&pNum<=0.001){
    return "P";
  }else if(pNum>=0.001){
    return "B";
  }else {
    return "S";

  }





}
