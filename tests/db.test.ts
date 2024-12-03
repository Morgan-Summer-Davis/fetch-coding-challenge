import { Receipt } from '../src/types/types';
import db from '../src/db/db';

const controlReceipt = {
  retailer: '&',
  purchaseDate: '2022-01-02',
  purchaseTime: '09:00',
  total: '0.01',
  items: [
      { shortDescription: 'a', price: '0.00' }
  ]
}

let receipt: Receipt;
function resetReceipt() {
  receipt = Object.assign({}, controlReceipt);
}
beforeEach(() => resetReceipt());

describe('process', () => {
  test('returns a string id', () => {
    expect(typeof db.process(receipt)).toEqual('string');
  });

  test('calls calculatePoints', () => {
    jest.spyOn(db as any, 'calculatePoints');
    db.process(receipt);
    expect(db['calculatePoints']).toHaveBeenCalled();
  });

  test('throws an error when passed an invalid receipt', () => {
    delete (receipt as any).retailer;
    expect(() => db.process(receipt)).toThrow(/formatted incorrectly/);
  });
});

describe('getPoints', () => {
  beforeAll(() => (db as any).data = { validId: { points: 324 } });

  test("returns the correct receipt's points", () => {
    expect(db.getPoints('validId')).toEqual(324);
  });

  test('throws an error when passed an invalid id', () => {
    expect(() => db.getPoints('invalidId')).toThrow(/not found/);
  });
});

describe("a receipt's points are increased by", () => {
  let controlPoints: number;
  beforeAll(() => controlPoints = db['calculatePoints'](controlReceipt));

  test('1 for each alphanumeric character in the retailer name', () => {
    receipt.retailer = 'abc & 123  '
    const id = db.process(receipt);
    expect(db.getPoints(id) - controlPoints).toEqual(6)
  });

  test('75 altogether if the total is a round dollar amount with no cents', () => {
    receipt.total = '1000.00'
    const id = db.process(receipt);
    expect(db.getPoints(id) - controlPoints).toEqual(75);
  });

  test('25 points if the total is a multiple of 0.25', () => {
    receipt.total = '32.75'
    const id = db.process(receipt);
    expect(db.getPoints(id) - controlPoints).toEqual(25);
  });

  test('5 points for every two items on the receipt', () => {
    const item = { shortDescription: 'a', price: '0.00' };
    receipt.items = Array(16).fill(item);
    const id = db.process(receipt);
    expect(db.getPoints(id) - controlPoints).toEqual(40);
  });

  test("0.2 times each item's price, rounded up, if the item's trimmed description's length is divisble by 3", () => {
    const pointItem = { shortDescription: '   abc  ', price: '21.00' };
    const otherItem = { shortDescription: 'a', price: '0.00' };

    receipt.items = [otherItem, otherItem, otherItem, otherItem, otherItem];
    let id = db.process(receipt);
    const points = db.getPoints(id) - controlPoints;

    resetReceipt();
    receipt.items = [pointItem, pointItem, otherItem, pointItem, otherItem];
    id = db.process(receipt);
    expect(db.getPoints(id) - points).toEqual(15);
  });

  test('6 points if the day in the purchase date is odd', () => {
    receipt.purchaseDate = '2022-01-01';
    const id = db.process(receipt);
    expect(db.getPoints(id) - controlPoints).toEqual(6);
  });

  test('10 points if the time of purchase is after 2:00pm and before 4:00pm', () => {
    receipt.purchaseTime = '15:00';
    const id = db.process(receipt);
    expect(db.getPoints(id) - controlPoints).toEqual(10);
  });
});