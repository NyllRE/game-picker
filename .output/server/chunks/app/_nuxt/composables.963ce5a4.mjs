import { B as useNuxtApp } from '../server.mjs';

function useHead(input, options) {
  return useNuxtApp()._useHead(input, options);
}

export { useHead as u };
//# sourceMappingURL=composables.963ce5a4.mjs.map
