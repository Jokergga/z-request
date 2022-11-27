const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path =  require("path");

module.exports = {
  mode: "development", // production
  // 打包入口，默认为 index.tsx
  entry: path.resolve(__dirname, "src/index.ts"),
  optimization: {
    minimize: false, // 关闭代码压缩，可选
    runtimeChunk: false,
    // splitChunks: {
    //   cacheGroups: {
    //     vendors: {
    //       name: "bundle",
    //       // test: /[\\/](node_modules|src|\.zebras)[\\/]/,
    //       test: (module) => {
    //         return module.type.startsWith("javascript"); //|| module.type === 'runtime'
    //       },
    //       priority: 20,
    //       chunks: "async",
    //       enforce: true,
    //       reuseExistingChunk: true,
    //     },
    //     default: false,
    //     defaultVenders: false,
    //   },
    // },
  },
  // 输出
  output: {
    path: path.resolve(__dirname, "dist"), //指定打包文件的目录
    filename: "[name].js", //打包文件的名字
    libraryTarget: "umd", // 打包方式
    globalObject: "this", // 全局对象
    library: "request", // 类库名称
  },
  //指定webpack的打包使用的模块
  module: {
    rules: [
      {
        test: /\.tsx?$/, //规则生效的文件
        use: {
          loader: "ts-loader", //要使用的loader
        },
        exclude: /node_modules/, //编译排除的文件
      },
      {
        test: /\.worker\.(js|mjs|ts)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/typescript",
              [
                "@babel/env",
                {
                  useBuiltIns: "usage",
                  corejs: 3,
                  modules: false,
                  targets: {
                    esmodules: true,
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    // 清除dist文件夹
    new CleanWebpackPlugin(),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js"], // 解析对文件格式
  },
  externals: {
    react: "react",
    "react-dom": "ReactDOM",
  },
};
