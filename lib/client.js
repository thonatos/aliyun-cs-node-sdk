'use strict';

const assert = require('assert');
const debug = require('debug')('cs:client');
const httpx = require('httpx');
const kitx = require('kitx');

const {
  getRegionId,
  getEndpoint,
  getCanonicalizedHeaders,
} = require('./helper');

class Client {
  constructor(opts) {
    assert(opts, 'must pass in "opts"');

    assert(opts.accessKeyId, 'must pass in "opts.accessKeyId"');
    this.accessKeyId = opts.accessKeyId;

    assert(opts.accessKeySecret, 'must pass in "opts.accessKeySecret"');
    this.accessKeySecret = opts.accessKeySecret;

    assert(opts.region, 'must pass in "opts.region"');
    this.regionId = getRegionId(opts);

    const { domain, endpoint } = getEndpoint(opts);
    this.endpoint = endpoint;
    this.endpointDomain = domain;
  }

  sign(verb, headers, resource) {
    const accept = headers['accept'] || '';
    const md5 = headers['content-md5'] || '';
    const type = headers['content-type'] || '';
    const date = headers['date'];
    const canonicalizedHeaders = getCanonicalizedHeaders(headers, 'x-acs-');
    const toSignString = `${verb}\n${accept}\n${md5}\n${type}\n${date}\n${canonicalizedHeaders}${resource}`;
    // Signature = base64(hmac-sha1(VERB + "\n"
    //             + ACCEPT + "\n"
    //             + CONTENT-MD5 + "\n"
    //             + CONTENT-TYPE + "\n"
    //             + DATE + "\n"
    //             + CanonicalizedHeaders
    //             + CanonicalizedResource))
    const buff = Buffer.from(toSignString, 'utf8');
    const degist = kitx.sha1(buff, this.accessKeySecret, 'binary');
    return Buffer.from(degist, 'binary').toString('base64');
  }

  buildHeaders(method, body, resource, customHeaders = {}) {
    const date = new Date().toGMTString();
    const headers = {
      date: date,
      accept: 'application/json',
      host: this.endpointDomain,
      'x-acs-version': '2015-12-15',
      'x-acs-region-id': this.regionId,
      'x-acs-signature-nonce': ~~(Math.random() * 1000) + '',
      'x-acs-signature-method': 'HMAC-SHA1',
    };

    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = 'application/json';
      const digest = kitx.md5(body, 'hex');
      const md5 = Buffer.from(digest, 'utf8').toString('base64');
      Object.assign(headers, {
        'content-length': body.length,
        'content-type': contentType,
        'content-md5': md5,
      });
    }

    Object.assign(headers, customHeaders);

    const signature = this.sign(method, headers, resource);

    headers['authorization'] = `acs ${this.accessKeyId}:${signature}`;

    return headers;
  }

  async request(method, resource, requestBody = undefined, opts = {}) {
    const url = `${this.endpoint}${resource}`;

    debug('url: %s', url);
    debug('method: %s', method);

    const headers = this.buildHeaders(
      method,
      requestBody,
      resource,
      opts.headers
    );

    debug('request headers: %j', headers);
    debug('request body: %s', requestBody);

    const response = await httpx.request(
      url,
      Object.assign(opts, {
        method: method,
        headers: headers,
        data: requestBody,
      })
    );

    debug('statusCode %s', response.statusCode);
    debug('response headers: %j', response.headers);

    const code = response.statusCode;
    const contentType = response.headers['content-type'] || '';
    debug('response contentType: %s', contentType);

    // const contentLength = response.headers['content-length'];
    const responseBody = await httpx.read(response, 'utf8');
    debug('response body: %s', responseBody);

    const responseJson = JSON.parse(responseBody) || {};
    debug('response json: %s', responseJson);

    if (code !== 200 && responseJson) {
      const err = new Error(
        JSON.stringify({
          code,
          message: responseJson,
        })
      );
      err.code = code;
      err.info = 'ACS: ' + responseJson['Code'];
      throw err;
    }

    return {
      code,
      headers: response.headers,
      body: responseJson,
    };
  }

  get(resource, opts = {}) {
    return this.request('GET', resource, undefined, opts);
  }

  put(resource, body, opts = {}) {
    return this.request('PUT', resource, body, opts);
  }

  post(resource, body) {
    return this.request('POST', resource, body);
  }

  delete(resource) {
    return this.request('DELETE', resource, undefined);
  }

  // cluster api
  getImages() {
    return this.get('/images');
  }

  getClusters() {
    return this.get('/clusters');
  }

  getCluster(clusterId) {
    return this.get(`/clusters/${clusterId}`);
  }

  getClusterCerts(clusterId) {
    return this.get(`/clusters/${clusterId}/certs`);
  }

  deleteCluster(clusterId) {
    return this.delete(`/clusters/${clusterId}`);
  }

  // https://help.aliyun.com/document_detail/26058.html?spm=a2c4g.11186623.6.955.wkfMWd
  // body = {
  //   "password": "ECS实例root登录密码",
  //   "instance_type": "实例规格",
  //   "size": "扩容到节点数",
  //   "data_disk_category": "系统盘类型",
  //   "data_disk_size": "系统盘大小",
  //   "ecs_image_id": "操作系统镜像",
  //   "io_optimized": "是否IO优化",
  //   "release_eip_flag": "是否需要在集群配置完成后释放EIP"
  // }
  scaleCluster(clusterId, body) {
    return this.put(`/clusters/${clusterId}`, body);
  }

  // https://help.aliyun.com/document_detail/65092.html?spm=a2c4g.11186623.6.956.ozuUkN
  // body = {
  //   "password": "ECS实例root登录密码",
  //   "instances": "要添加的实例数组",
  //   "ecs_image_id": "操作系统镜像",
  //   "release_eip_flag": "是否需要在集群配置完成后释放EIP"
  // }
  attachCluster(clusterId, body) {
    return this.post(`/clusters/${clusterId}/attach`, body);
  }

  // https://help.aliyun.com/document_detail/65095.html?spm=a2c4g.11186623.6.957.a8su0k
  releaseClusterInstance(clusterId, ip, releaseInstance = false) {
    return this.delete(
      `/clusters/${clusterId}/ip/${ip}?releaseInstance=${releaseInstance}`
    );
  }

  // https://help.aliyun.com/document_detail/65090.html?spm=a2c4g.11186623.6.959.ifL7Ti
  // body = {
  //   "password": "ECS实例root登录密码",
  //   "ecs_image_id": "操作系统镜像",
  //   "release_eip_flag": "是否需要在集群配置完成后释放EIP"
  // }
  resetClusterInstance(clusterId, instanceId, body) {
    return this.post(
      `  /clusters/${clusterId}/instances/${instanceId}/reset`,
      body
    );
  }
}

module.exports = Client;
