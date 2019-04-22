export function getSector(pNum: number): string {
  if(0.8<pNum&&pNum<=1){
    return "A";
  }else if(0.6<pNum&&pNum<=0.8){
    return "B";
  }else if(0.4<pNum&&pNum<=0.6){
    return "C";
  }else if(0.2<pNum&&pNum<=0.4){
    return "D";
  }else if(0.05<pNum&&pNum<=0.2){
    return "E";
  }else if(-0.05<pNum&&pNum<=0.05){
    return "F";
  }else if(-0.2<pNum&&pNum<-0.05){
    return "G";
  }else if(-0.4<pNum&&pNum<=-0.2){
    return "H";
  }else if(-0.6<pNum&&pNum<=-0.4){
    return "I";
  }else if(-0.8<pNum&&pNum<=-0.6){
    return "J";
  }else {
    return "K";
  }





}
