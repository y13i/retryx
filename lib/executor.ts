import wait from "./wait";

export type MainFunction<T> = (...args: any[]) => Promise<T> | T;
export type HookFunction    = (tries?: number, reason?: any) => Promise<any> | any;

export interface ExecutorOptions {
  maxTries?:       number;
  timeout?:        number;
  waiter?:         HookFunction;
  retryCondition?: HookFunction;
  beforeTry?:      HookFunction;
  afterTry?:       HookFunction;
  beforeWait?:     HookFunction;
  afterWait?:      HookFunction;
  doFinally?:      HookFunction;
}

export interface ExecutorInterface<T> {
  execute(): Promise<T>;
}

export class Executor<T> implements ExecutorInterface<T> {
  protected static defaultMaxTries:       number       = 5;
  protected static defaultTimeout:        number       = -1;
  protected static defaultRetryCondition: HookFunction = () => true;
  protected static defaultWaiter:         HookFunction = (tries: number) => wait(100 * 2 ** (tries - 1));

  protected maxTries:       number       = Executor.defaultMaxTries;
  protected timeout:        number       = Executor.defaultTimeout;
  protected retryCondition: HookFunction = Executor.defaultRetryCondition;
  protected waiter:         HookFunction = Executor.defaultWaiter;

  protected args: any[];

  protected beforeTry?:  HookFunction;
  protected afterTry?:   HookFunction;
  protected beforeWait?: HookFunction;
  protected afterWait?:  HookFunction;
  protected doFinally?:  HookFunction;

  constructor(
    protected main:     MainFunction<T>,
    protected options?: ExecutorOptions,
              ...args:  any[]
  ) {
    this.args = args;

    if (options) {
      if (options.maxTries)       this.maxTries       = options.maxTries;
      if (options.timeout)        this.timeout        = options.timeout;
      if (options.retryCondition) this.retryCondition = options.retryCondition;
      if (options.waiter)         this.waiter         = options.waiter;
      if (options.beforeTry)      this.beforeTry      = options.beforeTry;
      if (options.afterTry)       this.afterTry       = options.afterTry;
      if (options.beforeWait)     this.beforeWait     = options.beforeWait;
      if (options.afterWait)      this.afterWait      = options.afterWait;
      if (options.doFinally)      this.doFinally      = options.doFinally;
    }
  }

  async execute(): Promise<T> {
    const promises: Promise<T>[] = [this.tryLoop()];

    if (this.timeout && this.timeout !== -1) promises.push(<Promise<never>>this.timer(this.timeout));

    try {
      const result = await Promise.race(promises);
      return result;
    } catch (reason) {
      throw reason;
    } finally {
      if (this.doFinally) await this.doFinally();
    }
  }

  protected async tryLoop(): Promise<T> {
    let result: T = <any>undefined;

    for (let tries = 1; this.maxTries === -1 || tries <= this.maxTries; tries++) {
      try {
        if (this.beforeTry) await this.beforeTry(tries, result);

        result = await this.main(...this.args);

        if (this.afterTry) await this.afterTry(tries, result);

        break;
      } catch (reason) {
        if (this.afterTry) await this.afterTry(tries, reason);

        if (false
          || tries === this.maxTries
          || !(await this.retryCondition(tries, reason))
        ) throw reason;

        if (this.beforeWait) await this.beforeWait(tries, reason);
        if (this.waiter) await this.waiter(tries, reason);
        if (this.afterWait) await this.afterWait(tries, reason);
      }
    }

    return result;
  }

  protected async timer(duration: number): Promise<void> {
    await new Promise((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), duration);
    });
  }
}

export default Executor;
