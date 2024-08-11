import { IS_CLIENT, IS_SERVER } from './getenv.js';

export default function makeIsomorphicAPI(
  api = {},
  {
    serverPropName = 'server',
    clientPropName = 'client',
    selfPropName = 'isomorphic',
    redefine = false,
    excludeFunctions = ['valueOf'],
  } = {},
) {
  const propNames = new Set([serverPropName, clientPropName, selfPropName]);

  if (propNames.size !== 3) {
    throw new Error('Isomorphic API property names must be unique');
  }

  if (!redefine) {
    propNames.forEach((propName) => {
      if (propName in api) {
        throw new Error(
          `Property name "${propName}" exists in ${JSON.stringify(api)}.` +
            ` Set another property name or redefine=true`,
        );
      }
    });
  }

  const exclude = new Set([...excludeFunctions, ...propNames]);

  let originalAPI = api;

  const wrappingAPI = new Proxy(api, {
    get(target, propName, receiver) {
      if (!exclude.has(propName)) {
        const prop = target[propName];

        if (prop instanceof Function) {
          return ignored;
        }
      }

      return Reflect.get(target, propName, receiver);
    },
  });

  function ignored() {
    if (this !== wrappingAPI) originalAPI = this;
    return wrappingAPI;
  }

  function original() {
    if (this !== wrappingAPI) originalAPI = this;
    return originalAPI;
  }

  const makePropDescrForExecEnv = (isInExecEnv) => ({
    get: isInExecEnv ? original : ignored,
    configurable: true,
  });

  return Object.defineProperties(api, {
    [serverPropName]: makePropDescrForExecEnv(IS_SERVER),
    [clientPropName]: makePropDescrForExecEnv(IS_CLIENT),
    [selfPropName]: makePropDescrForExecEnv(true),
  });
}
