'use strict';

// https://help.aliyun.com/document_detail/40654.html?spm=a2c4g.11186623.2.3.HVXY0e
exports.getRegionId = opts => {
  return opts.region;
};

exports.getEndpoint = opts => {
  const protocol = opts.secure ? 'https' : 'http';
  return {
    domain: 'cs.aliyuncs.com',
    endpoint: `${protocol}://cs.aliyuncs.com`,
  };
};

exports.getCanonicalizedHeaders = (headers, prefix = '') => {
  return Object.keys(headers)
    .filter(key => key.startsWith(prefix))
    .sort()
    .map(key => `${key}:${headers[key]}\n`)
    .join('');
};
