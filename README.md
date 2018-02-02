# aliyun-cs-nodejs-sdk

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![coverage][cov-image]][cov-url]

[npm-image]: https://img.shields.io/npm/v/aliyun-cs-node-sdk.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/aliyun-cs-node-sdk
[travis-image]: https://img.shields.io/travis/thonatos/aliyun-cs-node-sdk/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/thonatos/aliyun-cs-node.sdk.svg?branch=master
[cov-image]: https://coveralls.io/repos/thonatos/aliyun-cs-node-sdk/badge.svg?branch=master&service=github
[cov-url]: https://coveralls.io/github/thonatos/aliyun-cs-node-sdk?branch=master

## API Spec

See: https://help.aliyun.com/document_detail/26043.html

## Test

```sh
ACCESS_KEY_ID=<ACCESS_KEY_ID> ACCESS_KEY_SECRET=<ACCESS_KEY_SECRET> npm run test
```

## Installation

You can install it via npm/cnpm/yarn.

```sh
$ npm install aliyun-cs-node-sdk --save
```

## Usage

```js

const Client = require('aliyun-cs-node-sdk');

client = new Client({
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret',
  region: 'cn-hangzhou',
  secure: true,
});

async function run(){
  const images = await client.getImages();
  console.log(images);
}

run();
```

## License

The [MIT](LICENSE) License
