import { it, describe, jest, expect, beforeEach } from '@jest/globals';
import { Validation } from '../../src/index.js';

const a = { value: 'obj a' };
const b = { value: 'obj b' };
const d = { value: 'obj d' };
const e = { value: 'obj e' };
const g = { value: 'obj g' };
const h = { value: 'obj h' };

const Va = Validation(a);
const Vb = Validation(b);
const Vd1 = Validation(d); // different instances of Validaton assossiated with the same object
const Vd2 = Validation(d); // different instances of Validaton assossiated with the same object
const Ve = Validation(e);
const Vg = Validation(g);
const Vh = Validation(h);

const VC = Validation.group([Va, Vb]);
const VJ = Validation.group([Vb, Vd1, Vd2]);
const VK = Validation.glue([Ve, Vg]);
const VF = Validation.group([VC, VJ, Ve, Vh]);
const VI = Validation.group([VF, VK, Vh]);

const predicates = {
  P1a: jest.fn(() => true),
  P2a: jest.fn(() => true),

  P1b: jest.fn(() => true),
  P2b: jest.fn(() => true),

  P1d1: jest.fn(() => true),
  P2d1: jest.fn(() => true),

  P1d2: jest.fn(() => true),
  P2d2: jest.fn(() => true),

  P1e: jest.fn(() => true),
  P2e: jest.fn(() => true),

  P1g: jest.fn(() => true),
  P2g: jest.fn(() => true),

  P1h: jest.fn(() => true),
  P2h: jest.fn(() => true),

  P1c: jest.fn(() => true),
  P2c: jest.fn(() => true),

  P1j: jest.fn(() => true),
  P2j: jest.fn(() => true),

  P1k: jest.fn(() => true),
  P2k: jest.fn(() => true),

  P1f: jest.fn(() => true),
  P2f: jest.fn(() => true),

  P1i: jest.fn(() => true),
  P2i: jest.fn(() => true),
};

(function addFnName() {
  Object.keys(predicates).forEach((fnName) =>
    Object.defineProperty(predicates[fnName], 'name', { value: fnName }),
  );
})();

Va.constraint(predicates.P1a).constraint(predicates.P2a);
Vb.constraint(predicates.P1b).constraint(predicates.P2b);
Vd1.constraint(predicates.P1d1).constraint(predicates.P2d1);
Vd2.constraint(predicates.P1d2).constraint(predicates.P2d2);
Ve.constraint(predicates.P1e).constraint(predicates.P2e);
Vg.constraint(predicates.P1g).constraint(predicates.P2g);
Vh.constraint(predicates.P1h).constraint(predicates.P2h);
VC.constraint(predicates.P1c).constraint(predicates.P2c);
VJ.constraint(predicates.P1j).constraint(predicates.P2j);
VK.constraint(predicates.P1k).constraint(predicates.P2k);
VF.constraint(predicates.P1f).constraint(predicates.P2f);
VI.constraint(predicates.P1i).constraint(predicates.P2i);

function predicateNames(validation, obj) {
  return [
    ...(validation.constraints.get(obj) ||
      [...validation.constraints.values()].map((set) => [...set])),
  ]
    .flat(2)
    .map((p) => p[Symbol.toStringTag]);
}

function fnNames(fns = []) {
  return fns.map((fn) => fn.name);
}

const predicateNamesVa = fnNames([
  predicates.P1a,
  predicates.P2a,
  predicates.P1c,
  predicates.P2c,
  predicates.P1f,
  predicates.P2f,
  predicates.P1i,
  predicates.P2i,
]);

const predicateNamesVb = fnNames([
  predicates.P1b,
  predicates.P2b,
  predicates.P1c,
  predicates.P2c,
  predicates.P1j,
  predicates.P2j,
  predicates.P1f,
  predicates.P2f,
  predicates.P1i,
  predicates.P2i,
]);

const predicateNamesVd1 = fnNames([
  predicates.P1d1,
  predicates.P2d1,
  predicates.P1j,
  predicates.P2j,
  predicates.P1f,
  predicates.P2f,
  predicates.P1i,
  predicates.P2i,
]);

const predicateNamesVd2 = fnNames([
  predicates.P1d2,
  predicates.P2d2,
  predicates.P1j,
  predicates.P2j,
  predicates.P1f,
  predicates.P2f,
  predicates.P1i,
  predicates.P2i,
]);

const predicateNamesVe = fnNames([
  predicates.P1e,
  predicates.P2e,
  predicates.P1k,
  predicates.P2k,
  predicates.P1f,
  predicates.P2f,
  predicates.P1i,
  predicates.P2i,
]);

const predicateNamesVg = fnNames([
  predicates.P1g,
  predicates.P2g,
  predicates.P1k,
  predicates.P2k,
  predicates.P1i,
  predicates.P2i,
]);

const predicateNamesVh = fnNames([
  predicates.P1h,
  predicates.P2h,
  predicates.P1f,
  predicates.P2f,
  predicates.P1i,
  predicates.P2i,
]);

describe('grouping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('nesting', () => {
    it('should include nested validations', () => {
      expect([...VC.validations]).toStrictEqual([Va, Vb]);
      expect([...VJ.validations]).toStrictEqual([Vb, Vd1, Vd2]);
      expect([...VK.validations]).toStrictEqual([Ve, Vg]);
      expect([...VF.validations]).toStrictEqual([VC, VJ, Ve, Vh]);
      expect([...VI.validations]).toStrictEqual([VF, VK, Vh]);
    });

    it('should include own predicates along with the predicates from outer levels', () => {
      expect(predicateNames(Va, a)).toStrictEqual(predicateNamesVa);

      expect(predicateNames(Vb, b)).toStrictEqual(predicateNamesVb);

      expect(predicateNames(Vd1, d)).toStrictEqual(predicateNamesVd1);

      expect(predicateNames(Vd2, d)).toStrictEqual(predicateNamesVd2);

      expect(predicateNames(Ve, e)).toStrictEqual(predicateNamesVe);

      expect(predicateNames(Vg, g)).toStrictEqual(predicateNamesVg);

      expect(predicateNames(Vh, h)).toStrictEqual(predicateNamesVh);
    });

    it('should include nested predicate groups', () => {
      expect(predicateNames(VC)).toStrictEqual([
        ...predicateNamesVa,
        ...predicateNamesVb,
      ]);

      expect(predicateNames(VC)).toStrictEqual([
        ...predicateNames(VC, a),
        ...predicateNames(VC, b),
      ]);

      expect(predicateNames(VJ)).toStrictEqual([
        ...predicateNamesVb,
        ...predicateNamesVd1,
        ...predicateNamesVd2,
      ]);

      expect(predicateNames(VJ)).toStrictEqual([
        ...predicateNames(VJ, b),
        ...predicateNames(VJ, d),
      ]);

      expect(predicateNames(VK)).toStrictEqual([
        ...predicateNamesVe,
        ...predicateNamesVg,
      ]);

      expect(predicateNames(VK)).toStrictEqual([
        ...predicateNames(VK, e),
        ...predicateNames(VK, g),
      ]);

      expect(predicateNames(VF)).toStrictEqual([
        ...predicateNamesVa,
        ...predicateNamesVb,
        ...predicateNamesVd1,
        ...predicateNamesVd2,
        ...predicateNamesVe,
        ...predicateNamesVh,
      ]);

      expect(predicateNames(VF)).toStrictEqual([
        ...predicateNames(VF, a),
        ...predicateNames(VF, b),
        ...predicateNames(VF, d),
        ...predicateNames(VF, e),
        ...predicateNames(VF, h),
      ]);

      expect(predicateNames(VI)).toStrictEqual([
        ...predicateNamesVa,
        ...predicateNamesVb,
        ...predicateNamesVd1,
        ...predicateNamesVd2,
        ...predicateNamesVe,
        ...predicateNamesVh,
        ...predicateNamesVg,
      ]);

      expect(predicateNames(VI)).toStrictEqual([
        ...predicateNames(VI, a),
        ...predicateNames(VI, b),
        ...predicateNames(VI, d),
        ...predicateNames(VI, e),
        ...predicateNames(VI, h),
        ...predicateNames(VI, g),
      ]);
    });
  });

  describe('Validation.group', () => {
    it.todo(
      'different instance of Validation assossiated with the same object',
    );
    it.todo(
      'one instance of Validation included in several different grouped Validations Ve, Vb',
    );
    it.todo(
      'one instance of Validation included in several different grouped Validations which include one another Vh',
    );
  });

  describe('Validation.glue', () => {
    it('should be predicate calls with glued validated values passed in', () => {
      Ve.validate();
      // glued
      expect(predicates.P1k.mock.calls).toStrictEqual([[e.value, g.value]]);
      expect(predicates.P2k.mock.calls).toStrictEqual([[e.value, g.value]]);

      // not glued
      expect(predicates.P1i.mock.calls).toStrictEqual([[e.value]]);
      expect(predicates.P2i.mock.calls).toStrictEqual([[e.value]]);
      expect(predicates.P1f.mock.calls).toStrictEqual([[e.value]]);
      expect(predicates.P2f.mock.calls).toStrictEqual([[e.value]]);

      Vg.validate();
      // glued
      expect(predicates.P1k.mock.calls).toStrictEqual([
        [e.value, g.value],
        [e.value, g.value],
      ]);
      expect(predicates.P2k.mock.calls).toStrictEqual([
        [e.value, g.value],
        [e.value, g.value],
      ]);

      // not glued
      expect(predicates.P1i.mock.calls).toStrictEqual([[e.value], [g.value]]);
      expect(predicates.P2i.mock.calls).toStrictEqual([[e.value], [g.value]]);
    });

    it('should validate/invalidate another validation it is glued to', () => {
      expect(Ve.isValid).toBe(true);
      expect(Vg.isValid).toBe(true);

      // predicate added on glued validation
      predicates.P1k.mockImplementationOnce(() => false);

      Ve.validate();
      expect(Ve.isValid).toBe(false);
      expect(Vg.isValid).toBe(false);

      Vg.validate();
      expect(Ve.isValid).toBe(true);
      expect(Vg.isValid).toBe(true);

      // predicate added on non glued validation
      predicates.P1i.mockImplementationOnce(() => false);

      Ve.validate();
      expect(Ve.isValid).toBe(false);
      expect(Vg.isValid).toBe(true);

      Vg.validate();
      expect(Ve.isValid).toBe(false);
      expect(Vg.isValid).toBe(true);

      Ve.validate();
      expect(Ve.isValid).toBe(true);
      expect(Vg.isValid).toBe(true);
    });
  });
});
