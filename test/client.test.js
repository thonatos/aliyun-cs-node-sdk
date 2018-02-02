'use strict';

const expect = require('expect.js');
const Client = require('../');

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID || 'accessKeyId';
const ACCESS_KEY_SECRET = process.env.ACCESS_KEY_SECRET || 'accessKeySecret';
const REGION = process.env.REGION || 'region';

describe('client test', function() {
  it('constructor', function() {
    expect(() => {
      new Client();
    }).to.throwException(/must pass in "opts"/);

    expect(() => {
      new Client({});
    }).to.throwException(/must pass in "opts.accessKeyId"/);

    expect(() => {
      new Client({
        accessKeyId: 'accessKeyID',
      });
    }).to.throwException(/must pass in "opts.accessKeySecret"/);

    expect(() => {
      new Client({
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
      });
    }).to.throwException(/must pass in "opts.region"/);

    var client;

    client = new Client({
      accessKeyId: 'accessKeyId',
      accessKeySecret: 'accessKeySecret',
      region: 'cn-hangzhou',
    });
    expect(client.endpoint).to.be('http://cs.aliyuncs.com');

    client = new Client({
      accessKeyId: 'accessKeyId',
      accessKeySecret: 'accessKeySecret',
      region: 'cn-hangzhou',
      secure: true,
    });
    expect(client.endpoint).to.be('https://cs.aliyuncs.com');
  });

  it('list images with invalid accessKeyId', async function() {
    const client = new Client({
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: ACCESS_KEY_SECRET,
      region: REGION,
      secure: true,
    });

    try {
      await client.getImages();
    } catch (ex) {
      expect(ex.code).to.be(404);
      expect(ex.info).to.be('ACS: InvalidAccessKeyId.NotFound');
    }
  });
});
