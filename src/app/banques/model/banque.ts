export interface  Banque {
   vin?;
    year?;
    brand?;
    color?;
    price?;
    saleDate?;
}

export function compareBanques(c1:Banque, c2: Banque) {

 const compare = c1.vin - c2.vin;

 if (compare > 0) {
  return 1;
 } else if ( compare < 0) {
  return -1;
 } else { return 0; }

}
