import { defineEventHandler } from 'h3';

const _name_ = defineEventHandler((event) => {
  return `Hello, ${event.context.params.name}!`;
});

export { _name_ as default };
//# sourceMappingURL=_name_.mjs.map
