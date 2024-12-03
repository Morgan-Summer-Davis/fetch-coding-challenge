import request from 'supertest';
import app from '../src/app';
import { Item } from '../src/types/types';
import db from '../src/db/db';

let receipt: { [key: string]: string | Item[] };
function resetReceipt() {
  receipt = {
    retailer: 'Target',
    purchaseDate: '2022-01-02',
    purchaseTime: '13:13',
    total: '1.25',
    items: [
        { shortDescription: 'Pepsi - 12-oz', price: '1.25' }
    ]
  }
}
beforeEach(() => resetReceipt());

describe('POST /receipts/process', () => {
  test('200s and returns id if sent a valid receipt', async () => {
    await request(app)
      .post('/receipts/process')
      .send(receipt)
      .expect(200)
      .then((response) => {
        expect(response.body?.id).toBeTruthy();
      });
  });

  test('400s with error on no body', async () => {
    await request(app)
      .post('/receipts/process')
      .expect(400)
      .then((response) => {
        expect(response.body?.error).toBeTruthy();
      });
  });

  test('400s with error if sent a receipt that is missing any field', async () => {
    await Promise.all(Object.keys(receipt).map(key => {
      let tempReceipt = Object.assign({}, receipt);
      delete tempReceipt[key];
      return request(app)
        .post('/receipts/process')
        .send(tempReceipt)
        .expect(400)
        .then((response) => {
          expect(response.body?.error).toBeTruthy();
        })
    }));
  });

  test('400s with error if sent a receipt with an extra field', async () => {
    receipt.extraField = 'invalid';
    await request(app)
      .post('/receipts/process')
      .send(receipt)
      .expect(400)
      .then((response) => {
        expect(response.body?.error).toBeTruthy();
      });
  });

  test('400s with error if sent a receipt with an invalid retailer', async () => {
    const retailers = ['%', ''];

    await Promise.all(retailers.map(async retailer => {
      resetReceipt();
      receipt.retailer = retailer
      return request(app)
        .post('/receipts/process')
        .send(receipt)
        .expect(400)
        .then((response) => {
          expect(response.body?.error).toBeTruthy();
        });
    }));
  });

  test('400s with error if sent a receipt with an invalid purchase date', async () => {
    const purchaseDates = ['12/23', '0', 'a', '2022(20(31', '2022-40-40', '2022-12/12', ''];

    await Promise.all(purchaseDates.map(async purchaseDate => {
      resetReceipt();
      receipt.purchaseDate = purchaseDate
      return request(app)
        .post('/receipts/process')
        .send(receipt)
        .expect(400)
        .then((response) => {
          expect(response.body?.error).toBeTruthy();
        });
    }));
  });

  test('400s with error if sent a receipt with an invalid purchase time', async () => {
    const purchaseTimes = ['a', '25:13', '15:60', ''];

    await Promise.all(purchaseTimes.map(async purchaseTime => {
      resetReceipt();
      receipt.purchaseTime = purchaseTime
      return request(app)
        .post('/receipts/process')
        .send(receipt)
        .expect(400)
        .then((response) => {
          expect(response.body?.error).toBeTruthy();
        });
    }));
  });

  test('400s with error if sent a receipt with an invalid total', async () => {
    const totals = ['a', '10.131', '1,000.10', '3.056,00', '0', ''];

    await Promise.all(totals.map(async total => {
      resetReceipt();
      receipt.total = total
      return request(app)
        .post('/receipts/process')
        .send(receipt)
        .expect(400)
        .then((response) => {
          expect(response.body?.error).toBeTruthy();
        });
    }));
  });

  test('400s with error if sent a receipt with no items', async () => {
    receipt.items = [];
    await request(app)
      .post('/receipts/process')
      .send(receipt)
      .expect(400)
      .then((response) => {
        expect(response.body?.error).toBeTruthy();
      });
  });

  test('400s with error if sent a receipt with an item with an invalid short description', async () => {
    const shortDescriptions = ['&', ''];

    await Promise.all(shortDescriptions.map(async shortDescription => {
      resetReceipt();
      (receipt.items[0] as Item).shortDescription = shortDescription
      return request(app)
        .post('/receipts/process')
        .send(receipt)
        .expect(400)
        .then((response) => {
          expect(response.body?.error).toBeTruthy();
        });
    }));
  });

  test('400s with error if sent a receipt with an item with an invalid cost', async () => {
    const costs = ['dfgs', '0.1003', '1003', '9,002.21', '8.435,30', ''];

    await Promise.all(costs.map(async cost => {
      resetReceipt();
      receipt.cost = cost
      return request(app)
        .post('/receipts/process')
        .send(receipt)
        .expect(400)
        .then((response) => {
          expect(response.body?.error).toBeTruthy();
        });
    }));
  });

  test('accepts multiple date formats', async () => {
    const purchaseDates = ['2023.27.11', '06-30-2024', '1987/12/31', '15 11 2001'];

    await Promise.all(purchaseDates.map(async purchaseDate => {
      resetReceipt();
      receipt.purchaseDate = purchaseDate
      return request(app)
        .post('/receipts/process')
        .send(receipt)
        .expect(200)
    }));
  });
});

describe('GET /receipts/:id/points', () => {
  test('404s with error if receipt with id does not exist', async () => {
    jest.spyOn(db, 'getPoints').mockImplementation(() => { throw new Error('Receipt test not found') });

    await request(app)
      .get('/receipts/test/points')
      .expect(404)
      .then((response) => {
        expect(response.body?.error).toBeTruthy();
      });
  });

  test('200s and returns points with valid id', async () => {
    jest.spyOn(db, 'getPoints').mockImplementation(() => 3);

    await request(app)
      .get('/receipts/test/points')
      .expect(200)
      .then((response) => {
        expect(response.body?.points).toEqual(3);
      });
  });
});