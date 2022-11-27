import { expose } from 'threads/worker';

const Transforms = {
  js: 'text',
  css: 'text',
  img: 'blob',
  other: 'json',
};

type Opts = {
  url: string;
  type: 'js' | 'css' | 'img' | 'other';
  config: { [key: string]: any };
};

expose({
  // TODO: threads 不能传回调
  // async work(cb) {
  //   return await cb()
  // }

  async requset(opts: Opts) {
    const { url, type = 'other', config } = opts;

    return await fetch(url, config)
      // 针对不同的type 转换成不同的格式
      // @ts-ignore
      .then((res) => res[Transforms[type]]());
  },
});
