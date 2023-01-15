import { defineEventHandler } from 'file:///home/nyll/dev/mobile/playground/node_modules/h3/dist/index.mjs';

const count = defineEventHandler((event) => {
  return { api: "works" };
});

export { count as default };
//# sourceMappingURL=count.mjs.map
