const SERVER = Symbol('server');
const CLIENT = Symbol('client');

const getEnv = () =>
  typeof document !== 'undefined'
    ? CLIENT
    : typeof process !== 'undefined'
      ? SERVER
      : undefined;

const ENV = getEnv();
const IS_SERVER = ENV === SERVER;
const IS_CLIENT = ENV === CLIENT;

const ifServer = (arg) => (IS_SERVER ? arg : undefined);
const ifClient = (arg) => (IS_CLIENT ? arg : undefined);

const ifSide = (onServer, onClient) => {
  if (IS_CLIENT) {
    return onClient;
  }

  if (IS_SERVER) {
    return onServer;
  }

  throw new Error("Couldn't define if it is a client or a server.");
};

export {
  ENV,
  SERVER,
  CLIENT,
  IS_SERVER,
  IS_CLIENT,
  ifServer,
  ifClient,
  ifSide,
};
