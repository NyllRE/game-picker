import { defineEventHandler } from 'h3';

const count = defineEventHandler((event) => {
  return { api: "works" };
});

export { count as default };
//# sourceMappingURL=count.mjs.map
