// rollup.config.js
import aliase from '@rollup/plugin-alias';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  plugins: [
    aliase({
      entries: [
        {
          find: /ui\/.*/,
          replacement: './utils/create-dummy-obj.js',
        },
      ],
    }), 
  ],
};