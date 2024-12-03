import { Receipt, Item } from '../types/types';

export const isValidReceipt = (receipt: unknown): receipt is Receipt => {
  return (
    typeof receipt === 'object' &&
    receipt !== null &&
    !Array.isArray(receipt) &&
    'retailer' in receipt &&
    isValidRetailer(receipt.retailer) &&
    'purchaseDate' in receipt &&
    isValidDate(receipt.purchaseDate) &&
    'purchaseTime' in receipt &&
    isValidTime(receipt.purchaseTime) &&
    'total' in receipt &&
    isValidPrice(receipt.total) &&
    'items' in receipt &&
    Array.isArray(receipt.items) &&
    receipt.items.length > 0 &&
    receipt.items.every(item => isValidItem(item)) &&
    Object.keys(receipt).length === 5
  );
}

const isValidItem = (item: unknown): item is Item => {
  return (
    typeof item === 'object' &&
    item !== null &&
    !Array.isArray(item) &&
    'shortDescription' in item &&
    isValidShortDescription(item.shortDescription) &&
    'price' in item &&
    isValidPrice(item.price) &&
    Object.keys(item).length === 2
  )
}

const isValidRetailer = (retailer: unknown) => {
  return typeof retailer === 'string' && !!retailer.match(/^[\w\s\-&]+$/);
}

const isValidShortDescription = (shortDescription: unknown) => {
  return typeof shortDescription === 'string' && !!shortDescription.match(/^[\w\s\-]+$/);
}

const isValidPrice = (price: unknown) => {
  return typeof price === 'string' && !!price.match(/^\d+\.\d{2}$/);
}

const isValidTime = (time: unknown) => {
  if (typeof time !== 'string' || !time.match(/^\d\d:\d\d$/)) return false;

  const [ hours, minutes ] = time.split(':').map(num => parseInt(num, 10));
  return (hours <= 23 && hours >= 0 && minutes <= 59 && minutes >= 0)
}

const isValidDate = (date: unknown) => {
  try {
    return (
      typeof date === 'string' &&
        !!date.match(/^(\d+\/\d+\/\d+|\d+\.\d+\.\d+|\d+-\d+-\d+|\d+ \d+ \d+)$/) &&
        !isNaN(new Date(normalizeDate(date)).getTime())
    );
  } catch {
    return false;
  }
}

export const normalizeDate = (date: string) => {
  const error = new Error('Invalid date');

  let sections = date.split(/[\/\. -]/).map(piece => parseInt(piece, 10));
  if (sections.length !== 3) throw error;

  let yearIndex = sections.findIndex(num => num > 31 || num < 1);
  if (yearIndex === -1) yearIndex = 0;
  const year = sections.splice(yearIndex, 1)[0];
  if (yearIndex === 1) throw error;

  let dayIndex = sections.findIndex(num => num > 12);
  if (dayIndex === -1) dayIndex = 1;
  const day = sections.splice(dayIndex, 1)[0];
  if (day < 1 || day > 31) throw error;

  const month = sections[0];
  if (month < 1 || month > 12) throw error;

  const newDate = new Date(year, month - 1, day);
  return `${newDate.getUTCFullYear()}-${newDate.getUTCMonth() + 1}-${newDate.getUTCDate()}`;
}