import { defineEventHandler } from 'file:///home/nyll/dev/mobile/playground/node_modules/h3/dist/index.mjs';

const _name_ = defineEventHandler((event) => {
  return `Hello, ${event.context.params.name}!`;
});

export { _name_ as default };
//# sourceMappingURL=_name_.mjs.map
