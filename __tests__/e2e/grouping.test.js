import { it, describe, jest, expect, beforeEach } from '@jest/globals';
import { Validation } from '../../src/index.js';

const a = { value: 'obj a' };
const b = { value: 'obj b' };
const d = { value: 'obj d' };
const e = { value: 'obj e' };
const g = { value: 'obj g' };
const h = { value: 'obj h' };

const origVa = Validation(a);
const origVb = Validation(b);
const origVd1 = Validation(d); // different instances of Validaton assossiated with the same object
const origVd2 = Validation(d); // different instances of Validaton assossiated with the same object
const origVe = Validation(e);
const origVg = Validation(g);
const origVh = Validation(h);

const origVC = Validation.group([origVa, origVb]);
const origVJ = Validation.group([origVb, origVd1, origVd2]);
const origVK = Validation.glue([origVe, origVg]);
const origVF = Validation.group([origVC, origVJ, origVe, origVh]);
const origVI = Validation.group([origVF, origVK, origVh]);

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

origVa.constraint(predicates.P1a).constraint(predicates.P2a);
origVb.constraint(predicates.P1b).constraint(predicates.P2b);
origVd1.constraint(predicates.P1d1).constraint(predicates.P2d1);
origVd2.constraint(predicates.P1d2).constraint(predicates.P2d2);
origVe.constraint(predicates.P1e).constraint(predicates.P2e);
origVg.constraint(predicates.P1g).constraint(predicates.P2g);
origVh.constraint(predicates.P1h).constraint(predicates.P2h);
origVC.constraint(predicates.P1c).constraint(predicates.P2c);
origVJ.constraint(predicates.P1j).constraint(predicates.P2j);
origVK.constraint(predicates.P1k).constraint(predicates.P2k);
origVF.constraint(predicates.P1f).constraint(predicates.P2f);
origVI.constraint(predicates.P1i).constraint(predicates.P2i);

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

const dataTable = [
  {
    dataName: 'Original',
    Va: origVa,
    Vb: origVb,
    Vd1: origVd1,
    Vd2: origVd2,
    Ve: origVe,
    Vg: origVg,
    Vh: origVh,
    VC: origVC,
    VJ: origVJ,
    VK: origVK,
    VF: origVF,
    VI: origVI,
  },
  {
    dataName: 'Cloned',
    Va: Validation.clone(origVa),
    Vb: Validation.clone(origVb),
    Vd1: Validation.clone(origVd1),
    Vd2: Validation.clone(origVd2),
    Ve: Validation.clone(origVe),
    Vg: Validation.clone(origVg),
    Vh: Validation.clone(origVh),
    VC: Validation.clone(origVC),
    VJ: Validation.clone(origVJ),
    VK: Validation.clone(origVK),
    VF: Validation.clone(origVF),
    VI: Validation.clone(origVI),
  },
];

describe('input params', () => {
  it('should accept only a Validation/s and throw an exception otherwise', () => {});
});

describe('group with clone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('nesting', () => {
    it.each([dataTable[0]])(
      '$dataName: should include nested validations',
      ({ Va, Vb, Vd1, Vd2, Ve, Vg, Vh, VC, VJ, VK, VF, VI }) => {
        expect([...VC.validations]).toStrictEqual([Va, Vb]);
        expect([...VJ.validations]).toStrictEqual([Vb, Vd1, Vd2]);
        expect([...VK.validations]).toStrictEqual([Ve, Vg]);
        expect([...VF.validations]).toStrictEqual([VC, VJ, Ve, Vh]);
        expect([...VI.validations]).toStrictEqual([VF, VK, Vh]);
      },
    );

    it.each(dataTable)(
      '$dataName: should include own predicates along with the predicates from outer levels',
      ({ Va, Vb, Vd1, Vd2, Ve, Vg, Vh }) => {
        expect(predicateNames(Va, a)).toStrictEqual(predicateNamesVa);

        expect(predicateNames(Vb, b)).toStrictEqual(predicateNamesVb);

        expect(predicateNames(Vd1, d)).toStrictEqual(predicateNamesVd1);

        expect(predicateNames(Vd2, d)).toStrictEqual(predicateNamesVd2);

        expect(predicateNames(Ve, e)).toStrictEqual(predicateNamesVe);

        expect(predicateNames(Vg, g)).toStrictEqual(predicateNamesVg);

        expect(predicateNames(Vh, h)).toStrictEqual(predicateNamesVh);
      },
    );

    it.each(dataTable)(
      '$dataName: should include nested predicate groups',
      ({ VC, VJ, VK, VF, VI }) => {
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
      },
    );
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

  describe.each(dataTable)('$dataName: Validation.glue', ({ Ve, Vg, VK }) => {
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
      const [Ve1, Vg1] = [...VK.validations];

      VK.validate();
      expect(Ve1.isValid).toBe(true);
      expect(Vg1.isValid).toBe(true);

      // predicate added on glued validation
      predicates.P1k.mockImplementationOnce(() => false);

      Ve1.validate();
      expect(Ve1.isValid).toBe(false);
      expect(Vg1.isValid).toBe(false);

      Vg1.validate();
      expect(Ve1.isValid).toBe(true);
      expect(Vg1.isValid).toBe(true);

      // predicate added on non glued validation
      predicates.P1i.mockImplementationOnce(() => false);

      Ve1.validate();
      expect(Ve1.isValid).toBe(false);
      expect(Vg1.isValid).toBe(true);

      Vg1.validate();
      expect(Ve1.isValid).toBe(false);
      expect(Vg1.isValid).toBe(true);

      Ve1.validate();
      expect(Ve1.isValid).toBe(true);
      expect(Vg1.isValid).toBe(true);
    });
  });
});

describe('cloned object and its origin should not affect each other', () => {
  it.todo('adding predicates to original and cloned objects');
  it.todo('adding callbacks to original and cloned objects');
  it.todo('grouping original and cloned objects');
  it.todo('validating with/without id original and cloned objects');
  it.todo('cloning glued debounced predicates');
  it.todo(
    'cloned object should preserve the structure of its origin. PARTLY TESTED IN THE TESTS ABOVE',
  );
});
