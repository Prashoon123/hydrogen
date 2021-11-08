import {proxyClientComponent} from '../server-components';

const root = '/path/to/';
const src = `export default function() {}`;
const FAKE_FILE_PATH = 'full/path/to/Counter.client.jsx';
const getFileFromClientManifest = async (id: string) => FAKE_FILE_PATH;

it('wraps default exports for dev', async () => {
  expect(
    await proxyClientComponent({
      id: '/path/to/Counter.client.jsx',
      getFileFromClientManifest,
      root,
      src,
      isBuild: false,
    })
  ).toBe(`import {wrapInClientMarker} from '@shopify/hydrogen/marker';
import Counter from '/path/to/Counter.client.jsx?no-proxy';

export default wrapInClientMarker({ name: 'Counter', id: '/path/to/Counter.client.jsx', component: Counter, named: false });
`);
});

it('wraps default exports for build', async () => {
  expect(
    await proxyClientComponent({
      id: '/path/to/Counter.client.jsx',
      getFileFromClientManifest,
      root,
      src,
      isBuild: true,
    })
  ).toBe(`import {wrapInClientMarker} from '@shopify/hydrogen/marker';
import Counter from '/path/to/Counter.client.jsx?no-proxy';

export default wrapInClientMarker({ name: 'Counter', id: '/${FAKE_FILE_PATH}', component: Counter, named: false });
`);
});

it('wraps named exports', async () => {
  expect(
    await proxyClientComponent({
      id: '/path/to/Counter.client.jsx',
      getFileFromClientManifest,
      root,
      src: `export function Counter() {}\nexport const Clicker = () => {};`,
      isBuild: false,
    })
  ).toBe(`import {wrapInClientMarker} from '@shopify/hydrogen/marker';
import * as namedImports from '/path/to/Counter.client.jsx?no-proxy';

export const Counter = wrapInClientMarker({ name: 'Counter', id: '/path/to/Counter.client.jsx', component: namedImports['Counter'], named: true });
export const Clicker = wrapInClientMarker({ name: 'Clicker', id: '/path/to/Counter.client.jsx', component: namedImports['Clicker'], named: true });
`);
});

it('combines default and named exports', async () => {
  expect(
    await proxyClientComponent({
      id: '/path/to/Counter.client.jsx',
      getFileFromClientManifest,
      root,
      src: `export default function() {}\nexport const Clicker = () => {};`,
      isBuild: false,
    })
  ).toBe(`import {wrapInClientMarker} from '@shopify/hydrogen/marker';
import Counter, * as namedImports from '/path/to/Counter.client.jsx?no-proxy';

export default wrapInClientMarker({ name: 'Counter', id: '/path/to/Counter.client.jsx', component: Counter, named: false });
export const Clicker = wrapInClientMarker({ name: 'Clicker', id: '/path/to/Counter.client.jsx', component: namedImports['Clicker'], named: true });
`);
});

it('does not wrap non-component exports', async () => {
  expect(
    await proxyClientComponent({
      id: '/path/to/Counter.client.jsx',
      getFileFromClientManifest,
      root,
      src: `export default function() {}\nexport const MyFragment = 'fragment myFragment on MyQuery { id }';`,
      isBuild: false,
    })
  ).toBe(`import {wrapInClientMarker} from '@shopify/hydrogen/marker';
import Counter from '/path/to/Counter.client.jsx?no-proxy';

export {MyFragment} from '/path/to/Counter.client.jsx?no-proxy';
export default wrapInClientMarker({ name: 'Counter', id: '/path/to/Counter.client.jsx', component: Counter, named: false });
`);
});

it('can export non-component only', async () => {
  expect(
    await proxyClientComponent({
      id: '/path/to/Counter.client.jsx',
      getFileFromClientManifest,
      root,
      src: `export const LocalizationContext = {}; export const useMyStuff = () => {}; export const MY_CONSTANT = 42;`,
      isBuild: false,
    })
  ).toBe(`export * from '/path/to/Counter.client.jsx?no-proxy';\n`);
});
