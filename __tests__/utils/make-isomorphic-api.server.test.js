import { it, expect, describe, jest, beforeEach } from '@jest/globals';
import { IS_CLIENT, IS_SERVER } from '../../src/utils/getenv.js';
import makeIsomorphicAPI from '../../src/utils/make-isomorphic-api.js';

const method1 = jest.fn();
const method2 = jest.fn();
const method3 = jest.fn();
const method4 = jest.fn();
const method5 = jest.fn();
const method6 = jest.fn();
const method7 = jest.fn();
const method8 = jest.fn();

let api = {};

describe('makeIsomorphicAPI', () => {
  beforeEach(() => {
    api = {
      method1() {
        return method1.mockImplementation(() => this).call(this);
      },
      method2() {
        return method2.mockImplementation(() => this).call(this);
      },
      method3() {
        return method3.mockImplementation(() => this).call(this);
      },
      method4() {
        return method4.mockImplementation(() => this).call(this);
      },
      method5() {
        return method5.mockImplementation(() => this).call(this);
      },
      method6() {
        return method6.mockImplementation(() => this).call(this);
      },
      method7() {
        return method7.mockImplementation(() => this).call(this);
      },
      method8() {
        return method8.mockImplementation(() => this).call(this);
      },
    };
  });

  it('should be a server', () => {
    expect(IS_CLIENT).toBe(false);
    expect(IS_SERVER).toBe(true);
  });

  it('should call only both or server side methods and ignore client side', () => {
    const isomorphicAPI = makeIsomorphicAPI(api);

    isomorphicAPI
      .method1() // called
      .method2() // called
      .client //
      .method3() // ignored
      .method4() // ignored
      .server //
      .method5() // called
      .method6() // called
      .client //
      .method7() // ignored
      .method8() // ignored
      .server //
      .method1() // called
      .method2() // called
      .client //
      .method3() // ignored
      .method4() // ignored
      .server //
      .method7() // called
      .method8(); // called

    isomorphicAPI.client //
      .method3() // ignored
      .method4() // ignored
      .server //
      .method1() // called
      .method2(); // called

    // [
    //   isomorphicAPI.client.method3,
    //   isomorphicAPI.client.method4,
    //   isomorphicAPI.server.method5,
    //   isomorphicAPI.server.method6,
    // ].map(fn => fn()).map(console.log); // !!! all ignored

    isomorphicAPI.server //
      .method5() // called
      .method6(); // called

    expect(method1).toHaveBeenCalledTimes(3);
    expect(method2).toHaveBeenCalledTimes(3);
    expect(method3).toHaveBeenCalledTimes(0);
    expect(method4).toHaveBeenCalledTimes(0);
    expect(method5).toHaveBeenCalledTimes(2);
    expect(method6).toHaveBeenCalledTimes(2);
    expect(method7).toHaveBeenCalledTimes(1);
    expect(method8).toHaveBeenCalledTimes(1);

    expect(method1.mock.contexts).toStrictEqual([api, api, api]);
    expect(method2.mock.contexts).toStrictEqual([api, api, api]);
    expect(method5.mock.contexts).toStrictEqual([api, api]);
    expect(method6.mock.contexts).toStrictEqual([api, api]);
    expect(method7.mock.contexts).toStrictEqual([api]);
    expect(method8.mock.contexts).toStrictEqual([api]);
  });

  it('should return the original api if server and before the first addressing to the .client prop', () => {
    const isomorphicAPI = makeIsomorphicAPI(api, { redefine: true });

    expect(isomorphicAPI).toBe(api);
    expect(isomorphicAPI.method1().method2()).toBe(api);

    expect(isomorphicAPI.server.method1().method2()).toBe(api);
    expect(isomorphicAPI.method1().server.method2()).toBe(api);
    expect(isomorphicAPI.method1().method2().server).toBe(api);

    expect(isomorphicAPI.client.method1().method2()).not.toBe(api);
    expect(isomorphicAPI.method1().client.method2()).not.toBe(api);
    expect(isomorphicAPI.method1().method2().client).not.toBe(api);

    expect(isomorphicAPI.isomorphic.method1().method2()).toBe(api);
    expect(isomorphicAPI.method1().isomorphic.method2()).toBe(api);
    expect(isomorphicAPI.method1().method2().isomorphic).toBe(api);
  });

  it('should return the inheriting object', () => {
    const isomorphicAPI = makeIsomorphicAPI(api, { redefine: true });
    const descendant = Object.create(isomorphicAPI);

    expect(descendant.isomorphic).not.toBe(api);
    expect(descendant.isomorphic).toBe(descendant);

    expect(descendant.server.method1().method2()).toBe(descendant);
    expect(descendant.method1().server.method2()).toBe(descendant);
    expect(descendant.method1().method2().server).toBe(descendant);

    expect(descendant.client.method1().method2()).not.toBe(api);
    expect(descendant.method1().client.method2()).not.toBe(api);
    expect(descendant.method1().method2().client).not.toBe(api);

    expect(descendant.client.method1().method2()).not.toBe(descendant);
    expect(descendant.method1().client.method2()).not.toBe(descendant);
    expect(descendant.method1().method2().client).not.toBe(descendant);

    expect(descendant.isomorphic.method1().method2()).toBe(descendant);
    expect(descendant.method1().isomorphic.method2()).toBe(descendant);
    expect(descendant.method1().method2().isomorphic).toBe(descendant);

    expect(descendant.client.isomorphic.method1().method2()).toBe(descendant);
    expect(descendant.client.method1().isomorphic.method2()).toBe(descendant);
    expect(descendant.method1().client.method2().isomorphic).toBe(descendant);
  });

  it('should throw an error because of existing same prop names', () => {
    api.server = undefined;
    expect(() => makeIsomorphicAPI(api)).toThrow();

    delete api.server;
    expect(() => makeIsomorphicAPI(api)).not.toThrow();

    expect(() => makeIsomorphicAPI(api)).toThrow();

    delete api.server;
    delete api.client;
    delete api.isomorphic;
    expect(() => makeIsomorphicAPI(api)).not.toThrow();

    delete api.server;
    delete api.client;
    delete api.isomorphic;
    api.srvr = undefined;
    expect(() => makeIsomorphicAPI(api, { serverPropName: 'srvr' })).toThrow();

    delete api.srvr;
    expect(() =>
      makeIsomorphicAPI(api, { serverPropName: 'srvr' }),
    ).not.toThrow();

    api.clnt = undefined;
    expect(() => makeIsomorphicAPI(api, { clientPropName: 'clnt' })).toThrow();

    delete api.server;
    delete api.clnt;
    delete api.isomorphic;
    expect(() =>
      makeIsomorphicAPI(api, { clientPropName: 'clnt' }),
    ).not.toThrow();

    expect(() => makeIsomorphicAPI(api)).toThrow();
    expect(() => makeIsomorphicAPI(api, { redefine: true })).not.toThrow();
  });
});
