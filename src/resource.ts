import { spawn, Worker, Pool } from 'threads';

interface PoolOptions {
  // 每个worker同时执行的任务数，默认为一个
  concurrency?: number;
  // .queue() 之前要排队的最大任务数，默认为无限
  maxQueuedJobs?: number;
  // 池子的定义名称
  name?: string;
  // 生成的worker的数量，内容为cpu核的数量
  size?: number;
}

type Opts = {
  url: string;
  type: 'js' | 'css' | 'img' | 'other';
  // pool?: PoolOptions,
};

const Transforms = {
  js: 'text',
  css: 'text',
  img: 'blob',
  other: 'json',
};

export function createResourcer(
  opts?: PoolOptions | number,
): (opts: Opts[]) => Promise<Blob[]> {
  // 普通 worker
  // const worker = await spawn(
  //   new Worker(new URL('./thread/resource.worker.ts', import.meta.url) as any as string),
  // );

  let pool: any = null;

  // workers pool
  try {
    pool = Pool(
      () =>
        spawn(
          new Worker(
            new URL('./index.worker.ts', import.meta.url) as any as string,
          ),
        ),
      opts || 1,
    );
  } catch (e) {
    console.warn(
      `remote cannot be accessed from origin '${location.origin}' request worker will not work`,
    );
  }

  // 取消排队的任务，如果已经在worker中执行，则不能再取消它。
  // task.cancel()

  // 返回一个promise，一旦任务都已执行完(包含排队的)，并且没有更多的任务需要运行，promise就会resolve，否则就会reject
  // await pool.completed()

  // 默认情况下，池子将等待所有计划的任务完成后才终止工作。传递true立即强制终止池。
  // await pool.terminate()

  // TODO: 把池子的销毁抛出去

  return async (opts: Opts[]) => {
    // 存放 img 文件的数组
    const resources: Blob[] = [];

    for (const opt of opts) {
      console.log('opts', opt);

      (pool
        ? pool.queue((worker: any) => {
            return worker.requset(opt);
          })
        : fetch(opt.url)
            // @ts-ignore
            .then((res) => res[Transforms[opt.type]]())
      ).then((res: any) => {
        switch (opt.type) {
          case 'js':
            eval(res);
            break;
          case 'css':
            // css 资源 创建 link 标签 插入 head
            // const link = document.createElement('link');
            // link.type = 'text/css';
            // link.rel = 'stylesheet';
            // link.textContent = res;
            const style = document.createElement('style');
            style.textContent = res;

            const head = document.getElementsByTagName('head')[0];
            head.appendChild(style);
            break;
          case 'img':
            // 图片 blob 返回出去
            resources.push(res);
            break;
          default:
            resources.push(res);
            break;
        }
      });
    }

    // 等等所有任务都执行完
    await pool?.completed();

    // console.log('resources', resources);

    return resources;
  };
}
