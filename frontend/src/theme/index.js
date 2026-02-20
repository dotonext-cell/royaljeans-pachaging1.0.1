import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50:  '#fff8e1',
    100: '#ffeeba',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#f59e0b',  // accent gold
    600: '#f59e0b',
    700: '#e65100',
    800: '#bf360c',
    900: '#7f2700',
  },
};

const fonts = {
  heading: `'Vazirmatn', 'Tahoma', sans-serif`,
  body:    `'Vazirmatn', 'Tahoma', sans-serif`,
};

const styles = {
  global: {
    body: {
      bg: 'transparent',
      color: 'var(--text-primary)',
      direction: 'rtl',
    },
  },
};

const theme = extendTheme({
  config,
  direction: 'rtl',
  colors,
  fonts,
  styles,
});

export default theme;
