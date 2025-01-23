import {
  it,
  describe,
  jest,
  expect,
  beforeEach,
  beforeAll,
} from '@jest/globals';
import { Validation, Predicate } from '../../src/index.js';

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

  P1C: jest.fn(() => true),
  P2C: jest.fn(() => true),

  P1J: jest.fn(() => true),
  P2J: jest.fn(() => true),

  P1K: jest.fn(() => true),
  P2K: jest.fn(() => true),

  P1F: jest.fn(() => true),
  P2F: jest.fn(() => true),

  P1I: jest.fn(() => true),
  P2I: jest.fn(() => true),
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
origVC.constraint(predicates.P1C).constraint(predicates.P2C);
origVJ.constraint(predicates.P1J).constraint(predicates.P2J);
origVK.constraint(predicates.P1K).constraint(predicates.P2K);
origVF.constraint(predicates.P1F).constraint(predicates.P2F);
origVI.constraint(predicates.P1I).constraint(predicates.P2I);

function predicateNames(validation, obj) {
  return [
    ...(validation.isomorphic.constraints.get(obj) ||
      [...validation.isomorphic.constraints.values()].map((set) => [...set])),
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
  predicates.P1C,
  predicates.P2C,
  predicates.P1F,
  predicates.P2F,
  predicates.P1I,
  predicates.P2I,
]);

const predicateNamesVb = fnNames([
  predicates.P1b,
  predicates.P2b,
  predicates.P1C,
  predicates.P2C,
  predicates.P1J,
  predicates.P2J,
  predicates.P1F,
  predicates.P2F,
  predicates.P1I,
  predicates.P2I,
]);

const predicateNamesVd1 = fnNames([
  predicates.P1d1,
  predicates.P2d1,
  predicates.P1J,
  predicates.P2J,
  predicates.P1F,
  predicates.P2F,
  predicates.P1I,
  predicates.P2I,
]);

const predicateNamesVd2 = fnNames([
  predicates.P1d2,
  predicates.P2d2,
  predicates.P1J,
  predicates.P2J,
  predicates.P1F,
  predicates.P2F,
  predicates.P1I,
  predicates.P2I,
]);

const predicateNamesVe = fnNames([
  predicates.P1e,
  predicates.P2e,
  predicates.P1K,
  predicates.P2K,
  predicates.P1F,
  predicates.P2F,
  predicates.P1I,
  predicates.P2I,
]);

const predicateNamesVg = fnNames([
  predicates.P1g,
  predicates.P2g,
  predicates.P1K,
  predicates.P2K,
  predicates.P1I,
  predicates.P2I,
]);

const predicateNamesVh = fnNames([
  predicates.P1h,
  predicates.P2h,
  predicates.P1F,
  predicates.P2F,
  predicates.P1I,
  predicates.P2I,
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
  {
    dataName: 'Cloned 2',
    Va: Validation.clone(Validation.clone(origVa)),
    Vb: Validation.clone(Validation.clone(origVb)),
    Vd1: Validation.clone(Validation.clone(origVd1)),
    Vd2: Validation.clone(Validation.clone(origVd2)),
    Ve: Validation.clone(Validation.clone(origVe)),
    Vg: Validation.clone(Validation.clone(origVg)),
    Vh: Validation.clone(Validation.clone(origVh)),
    VC: Validation.clone(Validation.clone(origVC)),
    VJ: Validation.clone(Validation.clone(origVJ)),
    VK: Validation.clone(Validation.clone(origVK)),
    VF: Validation.clone(Validation.clone(origVF)),
    VI: Validation.clone(Validation.clone(origVI)),
  },
  {
    dataName: 'Cloned with regard to isomorphic API',
    Va: Validation.clone(origVa.client),
    Vb: Validation.clone(origVb.client),
    Vd1: Validation.clone(origVd1.client),
    Vd2: Validation.clone(origVd2).client,
    Ve: Validation.clone(origVe.client),
    Vg: Validation.clone(origVg.client),
    Vh: Validation.clone(origVh.client),
    VC: Validation.group([origVa.client, origVb.client]),
    VJ: Validation.group([origVb.client, origVd1.client, origVd2.client]),
    VK: Validation.glue([origVe.client, origVg.client]),
    VF: Validation.group([origVC.client, origVJ.client, origVe.client, origVh]),
    VI: Validation.group([origVF.client, origVK.client, origVh.client]),
  },
];

const iteratorOrderCmp = [];
const getAllOrderCmp = [];

describe('input params', () => {
  const msg = 'Not a Validation was passed in';

  it.each([{ operation: 'group' }, { operation: 'glue' }])(
    '$operation: should accept validations or array/s of validations in any combination',
    ({ operation }) => {
      expect(Validation[operation]).not.toThrowError();

      const validations = [origVa, origVb, origVd1];

      const vg1 = Validation[operation](origVa, origVb, origVd1);
      const vg2 = Validation[operation]([origVa, origVb], origVd1);
      const vg3 = Validation[operation]([origVa, [origVb]], origVd1);
      const vg4 = Validation[operation](origVa, [origVb, origVd1]);
      const vg5 = Validation[operation](origVa, origVb, [origVd1]);
      const vg6 = Validation[operation](origVa, origVb, [[origVd1]]);
      const vg7 = Validation[operation](origVa, [origVb], origVd1);
      const vg8 = Validation[operation](origVa, [[origVb]], origVd1);
      const vg9 = Validation[operation]([origVa, origVb, origVd1]);

      expect([...vg1.validations]).toStrictEqual(validations);
      expect([...vg2.validations]).toStrictEqual(validations);
      expect([...vg3.validations]).toStrictEqual(validations);
      expect([...vg4.validations]).toStrictEqual(validations);
      expect([...vg5.validations]).toStrictEqual(validations);
      expect([...vg6.validations]).toStrictEqual(validations);
      expect([...vg7.validations]).toStrictEqual(validations);
      expect([...vg8.validations]).toStrictEqual(validations);
      expect([...vg9.validations]).toStrictEqual(validations);
    },
  );

  it.each([{ operation: 'group' }, { operation: 'glue' }])(
    '$operation: should accept only a Validation/s and throw an exception otherwise',
    ({ operation }) => {
      expect(() => Validation[operation](null, origVb, origVd1)).toThrow(msg);
      expect(() => Validation[operation](origVa, {}, origVd1)).toThrow(msg);
      expect(() => Validation[operation]([origVa, null], origVd1)).toThrow(msg);
      expect(() =>
        Validation[operation]([origVa, [() => {}]], origVd1),
      ).toThrow(msg);
      expect(() => Validation[operation](origVa, [origVb, 'origVd1'])).toThrow(
        msg,
      );
      expect(() => Validation[operation](42, origVb, [origVd1])).toThrow(msg);
      expect(() => Validation[operation](origVa, origVb, [[42]])).toThrow(msg);
      expect(() => Validation[operation](origVa, [null], origVd1)).toThrow(msg);
      expect(() => Validation[operation](origVa, [[{}]], origVd1)).toThrow(msg);
      expect(() => Validation[operation]([origVa, origVb, {}])).toThrow(msg);
    },
  );

  it('should accept only a Validation and throw an exception otherwise', () => {
    expect(() => Validation.clone()).toThrow(msg);
    expect(() => Validation.clone(null)).toThrow(msg);
    expect(() => Validation.clone({})).toThrow(msg);
    expect(() => Validation.clone(42)).toThrow(msg);
    expect(() => Validation.clone('42')).toThrow(msg);
    expect(() => Validation.clone([])).toThrow(msg);
  });
});

describe('group with clone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('nesting', () => {
    it.each([dataTable[0]])(
      // not performed for the cloned
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
      // glued, called twice
      expect(predicates.P1K.mock.calls).toStrictEqual([
        [e.value, g.value],
        [e.value, g.value],
      ]);
      expect(predicates.P2K.mock.calls).toStrictEqual([
        [e.value, g.value],
        [e.value, g.value],
      ]);

      // not glued
      expect(predicates.P1I.mock.calls).toStrictEqual([[e.value]]);
      expect(predicates.P2I.mock.calls).toStrictEqual([[e.value]]);
      expect(predicates.P1F.mock.calls).toStrictEqual([[e.value]]);
      expect(predicates.P2F.mock.calls).toStrictEqual([[e.value]]);

      Vg.validate();
      // glued, called twice
      expect(predicates.P1K.mock.calls).toStrictEqual([
        [e.value, g.value],
        [e.value, g.value],
        [e.value, g.value],
        [e.value, g.value],
      ]);
      expect(predicates.P2K.mock.calls).toStrictEqual([
        [e.value, g.value],
        [e.value, g.value],
        [e.value, g.value],
        [e.value, g.value],
      ]);

      // not glued
      expect(predicates.P1I.mock.calls).toStrictEqual([[e.value], [g.value]]);
      expect(predicates.P2I.mock.calls).toStrictEqual([[e.value], [g.value]]);
    });

    it('should validate/invalidate another validation it is glued to', () => {
      const [Ve1, Vg1] = [...VK.validations];

      VK.validate();
      expect(Ve1.isValid).toBe(true);
      expect(Vg1.isValid).toBe(true);

      // predicate added on the glued validation
      predicates.P1K.mockImplementation(() => false);

      Ve1.validate();
      expect(Ve1.isValid).toBe(false);
      expect(Vg1.isValid).toBe(false);

      // predicate added on the glued validation
      predicates.P1K.mockImplementation(() => true);

      Vg1.validate();
      expect(Ve1.isValid).toBe(true);
      expect(Vg1.isValid).toBe(true);

      // predicate added on the non glued validation
      predicates.P1I.mockImplementationOnce(() => false);

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

  it.each(dataTable)(
    '$dataName: should contain keys of nested pgs',
    ({ VC, VJ, VK, VF, VI }) => {
      const valueOf = (validation, idx) =>
        [...validation.validations][idx].valueOf();

      const { containedGroups: containedGroupsVC } = VC.valueOf();
      const { containedGroups: containedGroupsVJ } = VJ.valueOf();
      const { containedGroups: containedGroupsVK } = VK.valueOf();
      const { containedGroups: containedGroupsVF } = VF.valueOf();
      const { containedGroups: containedGroupsVI } = VI.valueOf();

      const { containedGroups: containedGroupsVa } = valueOf(VC, 0);
      const { containedGroups: containedGroupsVb } = valueOf(VC, 1);
      const { containedGroups: containedGroupsVb1 } = valueOf(VJ, 0);
      const { containedGroups: containedGroupsVd1 } = valueOf(VJ, 1);
      const { containedGroups: containedGroupsVd2 } = valueOf(VJ, 2);
      const { containedGroups: containedGroupsVe } = valueOf(VF, 2);
      const { containedGroups: containedGroupsVe1 } = valueOf(VK, 0);
      const { containedGroups: containedGroupsVh } = valueOf(VF, 3);
      const { containedGroups: containedGroupsVh1 } = valueOf(VI, 2);
      const { containedGroups: containedGroupsVg } = valueOf(VK, 1);

      expect([...containedGroupsVa.keys()]).toStrictEqual([a]);
      expect([...containedGroupsVb.keys()]).toStrictEqual([b]);
      expect([...containedGroupsVb1.keys()]).toStrictEqual([b]);
      expect([...containedGroupsVd1.keys()]).toStrictEqual([d]);
      expect([...containedGroupsVd2.keys()]).toStrictEqual([d]);
      expect([...containedGroupsVe.keys()]).toStrictEqual([e]);
      expect([...containedGroupsVe1.keys()]).toStrictEqual([e]);
      expect([...containedGroupsVh.keys()]).toStrictEqual([h]);
      expect([...containedGroupsVh1.keys()]).toStrictEqual([h]);
      expect([...containedGroupsVg.keys()]).toStrictEqual([g]);

      expect([...containedGroupsVC.keys()]).toStrictEqual([a, b]);
      expect([...containedGroupsVJ.keys()]).toStrictEqual([b, d]);
      expect([...containedGroupsVK.keys()]).toStrictEqual([e, g]);
      expect([...containedGroupsVF.keys()]).toStrictEqual([a, b, d, e, h]);
      expect([...containedGroupsVI.keys()]).toStrictEqual([a, b, d, e, h, g]);
    },
  );

  it.each(dataTable)(
    '$dataName: should have the same instances of pgs',
    ({ VI }) => {
      const [VF, VK, Vhi] = [...VI.validations];
      const [VC, VJ, Vef, Vhf] = [...VF.validations];
      const [Vek, Vg] = [...VK.validations];
      const [Va, Vbc] = [...VC.validations];
      const [Vbj, Vd1, Vd2] = [...VJ.validations];

      const markPgs = (pgs, key) => {
        pgs.name = pgs.name
          ? [...new Set([...pgs.name.split(', '), key.value])].join(', ')
          : key.value;
      };

      const extractAndMark = (validation) => {
        const { containedGroups, pgs } = validation.valueOf();
        containedGroups.forEach(markPgs);
        return [containedGroups, pgs];
      };

      const [[cgVI, pgsVI]] = [VI].map(extractAndMark);

      const [[cgVF, pgsVF], [cgVK, pgsVK], [cgVhi, pgsVhi]] = [VF, VK, Vhi].map(
        extractAndMark,
      );

      const [[cgVC, pgsVC], [cgVJ, pgsVJ], [cgVef, pgsVef], [cgVhf, pgsVhf]] = [
        VC,
        VJ,
        Vef,
        Vhf,
      ].map(extractAndMark);

      const [[cgVek, pgsVek], [cgVg, pgsVg]] = [Vek, Vg].map(extractAndMark);

      const [[cgVa, pgsVa], [cgVbc, pgsVbc]] = [Va, Vbc].map(extractAndMark);

      const [[cgVbj, pgsVbj], [cgVd1, pgsVd1], [cgVd2, pgsVd2]] = [
        Vbj,
        Vd1,
        Vd2,
      ].map(extractAndMark);

      expect(Vhi).toBe(Vhf);
      expect(Vef).toBe(Vek);
      expect(Vbc).toBe(Vbj);

      expect(pgsVhi).toBe(pgsVhf);
      expect(pgsVef).toBe(pgsVek);
      expect(pgsVbc).toBe(pgsVbj);

      expect([...cgVa.getAll()]).toStrictEqual([pgsVa]);
      expect([...cgVbc.getAll()]).toStrictEqual([pgsVbj]);
      expect([...cgVbj.getAll()]).toStrictEqual([pgsVbc]);
      expect([...cgVd1.getAll()]).toStrictEqual([pgsVd1]);
      expect([...cgVd2.getAll()]).toStrictEqual([pgsVd2]);
      expect([...cgVek.getAll()]).toStrictEqual([pgsVef]);
      expect([...cgVef.getAll()]).toStrictEqual([pgsVek]);
      expect([...cgVg.getAll()]).toStrictEqual([pgsVg]);
      expect([...cgVhi.getAll()]).toStrictEqual([pgsVhf]);
      expect([...cgVhf.getAll()]).toStrictEqual([pgsVhi]);
      // own pgs is always on the last place
      expect([...cgVC.getAll()]).toStrictEqual([pgsVa, pgsVbc, pgsVC]);

      expect([...cgVJ.getAll()]).toStrictEqual([pgsVbj, pgsVd1, pgsVd2, pgsVJ]);

      expect([...cgVK.getAll()]).toStrictEqual([pgsVek, pgsVg, pgsVK]);

      expect([...cgVF.getAll()]).toStrictEqual([
        pgsVa,
        pgsVbc,
        pgsVC,
        pgsVd1,
        pgsVd2,
        pgsVJ,
        pgsVef,
        pgsVhf,
        pgsVF,
      ]);

      expect([...cgVI.getAll()]).toStrictEqual([
        pgsVa,
        pgsVbc,
        pgsVC,
        pgsVd1,
        pgsVd2,
        pgsVJ,
        pgsVef,
        pgsVhf,
        pgsVF,
        pgsVg,
        pgsVK,
        pgsVI,
      ]);

      // console.log([...cgVI.getAll()].map(pgs => pgs.name));
      // console.log([...cgVF].map(([obj, set]) => [...set].map(pgs => `${obj.value}: ${pgs.name}`)));

      iteratorOrderCmp.push(
        [...cgVI].map(([obj, set]) =>
          [...set].map((pgs) => {
            expect(pgs.name).not.toBe(undefined);
            expect(pgs.name).not.toBe('undefined');
            expect(Object.hasOwn(pgs, 'name')).toBe(true);
            return `${obj.value}: ${pgs.name}`;
          }),
        ),
      );

      getAllOrderCmp.push([...cgVI.getAll()].map((pgs) => pgs.name));
    },
  );

  it('should have a consistent order of pgs', () => {
    const [iOrig, iCloned1, iCloned2] = iteratorOrderCmp;
    const [gOrig, gCloned1, gCloned2] = getAllOrderCmp;

    expect(iOrig).toStrictEqual(iCloned1);
    expect(iCloned1).toStrictEqual(iCloned2);

    expect(gOrig).toStrictEqual(gCloned1);
    expect(gCloned1).toStrictEqual(gCloned2);
  });
});

describe('callbacks', () => {
  const cbsOrder = {
    all: [],
    started: [],
    valid: [],
    invalid: [],
    changed: [],
    validated: [],
  };

  const reinitCbsOrder = () =>
    Object.keys(cbsOrder).forEach((key) => {
      cbsOrder[key] = [];
    });

  let cbs;

  const createCbImpl = (operation, cbName) => () => {
    cbsOrder.all.push(cbName);
    cbsOrder[operation].push(cbName);
  };

  const assignCBs = () =>
    Object.entries({
      origVa,
      origVb,
      origVd1,
      origVd2,
      origVe,
      origVg,
      origVh,
      origVC,
      origVJ,
      origVK,
      origVF,
      origVI,
    })
      .map(([vName, validation]) => [vName.slice(4), validation])
      .map(([vName, validation]) => [
        {
          [`started_${vName}`]: (op, cbName) =>
            jest.fn(createCbImpl(op, cbName)),
          [`valid_${vName}`]: (op, cbName) => jest.fn(createCbImpl(op, cbName)),
          [`invalid_${vName}`]: (op, cbName) =>
            jest.fn(createCbImpl(op, cbName)),
          [`changed_${vName}`]: (op, cbName) =>
            jest.fn(createCbImpl(op, cbName)),
          [`validated_${vName}`]: (op, cbName) =>
            jest.fn(createCbImpl(op, cbName)),
        },
        validation,
      ])
      .map(([CBs, validation]) => {
        Object.keys(CBs)
          .map((cbName) => [cbName.split('_')[0], cbName])
          .map(([operation, cbName]) => [
            operation,
            Object.assign(CBs, { [cbName]: CBs[cbName](operation, cbName) })[
              cbName
            ],
          ])
          .map(([operation, cb]) => validation[operation](cb));

        return CBs;
      })
      .reduce((acc, CBs) => Object.assign(acc, CBs), {});

  const invalidate = async (validation) => {
    Object.values(predicates).forEach((predicate) =>
      predicate.mockImplementation(() => false),
    );

    await validation.validate();

    Object.values(predicates).forEach((predicate) =>
      predicate.mockImplementation(() => true),
    );
  };

  beforeAll(async () => {
    cbs = assignCBs();
  });

  it.each([
    { method: 'started' },
    { method: 'valid' },
    { method: 'invalid' },
    { method: 'changed' },
    { method: 'validated' },
    { method: 'restored' },
    { method: 'error' },
  ])(
    '$method: should accept only functions as state callbacks and throw an error otherwise',
    async ({ method }) => {
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      const cb3 = jest.fn();
      const p = jest.fn(() => true);

      const predicate = Predicate(p);
      const validation = Validation();

      jest.clearAllMocks();
      const warn = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => predicate[method](null)).toThrow();
      expect(() => predicate[method]([cb1])).toThrow();
      expect(() => predicate[method]([])).toThrow();
      expect(() => predicate[method]('')).toThrow();
      expect(() => predicate[method]({})).toThrow();
      expect(() => predicate[method](false)).toThrow();
      expect(() => predicate[method](42)).toThrow();
      expect(() => predicate[method](cb1, [])).toThrow();
      expect(() => predicate[method](cb1, '')).toThrow();
      expect(() => predicate[method](cb1, {})).toThrow();
      expect(() => predicate[method](cb1, false)).toThrow();
      expect(() => predicate[method](cb1, 42)).toThrow();
      expect(() => predicate[method](cb1, cb2, [])).toThrow();
      expect(() => predicate[method](cb1, cb2, '')).toThrow();
      expect(() => predicate[method](cb1, cb2, {})).toThrow();
      expect(() => predicate[method](cb1, cb2, false)).toThrow();
      expect(() => predicate[method](cb1, cb2, 42)).toThrow();
      expect(() => predicate[method](cb1, null, 42)).toThrow();

      expect(() => predicate[method]()).not.toThrow();
      expect(warn.mock.calls).toStrictEqual([
        ['Expected functions to be passed in, received nothing.'],
      ]);
      expect(() => predicate[method](cb1)).not.toThrow();
      expect(() => predicate[method](cb1, cb2)).not.toThrow();
      expect(() => predicate[method](cb1, cb2, cb3)).not.toThrow();

      validation.constraint(predicate);

      if (method !== 'restored') {
        // validation doesn't have this method
        jest.clearAllMocks();

        expect(() => validation[method](null)).toThrow();
        expect(() => validation[method]([cb1])).toThrow();
        expect(() => validation[method]([])).toThrow();
        expect(() => validation[method]('')).toThrow();
        expect(() => validation[method]({})).toThrow();
        expect(() => validation[method](false)).toThrow();
        expect(() => validation[method](42)).toThrow();
        expect(() => validation[method](cb1, [])).toThrow();
        expect(() => validation[method](cb1, '')).toThrow();
        expect(() => validation[method](cb1, {})).toThrow();
        expect(() => validation[method](cb1, false)).toThrow();
        expect(() => validation[method](cb1, 42)).toThrow();
        expect(() => validation[method](cb1, cb2, [])).toThrow();
        expect(() => validation[method](cb1, cb2, '')).toThrow();
        expect(() => validation[method](cb1, cb2, {})).toThrow();
        expect(() => validation[method](cb1, cb2, false)).toThrow();
        expect(() => validation[method](cb1, cb2, 42)).toThrow();
        expect(() => validation[method](cb1, null, 42)).toThrow();

        expect(() => validation[method]()).not.toThrow();
        expect(warn.mock.calls).toStrictEqual([
          ['Expected functions to be passed in, received nothing.'],
        ]);
        expect(() => validation[method](cb1)).not.toThrow();
        expect(() => validation[method](cb1, cb2)).not.toThrow();
        expect(() => validation[method](cb1, cb2, cb3)).not.toThrow();

        if (method !== 'invalid' && method !== 'error') {
          await validation.validate();
          expect(cb1).toHaveBeenCalledTimes(6);
          expect(cb2).toHaveBeenCalledTimes(4);
          expect(cb3).toHaveBeenCalledTimes(2);
        }

        warn.mockRestore();
      }
    },
  );

  it.each([{ title: 'original' }, { title: 'cloned' }])(
    '$title: should be invoked in the right order right amount of times',
    async ({ title }) => {
      const isCloned = title === 'cloned';

      const validation1 = isCloned ? Validation.clone(origVI) : origVI;

      await invalidate(validation1);
      jest.clearAllMocks();
      reinitCbsOrder();

      await validation1.validate();

      // ! a better solution would be to run all grouping validations' started callbacks first
      expect(cbsOrder.started).toStrictEqual([
        'started_VI',
        'started_Va', //
        'started_Vb',
        'started_VC', //
        'started_Vd1',
        'started_Vd2', //
        'started_VJ',
        'started_Ve', //
        'started_Vh',
        'started_VF', //
        'started_Vg',
        'started_VK', //
      ]);

      // ! changed callback invocations have a sligtly different order
      // for original validation group and its clone
      expect(cbsOrder.changed.sort()).toStrictEqual(
        [
          'changed_Va',
          'changed_Vb',
          'changed_VC',
          'changed_Vd1',
          'changed_Vd2',
          'changed_VJ',
          'changed_Ve',
          'changed_Vh',
          'changed_VF',
          'changed_Vg',
          'changed_VK',
          'changed_VI',
        ].sort(),
      );

      expect(cbsOrder.valid).toStrictEqual([
        'valid_Va',
        'valid_Vb',
        'valid_VC',
        'valid_Vd1',
        'valid_Vd2',
        'valid_VJ',
        'valid_Ve',
        'valid_Vh',
        'valid_VF',
        'valid_Vg',
        'valid_VK',
        'valid_VI',
      ]);

      expect(cbsOrder.invalid).toStrictEqual([]);

      expect(cbsOrder.validated).toStrictEqual([
        'validated_Va',
        'validated_Vb',
        'validated_VC',
        'validated_Vd1',
        'validated_Vd2',
        'validated_VJ',
        'validated_Ve',
        'validated_Vh',
        'validated_VF',
        'validated_Vg',
        'validated_VK',
        'validated_VI',
      ]);

      // has been called one time each
      expect(new Set(cbsOrder.changed).size).toBe(12);
      expect(new Set(cbsOrder.valid).size).toBe(12);
      expect(new Set(cbsOrder.validated).size).toBe(12);

      // callbacks have been invoked with the same argument
      cbsOrder.validated.forEach((cbName) => {
        const [, vName] = cbName.split('_');
        const validCalls = cbs[`valid_${vName}`].mock.calls;
        const validatedCalls = cbs[`validated_${vName}`].mock.calls;
        const changedCalls = cbs[`changed_${vName}`].mock.calls;

        expect(validCalls).toStrictEqual(validatedCalls);
        expect(validatedCalls).toStrictEqual(changedCalls);
      });

      const validation2 = isCloned ? Validation.clone(origVF) : origVF;

      await invalidate(validation2);
      jest.clearAllMocks();
      reinitCbsOrder();

      predicates.P1b.mockImplementationOnce(() => false);
      await validation2.validate();

      expect(cbsOrder.changed).toStrictEqual(
        isCloned
          ? [
              'changed_Va',
              'changed_Vd1',
              'changed_Vd2',
              'changed_Ve',
              'changed_Vh',
            ]
          : [
              'changed_Va',
              'changed_Vd1',
              'changed_Vd2',
              'changed_Vg',
              'changed_Ve',
              'changed_VK',
              'changed_Vh',
            ],
      );

      expect(cbsOrder.valid).toStrictEqual([
        'valid_Va',
        'valid_Vd1',
        'valid_Vd2',
        'valid_Ve',
        'valid_Vh',
      ]);

      expect(cbsOrder.invalid).toStrictEqual([
        'invalid_Vb',
        'invalid_VC',
        'invalid_VJ',
        'invalid_VF',
      ]);

      expect(cbsOrder.validated).toStrictEqual([
        'validated_Va',
        'validated_Vb',
        'validated_VC',
        'validated_Vd1',
        'validated_Vd2',
        'validated_VJ',
        'validated_Ve',
        'validated_Vh',
        'validated_VF',
      ]);

      // callbacks have been invoked with the same argument
      cbsOrder.invalid.forEach((cbName) => {
        const [, vName] = cbName.split('_');
        const invalidCalls = cbs[`invalid_${vName}`].mock.calls;
        const validatedCalls = cbs[`validated_${vName}`].mock.calls;

        expect(invalidCalls).toStrictEqual(validatedCalls);
      });
    },
  );

  it.each([{ title: 'original' }, { title: 'cloned' }])(
    '$title: should be called when validated by the associated object',
    async ({ title }) => {
      let res;

      const isCloned = title === 'cloned';
      const validation = isCloned ? Validation.clone(origVF) : origVF;

      await invalidate(validation);
      jest.clearAllMocks();
      res = await validation.validate();
      expect(res.target).toBe(undefined);
      reinitCbsOrder();

      predicates.P1b.mockImplementationOnce(() => false);
      res = await validation.validate(b);
      expect(res.target).toBe(b);

      // ! changed callback invocations have a sligtly different order
      // for original validation group and its clone
      expect(cbsOrder.changed).toStrictEqual(
        isCloned
          ? ['changed_VF', 'changed_Vb', 'changed_VC', 'changed_VJ']
          : [
              'changed_Vb',
              'changed_VC',
              'changed_VJ',
              'changed_VF',
              'changed_VI',
            ],
      );

      expect(cbsOrder.valid).toStrictEqual([]);

      expect(cbsOrder.invalid).toStrictEqual([
        'invalid_Vb',
        'invalid_VC',
        'invalid_VJ',
        'invalid_VF',
      ]);

      expect(cbsOrder.validated).toStrictEqual([
        'validated_Vb',
        'validated_VC',
        'validated_VJ',
        'validated_VF',
      ]);

      reinitCbsOrder();
      res = await validation.validate(b);
      expect(res.target).toBe(b);

      // ! changed callback invocations have a sligtly different order
      // for original validation group and its clone
      expect(cbsOrder.changed).toStrictEqual(
        isCloned
          ? ['changed_VF', 'changed_Vb', 'changed_VC', 'changed_VJ']
          : [
              'changed_Vb',
              'changed_VC',
              'changed_VJ',
              'changed_VF',
              'changed_VI',
            ],
      );

      expect(cbsOrder.valid).toStrictEqual([
        'valid_Vb',
        'valid_VC',
        'valid_VJ',
        'valid_VF',
      ]);

      expect(cbsOrder.invalid).toStrictEqual([]);

      expect(cbsOrder.validated).toStrictEqual([
        'validated_Vb',
        'validated_VC',
        'validated_VJ',
        'validated_VF',
      ]);
    },
  );

  it.each([{ title: 'original' }, { title: 'cloned' }, { title: 'added' }])(
    "$title: should call corresponding predicate's callbacks with the right argument",
    async ({ title }) => {
      await invalidate(origVF);
      jest.clearAllMocks();

      const validCB1 = jest.fn(({ isValid }) => expect(isValid).toBe(true));
      const invalidCB1 = jest.fn(({ isValid }) => expect(isValid).toBe(false));
      const changedCB1 = jest.fn();
      const validatedCB1 = jest.fn();
      const restoredCB1 = jest.fn();
      const predicateFn1 = jest.fn(() => true);

      const validCB2 = jest.fn(({ isValid }) => expect(isValid).toBe(true));
      const invalidCB2 = jest.fn(({ isValid }) => expect(isValid).toBe(false));
      const changedCB2 = jest.fn();
      const validatedCB2 = jest.fn();
      const restoredCB2 = jest.fn();
      const predicateFn2 = jest.fn(() => false);

      const predicate = Predicate(predicateFn1)
        .valid(validCB1)
        .invalid(invalidCB1)
        .changed(changedCB1)
        .validated(validatedCB1)
        .restored(restoredCB1);

      const x = { value: 'object x' };

      const isCloned = title === 'cloned';
      const isAdded = title === 'added';

      origVF.constraint(predicate, { keepValid: true });

      const validation = isCloned
        ? Validation.clone(origVF)
        : isAdded
          ? Validation.group(origVF, Validation(x)).constraint(predicate, {
              keepValid: true,
            })
          : origVF;

      if (isAdded) {
        await validation.validate(x);
      } else {
        await validation.validate(b);
      }

      expect(predicateFn1).toHaveBeenCalledTimes(1);
      expect(validCB1).toHaveBeenCalledTimes(1);
      expect(invalidCB1).toHaveBeenCalledTimes(0);
      expect(changedCB1).toHaveBeenCalledTimes(1);
      expect(validatedCB1).toHaveBeenCalledTimes(1);
      expect(restoredCB1).toHaveBeenCalledTimes(0);

      // callbacks have been invoked with the same argument
      expect(validCB1.mock.calls).toStrictEqual(validatedCB1.mock.calls);
      expect(validatedCB1.mock.calls).toStrictEqual(changedCB1.mock.calls);

      // check ValidationResult target
      expect(validCB1.mock.calls[0][0].target).toBe(isAdded ? x : b);
      expect(changedCB1.mock.calls[0][0].target).toBe(isAdded ? x : b);
      expect(validatedCB1.mock.calls[0][0].target).toBe(isAdded ? x : b);

      jest.clearAllMocks();
      predicateFn1.mockImplementationOnce(() => false);

      if (isAdded) {
        await validation.validate(x);
      } else {
        await validation.validate(b);
      }

      expect(predicateFn1).toHaveBeenCalledTimes(2); // called twice because keepValid=true
      expect(validCB1).toHaveBeenCalledTimes(1);
      expect(invalidCB1).toHaveBeenCalledTimes(0);
      expect(changedCB1).toHaveBeenCalledTimes(2); // changed twice because keepValid=true
      expect(validatedCB1).toHaveBeenCalledTimes(1);
      expect(restoredCB1).toHaveBeenCalledTimes(1);

      // callbacks have been invoked with the same argument
      expect(validCB1.mock.calls).toStrictEqual(validatedCB1.mock.calls);
      expect(validatedCB1.mock.calls).toStrictEqual(restoredCB1.mock.calls);

      // check ValidationResult target
      expect(validCB1.mock.calls[0][0].target).toBe(isAdded ? x : b);
      expect(validatedCB1.mock.calls[0][0].target).toBe(isAdded ? x : b);
      expect(restoredCB1.mock.calls[0][0].target).toBe(isAdded ? x : b);

      jest.clearAllMocks();

      validation.constraint(
        Predicate(predicateFn2)
          .valid(validCB2)
          .invalid(invalidCB2)
          .changed(changedCB2)
          .validated(validatedCB2)
          .restored(restoredCB2),
      );

      await validation.validate(a);

      expect(predicateFn2).toHaveBeenCalledTimes(1);
      expect(validCB2).toHaveBeenCalledTimes(0);
      expect(invalidCB2).toHaveBeenCalledTimes(1);
      expect(changedCB2).toHaveBeenCalledTimes(0);
      expect(validatedCB2).toHaveBeenCalledTimes(1);
      expect(restoredCB2).toHaveBeenCalledTimes(0);

      // callbacks have been invoked with the same argument
      expect(validatedCB2.mock.calls).toStrictEqual(invalidCB2.mock.calls);

      // check ValidationResult target
      expect(validatedCB2.mock.calls[0][0].target).toBe(a);
      expect(invalidCB2.mock.calls[0][0].target).toBe(a);

      predicateFn2.mockImplementation(() => true); // needed for the following tests
    },
  );

  const currVs = { h: null, group: null };
  it.each([
    { title: 'original', validations: currVs },
    { title: 'cloned', validations: currVs },
  ])(
    '$title: should update isValid before running callbacks',
    async ({ title, validations }) => {
      await invalidate(origVF);
      jest.clearAllMocks();

      const lastOf = (arr = []) => arr[arr.length - 1];
      const lastResultOf = (mockFn = jest.fn()) =>
        lastOf(mockFn.mock.results)?.value;

      const predicateFn = jest.fn(() => true);

      const pValidCB = jest.fn(({ isValid }) => expect(isValid).toBe(true));
      const pInvalidCB = jest.fn(({ isValid }) => expect(isValid).toBe(false));
      const pChangedCB = jest.fn(({ isValid }) =>
        expect(lastResultOf(predicateFn)).toBe(isValid),
      );
      const pValidatedCB = jest.fn(({ isValid }) =>
        expect(lastResultOf(predicateFn)).toBe(isValid),
      );
      const pStartedCB = jest.fn(({ isValid }) =>
        expect(lastResultOf(predicateFn) || false).toBe(isValid),
      );

      const vValidCB = jest.fn(({ isValid }) => expect(isValid).toBe(true));
      const vInvalidCB = jest.fn(({ isValid }) => expect(isValid).toBe(false));
      const vChangedCB = jest.fn(({ isValid }) =>
        expect(isValid).toBe(validations.h.isValid),
      );
      const vValidatedCB = jest.fn(({ isValid }) =>
        expect(isValid).toBe(validations.h.isValid),
      );
      // experimental feature
      const vStartedCB = jest.fn(({ isValid }) =>
        expect(isValid).toBe(validations.h.isValid),
      );

      const grValidCB = jest.fn(({ isValid }) => expect(isValid).toBe(true));
      const grInvalidCB = jest.fn(({ isValid }) => expect(isValid).toBe(false));
      const grChangedCB = jest.fn(({ isValid }) =>
        expect(isValid).toBe(validations.group.isValid),
      );
      const grValidatedCB = jest.fn(({ isValid }) =>
        expect(isValid).toBe(validations.group.isValid),
      );
      // experimental feature
      const grStartedCB = jest.fn(({ isValid }) =>
        expect(isValid).toBe(validations.group.isValid),
      );

      const predicate = Predicate(predicateFn)
        .started(pStartedCB)
        .valid(pValidCB)
        .invalid(pInvalidCB)
        .changed(pChangedCB)
        .validated(pValidatedCB);

      const isCloned = title === 'cloned';

      origVh.constraint(predicate);

      origVh
        .started(vStartedCB) // experimental feature
        .valid(vValidCB)
        .invalid(vInvalidCB)
        .changed(vChangedCB)
        .validated(vValidatedCB);

      const validation = isCloned ? Validation.clone(origVF) : origVF;
      validations.group = validation;
      [, , , validations.h] = [...validation.validations];

      validation
        .started(grStartedCB) // experimental feature
        .valid(grValidCB)
        .invalid(grInvalidCB)
        .changed(grChangedCB)
        .validated(grValidatedCB);

      await validation.validate(h);

      expect(predicateFn).toHaveBeenCalledTimes(1);
      expect(pStartedCB).toBeCalledTimes(1);
      expect(pValidCB).toBeCalledTimes(1);
      expect(pInvalidCB).toBeCalledTimes(0);
      expect(pChangedCB).toBeCalledTimes(1);
      expect(pValidatedCB).toBeCalledTimes(1);

      expect(vStartedCB).toBeCalledTimes(1); // experimental feature
      expect(vValidCB).toBeCalledTimes(1);
      expect(vInvalidCB).toBeCalledTimes(0);
      expect(vChangedCB).toBeCalledTimes(1);
      expect(vValidatedCB).toBeCalledTimes(1);

      expect(grStartedCB).toBeCalledTimes(1); // experimental feature
      expect(grValidCB).toBeCalledTimes(0);
      expect(grInvalidCB).toBeCalledTimes(1);
      expect(grChangedCB).toBeCalledTimes(0);
      expect(grValidatedCB).toBeCalledTimes(1);

      await validation.validate();

      expect(predicateFn).toHaveBeenCalledTimes(2);
      expect(pStartedCB).toBeCalledTimes(2);
      expect(pValidCB).toBeCalledTimes(2);
      expect(pInvalidCB).toBeCalledTimes(0);
      expect(pChangedCB).toBeCalledTimes(1);
      expect(pValidatedCB).toBeCalledTimes(2);

      expect(vStartedCB).toBeCalledTimes(2); // !? // experimental feature
      expect(vValidCB).toBeCalledTimes(2);
      expect(vInvalidCB).toBeCalledTimes(0);
      expect(vChangedCB).toBeCalledTimes(1);
      expect(vValidatedCB).toBeCalledTimes(2);

      expect(grStartedCB).toBeCalledTimes(2); // experimental feature
      expect(grValidCB).toBeCalledTimes(1);
      expect(grInvalidCB).toBeCalledTimes(1);
      expect(grChangedCB).toBeCalledTimes(1);
      expect(grValidatedCB).toBeCalledTimes(2);

      predicateFn.mockImplementationOnce(() => false);
      await validation.validate();

      expect(predicateFn).toHaveBeenCalledTimes(3);
      expect(pStartedCB).toBeCalledTimes(3);
      expect(pValidCB).toBeCalledTimes(2);
      expect(pInvalidCB).toBeCalledTimes(1);
      expect(pChangedCB).toBeCalledTimes(2);
      expect(pValidatedCB).toBeCalledTimes(3);

      expect(vStartedCB).toBeCalledTimes(3); // !? // experimental feature
      expect(vValidCB).toBeCalledTimes(2);
      expect(vInvalidCB).toBeCalledTimes(1);
      expect(vChangedCB).toBeCalledTimes(2);
      expect(vValidatedCB).toBeCalledTimes(3);

      expect(grStartedCB).toBeCalledTimes(3); // experimental feature
      expect(grValidCB).toBeCalledTimes(1);
      expect(grInvalidCB).toBeCalledTimes(2);
      expect(grChangedCB).toBeCalledTimes(2);
      expect(grValidatedCB).toBeCalledTimes(3);
    },
  );

  it('should specify the result type', async () => {
    const obj = { value: 0 };
    const isMeaningOfLife = (value) => value === 42;

    const pendingCBs = [];

    const delayedCB =
      (type = '') =>
      (res) => {
        const immediateType = res.type;
        pendingCBs.push(
          new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                expect(immediateType).toBe(type);
                expect(res.type).toBe(type);
                resolve();
              } catch (err) {
                reject(err);
              }
            }, 20);
          }),
        );
      };

    const vStartedCB = jest.fn(delayedCB('started'));
    const vValidCB = jest.fn(delayedCB('valid'));
    const vInvalidCB = jest.fn(delayedCB('invalid'));
    const vChangedCB = jest.fn(delayedCB('changed'));
    const vValidatedCB = jest.fn(delayedCB('validated'));

    const pStartedCB = jest.fn(delayedCB('started'));
    const pValidCB = jest.fn(delayedCB('valid'));
    const pInvalidCB = jest.fn(delayedCB('invalid'));
    const pChangedCB = jest.fn(delayedCB('changed'));
    const pValidatedCB = jest.fn(delayedCB('validated'));
    const pRestoredCB = jest.fn(delayedCB('restored'));

    const validation = Validation(obj)
      .constraint(
        Predicate(isMeaningOfLife)
          .started(pStartedCB)
          .valid(pValidCB)
          .invalid(pInvalidCB)
          .changed(pChangedCB)
          .validated(pValidatedCB)
          .restored(pRestoredCB),
        { keepValid: true },
      )
      .started(vStartedCB)
      .valid(vValidCB)
      .invalid(vInvalidCB)
      .changed(vChangedCB)
      .validated(vValidatedCB);

    obj.value = 41;
    expect((await validation.validate()).type).toBe('validated');

    obj.value = 42;
    expect((await validation.validate()).type).toBe('validated');

    expect(vStartedCB).toHaveBeenCalled();
    expect(vValidCB).toHaveBeenCalled();
    expect(vInvalidCB).toHaveBeenCalled();
    expect(vChangedCB).toHaveBeenCalled();
    expect(vValidatedCB).toHaveBeenCalled();

    expect(pStartedCB).toHaveBeenCalled();
    expect(pValidCB).toHaveBeenCalled();
    expect(pInvalidCB).toHaveBeenCalled();
    expect(pChangedCB).toHaveBeenCalled();
    expect(pValidatedCB).toHaveBeenCalled();
    expect(pRestoredCB).toHaveBeenCalled();

    await Promise.all(pendingCBs);
  });
});

describe('cloned object and its origin should not affect each other', () => {
  it.todo('grouping original objects with cloned objects');
  it.todo('cloning glued debounced predicates');
  it.todo('grouping duplicated validations');
});
