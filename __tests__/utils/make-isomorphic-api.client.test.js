/**
 * @jest-environment jsdom
 */
import { it, expect, describe, jest } from '@jest/globals';
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

const api = {
  method1() {
    return method1.mockImplementation(() => api).call(api);
  },
  method2() {
    return method2.mockImplementation(() => api).call(api);
  },
  method3() {
    return method3.mockImplementation(() => api).call(api);
  },
  method4() {
    return method4.mockImplementation(() => api).call(api);
  },
  method5() {
    return method5.mockImplementation(() => api).call(api);
  },
  method6() {
    return method6.mockImplementation(() => api).call(api);
  },
  method7() {
    return method7.mockImplementation(() => api).call(api);
  },
  method8() {
    return method8.mockImplementation(() => api).call(api);
  },
};

describe('makeIsomorphicAPI', () => {
  it('should be a client', () => {
    expect(IS_CLIENT).toBe(true);
    expect(IS_SERVER).toBe(false);
  });

  it('should call only both or client side methods and ignore server side', () => {
    const isomorphicAPI = makeIsomorphicAPI(api);

    isomorphicAPI
      .method1() // called
      .method2() // called
      .server //
      .method3() // ignored
      .method4() // ignored
      .client //
      .method5() // called
      .method6() // called
      .server //
      .method7() // ignored
      .method8(); // ignored

    expect(method1).toHaveBeenCalledTimes(1);
    expect(method2).toHaveBeenCalledTimes(1);
    expect(method3).toHaveBeenCalledTimes(0);
    expect(method4).toHaveBeenCalledTimes(0);
    expect(method5).toHaveBeenCalledTimes(1);
    expect(method6).toHaveBeenCalledTimes(1);
    expect(method7).toHaveBeenCalledTimes(0);
    expect(method8).toHaveBeenCalledTimes(0);

    expect(method1.mock.contexts).toStrictEqual([api]);
    expect(method2.mock.contexts).toStrictEqual([api]);
    expect(method5.mock.contexts).toStrictEqual([api]);
    expect(method6.mock.contexts).toStrictEqual([api]);
  });

  it('should return the original api if client and before the first addressing to the .server prop', () => {
    const isomorphicAPI = makeIsomorphicAPI(api, { redefine: true });

    expect(isomorphicAPI).toBe(api);
    expect(isomorphicAPI.method1().method2()).toBe(api);

    expect(isomorphicAPI.server.method1().method2()).not.toBe(api);
    expect(isomorphicAPI.method1().server.method2()).not.toBe(api);
    expect(isomorphicAPI.method1().method2().server).not.toBe(api);

    expect(isomorphicAPI.client.method1().method2()).toBe(api);
    expect(isomorphicAPI.method1().client.method2()).toBe(api);
    expect(isomorphicAPI.method1().method2().client).toBe(api);
  });
});
