import { Receipt, Item } from "types";

export const isValidReceipt = (receipt: unknown): receipt is Receipt => {
  return (
    typeof receipt === 'object' &&
    receipt !== null &&
    !Array.isArray(receipt) &&
    'retailer' in receipt &&
    typeof receipt.retailer === 'string' &&
    'purchaseDate' in receipt &&
    typeof receipt.purchaseDate === 'string' &&
    isValidDate(receipt.purchaseDate) &&
    'purchaseTime' in receipt &&
    typeof receipt.purchaseTime === 'string' &&
    isValidTime(receipt.purchaseTime) &&
    'total' in receipt &&
    typeof receipt.total === 'string' &&
    isValidPrice(receipt.total) &&
    'items' in receipt &&
    Array.isArray(receipt.items) &&
    receipt.items.every(item => isValidItem(item))
  );
}

const isValidItem = (item: unknown): item is Item => {
  return (
    typeof item === 'object' &&
    item !== null &&
    !Array.isArray(item) &&
    'shortDescription' in item &&
    typeof item.shortDescription === 'string' &&
    'price' in item &&
    typeof item.price === 'string' &&
    isValidPrice(item.price)
  )
}

const isValidPrice = (price: string) => {
  return (parseFloat(price).toFixed(2) === price)
}

const isValidTime = (time: string) => {
  if (!time.match(/^\d\d:\d\d$/)) return false;

  const [ hours, minutes ] = time.split(':').map(num => parseInt(num, 10));
  return (hours <= 23 && hours >= 0 && minutes <= 59 && minutes >= 0)
}

const isValidDate = (date: string) => {
  return !isNaN(new Date(date).getTime());
}