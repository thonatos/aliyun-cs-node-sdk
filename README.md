# cs-nodejs-sdk

[![NPM version][npm-image]][npm-url]
[npm-url]: https://www.npmjs.com/package/cs-node-sdk

Documents: https://help.aliyun.com/document_detail/26043.html?spm=a2c4g.11186623.6.940.p7WsUj

## API Spec

See: https://help.aliyun.com/document_detail/27475.html

## Test

```sh
ACCESS_KEY_ID=<ACCESS_KEY_ID> ACCESS_KEY_SECRET=<ACCESS_KEY_SECRET> npm run test
```

## Installation

You can install it via npm/cnpm/yarn.

```sh
$ npm install cs-node-sdk --save
```

## Usage

```js

const Client = require('cs-node-sdk');

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