declare namespace PerkNamespace {
  interface Perk {
    id: string;
    name: string; 
    width: number;
    height: number;
    category: PerkCategory;
    effect: string;
    remove_opposite: string;
  }
}
