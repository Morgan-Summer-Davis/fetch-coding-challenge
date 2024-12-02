import { Receipt } from "types";
import { isValidReceipt } from "../utils/utils";

class DB {
  private data: { [id: string]: Receipt } = {}

  process(receipt: Receipt) {
    if (!isValidReceipt(receipt)) throw new Error('Receipt is formatted incorrectly');

    let id;
    do {
      id = crypto.randomUUID();
    } while (this.data[id] === null)

    this.data[id] = receipt;
    return id;
  }

  points(id: string) {
    const receipt = this.data[id];
    if (!isValidReceipt(receipt)) throw new Error(`Receipt ${id} not found`);

    let points = 0;
    points += receipt.retailer.split('').filter(char => !!char.match(/[a-z\d]/i)).length;
    if (parseFloat(receipt.total) % 1.00 === 0.0) points += 50;
    if (parseFloat(receipt.total) % 0.25 === 0.0) points += 25;
    points += Math.floor(receipt.items.length / 2) * 5;

    receipt.items.forEach(item => {
      if (item.shortDescription.trim().length % 3 !== 0) return;

      points += Math.ceil(parseFloat(item.price) * 0.2);
    })

    const purchaseDay = new Date(receipt.purchaseDate).getUTCDate();
    if (purchaseDay % 2 !== 0) points += 6;

    const purchaseHour = parseInt(receipt.purchaseTime.split(':')[0], 10)
    if (purchaseHour >= 14 && purchaseHour <= 16) points += 10;

    return points;
  }
}

export default new DB;