import webpack from 'webpack';
import path from 'path';

webpack({
  // mode: 'development', // production
  // 打包入口，默认为 index.tsx
  entry: path.resolve(process.cwd(), "src/request/index.ts"),
  optimization: {
    minimize: false, // 关闭代码压缩，可选
  },
  // 输出
  output: {
    path: path.resolve(process.cwd(), "dist"), //指定打包文件的目录
    filename: "bundle.js", //打包文件的名字
    // // library 名称
    // library: `request`,
    // // 输出 umd 类型的 bundle
    // libraryTarget: 'umd',
  },
  //指定webpack的打包使用的模块
  module: {
    rules: [
      {
        test: /\.ts$/, //规则生效的文件
        use: {
          loader: "ts-loader", //要使用的loader
        },
        exclude: /node_modules/, //编译排除的文件
      },
    ],
  },
});
