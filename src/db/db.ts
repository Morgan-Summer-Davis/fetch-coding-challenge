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

  }
}

export default new DB;