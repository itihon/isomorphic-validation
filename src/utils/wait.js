export default function wait(ms = 10) {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}
