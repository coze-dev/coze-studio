import { type SlardarInstance } from '@coze-studio/slardar-interface';

const noop = () => {
  // do nothing
};
const mockSlardar = noop;

const proxyHandler = {
  get(target, prop, receiver) {
    return mockSlardar[prop] || noop;
  },
  apply(target, thisArg, argumentsList: unknown[]) {
    return mockSlardar(...(argumentsList as Parameters<typeof mockSlardar>));
  },
};

const proxy = new Proxy(function () {
  // do nothing
}, proxyHandler);

export default proxy as SlardarInstance;
