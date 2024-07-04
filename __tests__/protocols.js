import { it, expect } from '@jest/globals';

it.todo('import it to test protocols');

const protocols = {
  ObserverAnd: {
    Observable: (instance) => [
      'should implement protocol ObserverAnd:Observable',
      () => {
        expect(instance).toHaveProperty('getID');
        expect(instance).toHaveProperty('getValue');
        expect(instance).toHaveProperty('onChanged');
      },
    ],
  },

  ConsoleRepresentation: {
    Representable: (instance) => [
      'should implement protocol ConsoleRepresentation:Representable',
      () => {
        expect(instance).toHaveProperty('toRepresentation');
      },
    ],
  },
};

export default protocols;
