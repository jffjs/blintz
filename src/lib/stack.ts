export default class Stack<T> {
  private readonly store = new Array<T>();

  public get length(): number {
    return this.store.length;
  }

  public peek(): T | null {
    return this.store[this.length - 1] || null;
  }

  public push(item: T): void {
    this.store.push(item);
  }

  public pop(): T | null {
    return this.store.pop() || null;
  }

  public get(index: number): T | null {
    return this.store[index] || null;
  }
}
