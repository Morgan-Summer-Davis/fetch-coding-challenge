import { Receipt } from '../types/types';
import { isValidReceipt, normalizeDate } from '../utils/utils';

class DB {
  private data: { [id: string]: { receipt: Receipt; points: number } } = {};

  process(receipt: Receipt) {
    if (!isValidReceipt(receipt))
      throw new Error('Receipt is formatted incorrectly');

    receipt.purchaseDate = normalizeDate(receipt.purchaseDate);

    const points = this.calculatePoints(receipt);
    let id;
    do {
      id = crypto.randomUUID();
    } while (this.data[id] === null);

    this.data[id] = { receipt, points };
    return id;
  }

  getPoints(id: string) {
    const receipt = this.data[id];
    if (receipt === undefined) throw new Error(`Receipt ${id} not found`);

    return receipt.points;
  }

  private calculatePoints(receipt: Receipt) {
    return (
      this.calculateRetailerNamePoints(receipt) +
      this.calculatePriceTotalPoints(receipt) +
      this.calculateItemPoints(receipt) +
      this.calculatePurchaseTimePoints(receipt)
    );
  }

  private calculateRetailerNamePoints(receipt: Receipt) {
    return receipt.retailer.split('').filter((char) => !!char.match(/[a-z\d]/i))
      .length;
  }

  private calculatePriceTotalPoints(receipt: Receipt) {
    let points = 0;
    if (parseFloat(receipt.total) % 1.0 === 0.0) points += 50;
    if (parseFloat(receipt.total) % 0.25 === 0.0) points += 25;
    return points;
  }

  private calculateItemPoints(receipt: Receipt) {
    let points = 0;
    points += Math.floor(receipt.items.length / 2) * 5;

    receipt.items.forEach((item) => {
      if (item.shortDescription.trim().length % 3 !== 0) return;

      points += Math.ceil(parseFloat(item.price) * 0.2);
    });

    return points;
  }

  private calculatePurchaseTimePoints(receipt: Receipt) {
    let points = 0;

    const purchaseDay = new Date(receipt.purchaseDate).getUTCDate();
    if (purchaseDay % 2 !== 0) points += 6;

    const purchaseHour = parseInt(receipt.purchaseTime.split(':')[0], 10);
    if (purchaseHour >= 14 && purchaseHour <= 16) points += 10;

    return points;
  }
}

export default new DB();
