import { useRequest as useZebrasRequest } from 'ahooks';
import { spawn, Worker, Pool } from 'threads';
import { Options } from './types';
import { useRequestContext } from './requsetContext';
interface IRequest<T = any> extends RequestInit {
  data?: T;
  params?: T;
}

interface IResponse<T = any> {
  // 数据
  data: T;
  // 状态码
  status: number;
  // 状态内容
  statusText: string;

  headers: Record<string, string>;
}

type IRequestInterceptor = (config: RequestInit) => RequestInit;

type IResponseInterceptor = <T = any>(response: IResponse<T>) => IResponse<T>;

// 创建service时的参数
type RequestBaseConfig = {
  // 请求拦截器
  requestInterceptor?: IRequestInterceptor;

  // 响应拦截器
  responseInterceptor?: IResponseInterceptor;

  // baseUrl
  baseUrl?: string;

  // headers
  // headers?: Headers
  headers?: Record<string, string>;

  //
};

// export function createFetcher(baseConfig: RequestBaseConfig = {}) {
export function createFetcher(getPluginManager?: () => any) {
  // var blob = new Blob(['importScripts("./index.worker.ts")']);
  // var blobUrl = window.URL.createObjectURL(blob);

  let pool: any = null;
  // workers pool
  try {
    pool = Pool(
      () =>
        spawn(
          new Worker(
            new URL('./index.worker.ts', import.meta.url) as any as string,
            // new URL(blobUrl, import.meta.url) as any as string,
          ),
        ),
      1,
    );
  } catch (e) {
    console.warn(
      `remote cannot be accessed from origin '${location.origin}' request worker will not work`,
    );
  }

  let config: RequestBaseConfig;

  const getConfig = (): RequestBaseConfig => {
    if (config) return config;
    config = getPluginManager?.().applyPlugins({
      key: 'request',
      // @ts-ignore
      type: 'modify',
      initialValue: {},
    });
    return config || {};
  };

  return <TData extends any, TParam extends any>(
    url: string,
    config: IRequest<TParam> = {},
    // data?: TParams,
    opts?: Options<TData, TParam[]>,
  ) => {
    const baseConfig = getConfig();

    // const { projectId, tenantId, systemId, actionId, actionCode, pgId, ...options } = useRequestContext();
    const contextData = useRequestContext();
    console.log('context-data', contextData);

    const {
      baseUrl = '',
      headers = {},
      requestInterceptor,
      responseInterceptor,
    } = baseConfig;

    // 配置合并
    config.headers = { ...headers, ...config.headers };
    url = baseUrl + url;

    if (['GET', 'HEAD'].includes(config.method!?.toUpperCase())) {
      url += '?' + JSON.stringify(config.params);
    } else {
      config.body = (
        typeof config.data === 'object'
          ? JSON.stringify(config.data)
          : config.data
      ) as BodyInit;
    }

    const requestEvent = () => {
      // 请求拦截
      if (requestInterceptor) {
        config = requestInterceptor(config!);
      }
      return (
        (
          pool
            ? pool.queue((worker: any) => {
                return worker.requset({ url, config });
              })
            : fetch(url, config).then((res) => res.json())
        )
          // 响应拦截
          .then((res: any) =>
            responseInterceptor ? responseInterceptor(res) : res,
          ) as any
      );
    };

    return useZebrasRequest(requestEvent, opts);
  };
}
