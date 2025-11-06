export interface StoredProduct {
  PK: string; // Ex: PRODUCT#01
  SK: string; // Ex: DETAILS
  name: string;
  description: string;
  price: number; // Em centavos, Ex: 11880 = R$ 118.80
  category: string;
}

export type DynamoCursor = {
  PK: string;
  SK: string;
};
