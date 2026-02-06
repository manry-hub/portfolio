import { themes } from '@storybook/theming';
import { addons } from '@storybook/addons';

addons.setConfig({
  theme: {
    ...themes.dark,
    brandImage: 'https://manry.is-a.dev/icon.svg',
    brandTitle: 'Hilman Ansory Components',
    brandUrl: 'https://manry.cf',
  },
});
