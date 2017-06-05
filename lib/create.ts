import Executor, {MainFunction, ExecutorOptions} from "./executor";

export function create(initialOptions: ExecutorOptions) {
  return function<T>(main: MainFunction<T>, options: ExecutorOptions = {}, ...args: any[]) {
    const executor = new Executor(main, Object.assign({}, initialOptions, options), ...args);
    return executor.execute();
  };
}

export default create;
