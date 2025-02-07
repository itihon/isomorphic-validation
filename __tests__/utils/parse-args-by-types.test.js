import { describe, expect, it } from '@jest/globals';
import parseArgsByTypes from '../../src/utils/parse-args-by-types.js';

class Type {}

const permutations = (numArr = []) => {
  // Initialize the output array with an empty array as the starting point.
  let outputArr = [[]];
  let newOutputArr = [];

  // Loop through each number in the input array.
  numArr.forEach((num) => {
    // Reset the new output array for the current number.
    newOutputArr = [];

    // Iterate over each permutation in the current output array.
    for (let j = 0; j < outputArr.length; ++j)
      // Insert the current number `num` into every possible position
      // of each permutation from the current output array.
      for (let z = 0; z <= outputArr[j].length; ++z) {
        // Create a copy of the current permutation.
        const newArr = [...outputArr[j]];
        // Insert the current number `num` at position `z`.
        newArr.splice(z, 0, num);
        // Add the new permutation to the new output array.
        newOutputArr.push(newArr);
      }

    // Update the output array with the newly generated permutations.
    outputArr = newOutputArr;
  });

  // Return the final output array containing all permutations.
  return outputArr;
};

describe('parseArgsByTypes', () => {
  it('should throw an error if types are not unique', () => {
    const err = 'parseArgsByTypes: types must be unique.';

    expect(() =>
      parseArgsByTypes([], [Object, String, Object], []),
    ).toThrowError(err);

    expect(() =>
      parseArgsByTypes([], [String, String, Object], []),
    ).toThrowError(err);
  });

  it('should throw an error if more arguments are passed', () => {
    const err = 'parseArgsByTypes: more arguments were passed than expected.';
    const args = ['asdf', true, 42];

    expect(() => parseArgsByTypes(args, [String, Boolean])).toThrowError(err);

    expect(() => parseArgsByTypes(args, [Boolean, Number])).toThrowError(err);
  });

  it('should throw an error if a value of an unexpected type was passed', () => {
    const err =
      "parseArgsByTypes: type function Number() { [native code] } wasn't expected";
    const args = ['asdf', true, 42, new Type()];

    expect(() =>
      parseArgsByTypes(args, [Type, Boolean, String, Object]),
    ).toThrowError(err);
  });

  it('should throw an error if types of values are not unique', () => {
    const err =
      "parseArgsByTypes: type function Number() { [native code] } wasn't expected";
    const args = ['asdf', 42, new Type(), 42];

    expect(() =>
      parseArgsByTypes(args, [Type, String, Number, Boolean]),
    ).toThrowError(err);
  });

  it('should accept args of expected types in any order', () => {
    const obj = { foo: 'bar' };
    const arr = ['baz'];
    const num = 42;
    const str = 'asdf';

    const types = [Object, Array, Number, String];

    permutations([obj, arr, num, str]).forEach((args) => {
      expect(parseArgsByTypes(args, types)).toStrictEqual([obj, arr, num, str]);
    });

    permutations([obj, arr, num]).forEach((args) => {
      expect(
        parseArgsByTypes(args, types, [null, null, null, str]),
      ).toStrictEqual([obj, arr, num, str]);
    });

    permutations([obj, num]).forEach((args) => {
      expect(
        parseArgsByTypes(args, types, [null, arr, null, str]),
      ).toStrictEqual([obj, arr, num, str]);
    });

    expect(parseArgsByTypes([], types, [obj, arr, num, str])).toStrictEqual([
      obj,
      arr,
      num,
      str,
    ]);
  });
});
