import Executor, {MainFunction, ExecutorOptions} from "./executor";

export function retryx<T>(main: MainFunction<T>, options?: ExecutorOptions, ...args: any[]): Promise<T> {
  const executor = new Executor<T>(main, options, ...args);
  return executor.execute();
}

export default retryx;
