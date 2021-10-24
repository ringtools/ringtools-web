import * as webpack from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
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
      new Dotenv()
    )
  }

  return config;
}

