export interface Receipt {
  retailer: string,
  purchaseDate: string,
  purchaseTime: string,
  total: string,
  items: Item[]
}

export interface Item {
  shortDescription: string,
  price: string
}