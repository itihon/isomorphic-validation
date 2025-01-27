// An alternative version of StateCallbacks

// import Functions from './functions.js';
//
// const setPrototypeOf = (obj, proto) => {
//   Reflect.setPrototypeOf(obj, proto);
//   return obj;
// };
//
// const statesArr = Object.freeze([
//   'started', 'valid', 'invalid', 'changed', 'validated', 'restored', 'error',
// ]);
//
// export default function StateCallbacks(CBs = StateCallbacks({})) {
//   const cbArgs = Object.fromEntries(
//     statesArr.filter(state => state !== 'error')
//       .map(state => [state, undefined]),
//   );
//
//   const receivedStateCBs = CBs ? CBs.valueOf() : {};
//
//   const stateCBs = statesArr.reduce(
//     (acc, state) => ({
//       ...acc,
//       [`${state}CBs`]: Functions(receivedStateCBs[`${state}CBs`]),
//     }),
//     {}
//   );
//
//   const stateCBsAdders = statesArr.reduce(
//     (acc, state) => ({
//       ...acc,
//       [state]: stateCBs[`${state}CBs`].push,
//     }),
//     {},
//   );
//
//   const stateCBsRunners = statesArr.reduce(
//     (acc, state) => ({
//       ...acc,
//       [
//         `run${state[0].toUpperCase()}${state.slice(1)}`
//       ]: (...args) => stateCBs[`${state}CBs`].run(
//         ...(cbArgs[state] ? [cbArgs[state]] : args)
//       ),
//     }),
//     {},
//   );
//
//   return {
//     setArg(arg) {
//       statesArr.filter(state => state !== 'error').forEach(
//         state => {
//           cbArgs[state] = setPrototypeOf({ type: state }, arg);
//         },
//       );
//     },
//     valueOf() {
//       return stateCBs;
//     },
//     ...stateCBsAdders,
//     ...stateCBsRunners,
//     [Symbol.toStringTag]: 'StateCallbacks',
//   };
// }
