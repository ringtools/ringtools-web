import * as webpack from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import { BaseHrefWebpackPlugin } from 'base-href-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
const Dotenv = require("dotenv-webpack");

require('dotenv').config()

export default (
  config: webpack.Configuration,
  options: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  if (config.module && config.module.rules) {
    config.module.rules.push(
      {
        test: /\.txt$/i,
        loader: 'raw-loader',
      }
    );

    config.plugins?.push(
      new HtmlWebpackPlugin(), // Required dependency
      new BaseHrefWebpackPlugin({ baseHref: '/srrof-ringtools-web/' }),
      new Dotenv()
    )
  }

  return config;
}

