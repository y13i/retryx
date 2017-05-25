import wait from "./wait";

export type MainFunction<T> = (...args: any[]) => Promise<T> | T;
export type HookFunction    = (tries?: number, reason?: any) => Promise<any> | any;

export interface ExecutorOptions {
  maxTries?:       number;
  waiter?:         HookFunction;
  retryCondition?: HookFunction;
  beforeTry?:      HookFunction;
  afterTry?:       HookFunction;
  beforeWait?:     HookFunction;
  afterWait?:      HookFunction;
  doFinally?:      HookFunction;
}

export interface ExecutorInterface<T> {
  execute(...args: any[]): Promise<T>;
}

export class Executor<T> implements ExecutorInterface<T> {
  protected static defaultMaxTries:       number       = 5;
  protected static defaultRetryCondition: HookFunction = () => true;
  protected static defaultWaiter:         HookFunction = (tries: number) => wait(100 * tries ** 2);

  protected maxTries:       number       = Executor.defaultMaxTries;
  protected retryCondition: HookFunction = Executor.defaultRetryCondition;
  protected waiter:         HookFunction = Executor.defaultWaiter;

  protected beforeTry?:  HookFunction;
  protected afterTry?:   HookFunction;
  protected beforeWait?: HookFunction;
  protected afterWait?:  HookFunction;
  protected doFinally?:  HookFunction;

  constructor(
    protected main:     MainFunction<T>,
    protected options?: ExecutorOptions,
  ) {
    if (options) {
      if (options.maxTries)       this.maxTries       = options.maxTries;
      if (options.retryCondition) this.retryCondition = options.retryCondition;
      if (options.waiter)         this.waiter         = options.waiter;
      if (options.beforeTry)      this.beforeTry      = options.beforeTry;
      if (options.afterTry)       this.afterTry       = options.afterTry;
      if (options.beforeWait)     this.beforeWait     = options.beforeWait;
      if (options.afterWait)      this.afterWait      = options.afterWait;
      if (options.doFinally)      this.doFinally      = options.doFinally;
    }
  }

  async execute(...args: any[]): Promise<T> {
    let successful: boolean = false;
    let result:     T       = <any>undefined;

    loop: {
      for (let tries = 1; tries <= this.maxTries; tries++) {
        try {
          if (this.beforeTry) await this.beforeTry(tries, result);

          result     = await this.main(...args);
          successful = true;

          if (this.afterTry) await this.afterTry(tries, result);

          break loop;
        } catch (reason) {
          result = reason;

          if (this.afterTry) await this.afterTry(tries, result);

          if (tries === this.maxTries || !(await this.retryCondition(tries, result))) break loop;

          if (this.beforeWait) await this.beforeWait(tries, result);
          if (this.waiter) await this.waiter(tries, result);
          if (this.afterWait) await this.afterWait(tries, result);
        }
      }
    }

    if (this.doFinally) await this.doFinally();

    if (successful) {
      return result;
    } else {
      throw result;
    }
  }
}

export default Executor;
