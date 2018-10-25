// plugins that we are going to use
import babel from 'rollup-plugin-babel';

// list of plugins used during building process
const plugins = targets => ([
  // use Babel to transpile to ES5
  babel({
    // ignore node_modules/ in transpilation process
    exclude: 'node_modules/**',
    // ignore .babelrc (if defined) and use options defined here
    babelrc: true,
    comments: false,
    runtimeHelpers: true,
  }),
]);

// packages that should be treated as external dependencies, not bundled
const external = []; // e.g. ['axios']

export default [{
  // source file / entrypoint
  input: 'src/index.js',
  // output configuration
  output: {
    // name visible for other scripts
    name: 'restLined',
    // output file location
    file: 'lib/index.esm.js',
    // format of generated JS file, also: esm, and others are available
    format: 'esm',
    // add sourcemaps
    sourcemap: true,
  },
  external,
  // build es modules for node 8
  plugins: plugins({ node: '8' }),
}, {
  input: 'src/index.js',
  output: {
    name: 'npmLibPackageExample',
    file: 'lib/index.js',
    format: 'cjs',
    sourcemap: true,
  },
  external,
  // build common JS for node 6
  plugins: plugins({ node: '6' }),
}];
