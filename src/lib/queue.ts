import { EventEmitter } from 'events';

export class Queue {
  queue: any[];
  eventEmitter: EventEmitter;

  constructor() {
    this.queue = [];
    this.eventEmitter = new EventEmitter();
  }

  enqueue(value: any) {
    this.queue.push(value);
    this.eventEmitter.emit('enqueue');
    return true;
  }

  dequeue() {
    const value = (this.queue.length === 0) ? null : this.queue.pop();
    this.eventEmitter.emit('dequeue');
    return value;
  }

  drain() {
    this.queue = [];
    this.eventEmitter.emit('drain');
  }

  getLength() {
    return this.queue.length;
  }

  async waitForEnqueue() {
    await new Promise((resolve) => {
      this.eventEmitter.on('enqueue', resolve);
    });
  }
}
