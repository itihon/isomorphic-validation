import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import ObserverAnd from '../../src/types/observer-and.js';
/*
    1  2  3    4  5  6
     \ | / \    \ | /
      123   \    456
         \   \  /
          123456
*/
describe('ObserverAnd', () => {
  const o1 = ObserverAnd(true);
  const o2 = ObserverAnd();
  const o3 = ObserverAnd();
  const o4 = ObserverAnd();
  const o5 = ObserverAnd();
  const o6 = ObserverAnd();
  const o123 = ObserverAnd();
  const o456 = ObserverAnd(true);
  const o123456 = ObserverAnd();

  const o1cb = jest.fn();
  const o2cb = jest.fn();
  const o3cb = jest.fn();
  const o4cb = jest.fn();
  const o5cb = jest.fn();
  const o6cb = jest.fn();
  const o123cb = jest.fn();
  const o456cb = jest.fn();
  const o123456cb = jest.fn();

  o1.onChanged(o1cb);
  o2.onChanged(o2cb);
  o3.onChanged(o3cb);
  o4.onChanged(o4cb);
  o5.onChanged(o5cb);
  o6.onChanged(o6cb);
  o123.onChanged(o123cb);
  o456.onChanged(o456cb);
  o123456.onChanged(o123456cb);

  jest.spyOn(o1, 'update');
  jest.spyOn(o2, 'update');
  jest.spyOn(o3, 'update');
  jest.spyOn(o4, 'update');
  jest.spyOn(o5, 'update');
  jest.spyOn(o6, 'update');
  jest.spyOn(o123, 'update');
  jest.spyOn(o456, 'update');
  jest.spyOn(o123456, 'update');

  jest.spyOn(o1, 'onChanged');
  jest.spyOn(o2, 'onChanged');
  jest.spyOn(o3, 'onChanged');
  jest.spyOn(o4, 'onChanged');
  jest.spyOn(o5, 'onChanged');
  jest.spyOn(o6, 'onChanged');
  jest.spyOn(o123, 'onChanged');
  jest.spyOn(o456, 'onChanged');
  jest.spyOn(o123456, 'onChanged');

  describe('IDs', () => {
    it('should be in the following order', () => {
      expect(o1.getID()).toBe(1);
      expect(o2.getID()).toBe(2);
      expect(o3.getID()).toBe(3);
      expect(o4.getID()).toBe(4);
      expect(o5.getID()).toBe(5);
      expect(o6.getID()).toBe(6);
      expect(o123.getID()).toBe(7);
      expect(o456.getID()).toBe(8);
      expect(o123456.getID()).toBe(9);
    });
  });

  describe('initVal', () => {
    it("should change own value after subscribing according to subject's value", () => {
      expect(o1.getValue()).toBe(true);
      expect(o123.getValue()).toBe(false);
      expect(o123.subscribe(o1).getValue()).toBe(true);
      expect(o123.update).toHaveBeenCalledTimes(2);
      expect(o123cb).toHaveBeenCalledTimes(1);

      expect(o123456.subscribe(o123).getValue()).toBe(true);
      expect(o123456.update).toHaveBeenCalledTimes(2);
      expect(o123456cb).toHaveBeenCalledTimes(1);

      expect(o456.getValue()).toBe(true);
      o456.update(false);
      expect(o456.getValue()).toBe(false);
      o456.update(true);
      expect(o456.getValue()).toBe(true);
      expect(o456.subscribe(o4).getValue()).toBe(false);
      expect(o456cb).toHaveBeenCalledTimes(3);
    });
  });

  describe('subscribe', () => {
    it('should ignore setting self value after subscribing to another subject', () => {
      // unsubscribed
      expect(o2.getValue()).toBe(false);
      expect(o2.update(true)).toBe(true);
      expect(o2.getValue()).toBe(true);
      expect(o2cb).toHaveBeenCalledTimes(1);

      // subscribed
      expect(o123.getValue()).toBe(true);
      expect(o123.update(false)).toBe(true);
      expect(o123.getValue()).toBe(true);
      expect(o123cb).toHaveBeenCalledTimes(1);
      expect(o123456.update).toHaveBeenCalledTimes(2);
    });

    it('should be impossible to update value with unsubscribed id', () => {
      // o123 subscribed only to o1
      expect(o123.getValue()).toBe(true);
      expect(o123.update(false, undefined, 1)).toBe(false);
      expect(o123.getValue()).toBe(false);
      expect(o123cb).toHaveBeenCalledTimes(2);
      expect(o123456.update).toHaveBeenCalledTimes(3);

      expect(o123.update(true, undefined, 0)).toBe(false);
      expect(o123.update(true, undefined, 2)).toBe(false);
      expect(o123.update(true, undefined, 3)).toBe(false);
      expect(o123.update(true, undefined, -3)).toBe(false);
      expect(o123.update(true, undefined, -1)).toBe(false);
      expect(o123.update(true, undefined, -0)).toBe(false);
      expect(o123.update(true, undefined, 7)).toBe(false);
      expect(o123.update(true, undefined, -7)).toBe(false);
      expect(o123.update(true, undefined, 14)).toBe(false);
      expect(o123.update(true, undefined, -14)).toBe(false);
      expect(o123.getValue()).toBe(false);
      expect(o123cb).toHaveBeenCalledTimes(2);

      expect(o123.update(true, undefined, 1)).toBe(true);
      expect(o123.getValue()).toBe(true);
      expect(o123cb).toHaveBeenCalledTimes(3);
      expect(o123456.update).toHaveBeenCalledTimes(4);
    });

    it('should be impossible to subscribe to the same subject more than once', () => {
      // o123 is still subscribed only to o1
      expect(o123.update).toHaveBeenCalledTimes(15);

      // subscribe calls this.update and passes this.update to subject's onChanged
      o123.subscribe(o1);
      o123.subscribe(o1);
      o123.subscribe(o1);
      o123.subscribe(o1);
      expect(o123.update).toHaveBeenCalledTimes(15);
      expect(o1.onChanged).toHaveBeenCalledTimes(1);

      o1.update(false);
      expect(o123.update).toHaveBeenCalledTimes(16);
      expect(o123456.update).toHaveBeenCalledTimes(5);

      o1.update(true);
      expect(o123.update).toHaveBeenCalledTimes(17);
      expect(o123456.update).toHaveBeenCalledTimes(6);
    });

    it('should be more than one observer subscribed to another one', () => {
      expect(o123456.getValue()).toBe(true);
      expect(o3.getValue()).toBe(false);

      o123456.subscribe(o3);

      expect(o123456.getValue()).toBe(false);
      expect(o123456.update).toHaveBeenCalledTimes(7);
      expect(o123.getValue()).toBe(true);

      o123.subscribe(o3);

      expect(o123.getValue()).toBe(false);
      expect(o123.update).toHaveBeenCalledTimes(18);
      expect(o123456.update).toHaveBeenCalledTimes(8);

      o3.update(true);
      expect(o123.getValue()).toBe(true);
      expect(o123456.getValue()).toBe(true);
      expect(o123.update).toHaveBeenCalledTimes(19);
      expect(o123456.update).toHaveBeenCalledTimes(10);
    });

    it('should not subscribe to oneself', () => {
      expect(() => o4.subscribe(o4)).toThrowError('Self subscription');
      expect(o4.update).toHaveBeenCalledTimes(0);

      expect(() => o123.subscribe(o123)).toThrowError('Self subscription');
      expect(o123.update).toHaveBeenCalledTimes(19);
    });

    it('should not allow cyclic subscriptions', () => {
      expect(() => o1.subscribe(o123)).toThrowError('Cyclic subscription');
      expect(o1.update).toHaveBeenCalledTimes(2);

      expect(() => o1.subscribe(o123456)).toThrowError('Cyclic subscription');
      expect(o1.update).toHaveBeenCalledTimes(2);

      expect(() => o123.subscribe(o123456)).toThrowError('Cyclic subscription');
      expect(o123.update).toHaveBeenCalledTimes(19);
    });
  });

  describe('onChanged and onChanged callback', () => {
    beforeAll(() => {
      o123.subscribe(o1).subscribe(o2).subscribe(o3);

      o456.subscribe(o4).subscribe(o5).subscribe(o6);

      o123456.subscribe(o123).subscribe(o456);

      o123456.subscribe(o3);

      o1.update(false);
      o2.update(false);
      o3.update(false);
      o4.update(false);
      o5.update(false);
      o6.update(false);

      o1cb.mockClear();
      o2cb.mockClear();
      o3cb.mockClear();
      o4cb.mockClear();
      o5cb.mockClear();
      o6cb.mockClear();
      o123cb.mockClear();
      o456cb.mockClear();
      o123456cb.mockClear();

      o1.update.mockClear();
      o2.update.mockClear();
      o3.update.mockClear();
      o4.update.mockClear();
      o5.update.mockClear();
      o6.update.mockClear();
      o123.update.mockClear();
      o456.update.mockClear();
      o123456.update.mockClear();
    });

    it('should be called only once except for o3 and o123456', () => {
      expect(o1.onChanged).toHaveBeenCalledTimes(1);
      expect(o2.onChanged).toHaveBeenCalledTimes(1);
      expect(o3.onChanged).toHaveBeenCalledTimes(2);
      expect(o4.onChanged).toHaveBeenCalledTimes(1);
      expect(o5.onChanged).toHaveBeenCalledTimes(1);
      expect(o6.onChanged).toHaveBeenCalledTimes(1);
      expect(o123.onChanged).toHaveBeenCalledTimes(1);
      expect(o456.onChanged).toHaveBeenCalledTimes(1);
      expect(o123456.onChanged).toHaveBeenCalledTimes(0);
    });

    it('should be called only when the set value changes', () => {
      o1.update(true);

      expect(o1cb).toHaveBeenCalledTimes(1);
      expect(o123.update).toHaveBeenCalledTimes(1);

      expect(o123cb).toHaveBeenCalledTimes(0);
      expect(o123456.update).toHaveBeenCalledTimes(0);

      o2.update(true);

      expect(o2cb).toHaveBeenCalledTimes(1);
      expect(o123.update).toHaveBeenCalledTimes(2);

      expect(o123cb).toHaveBeenCalledTimes(0);
      expect(o123456.update).toHaveBeenCalledTimes(0);

      o3.update(true);

      expect(o3cb).toHaveBeenCalledTimes(1);
      expect(o123.update).toHaveBeenCalledTimes(3);

      expect(o123cb).toHaveBeenCalledTimes(1);
      expect(o123456.update).toHaveBeenCalledTimes(2);

      // same value, call times haven't change
      o1.update(true);
      o2.update(true);
      o3.update(true);
      expect(o1cb).toHaveBeenCalledTimes(1);
      expect(o2cb).toHaveBeenCalledTimes(1);
      expect(o3cb).toHaveBeenCalledTimes(1);
      expect(o123cb).toHaveBeenCalledTimes(1);
      expect(o123.update).toHaveBeenCalledTimes(3);
      expect(o123456.update).toHaveBeenCalledTimes(2);

      o4.update(true, 'o4 is updating');

      expect(o4cb).toHaveBeenCalledTimes(1);
      expect(o456.update).toHaveBeenCalledTimes(1);

      expect(o456cb).toHaveBeenCalledTimes(0);
      expect(o123456.update).toHaveBeenCalledTimes(2);

      o5.update(true, 'o5 is updating');

      expect(o5cb).toHaveBeenCalledTimes(1);
      expect(o456.update).toHaveBeenCalledTimes(2);

      expect(o456cb).toHaveBeenCalledTimes(0);
      expect(o123456.update).toHaveBeenCalledTimes(2);

      o6.update(true, 'o6 is updating');

      expect(o6cb).toHaveBeenCalledTimes(1);
      expect(o456.update).toHaveBeenCalledTimes(3);

      expect(o456cb).toHaveBeenCalledTimes(1);
      expect(o123456.update).toHaveBeenCalledTimes(3);

      expect(o123456cb).toHaveBeenCalledTimes(1);
      expect(o123456.getValue()).toBe(true);

      o3.update(false, 'o3 is updating');

      expect(o3cb).toHaveBeenCalledTimes(2);
      expect(o123.update).toHaveBeenCalledTimes(4);

      expect(o123cb).toHaveBeenCalledTimes(2);
      expect(o123456.update).toHaveBeenCalledTimes(5);

      expect(o123456cb).toHaveBeenCalledTimes(2);
      expect(o123456.getValue()).toBe(false);
    });
  });

  it('should be arguments passed to on changed callbacks', () => {
    expect(o456.update.mock.calls).toStrictEqual([
      [true, 'o4 is updating', 4],
      [true, 'o5 is updating', 5],
      [true, 'o6 is updating', 6],
    ]);

    expect(o123456.update.mock.calls).toStrictEqual([
      [true, undefined, 3],
      [true, undefined, 7],
      [true, 'o6 is updating', 8],
      [false, 'o3 is updating', 3],
      [false, 'o3 is updating', 7],
    ]);
  });
});
