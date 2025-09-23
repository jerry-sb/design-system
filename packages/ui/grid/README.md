# @jerryshim-ui/grid

A flexible grid layout component for React applications.

## Installation

```bash
pnpm add @jerryshim-ui/grid
```

## Quick Start

```jsx
import { Grid, GridItem } from '@jerryshim-ui/grid';

function App() {
  return (
    <Grid columns={3} gap="md">
      <GridItem>Item 1</GridItem>
      <GridItem>Item 2</GridItem>
      <GridItem>Item 3</GridItem>
    </Grid>
  );
}
```

## API

### `Grid`

- **Props**:
  - `columns`: number of columns (default: 2)
  - `rows`: number of rows
  - `gap`: gap size between grid items (default: 'md')
  - `radius`: border radius of grid items (default: 'md')

### `GridItem`

- **Props**:
  - `colSpan`: number of columns to span
  - `rowSpan`: number of rows to span
  - `align`: vertical alignment
  - `justify`: horizontal alignment

## Usage

The `Grid` component is used to create a flexible grid layout. You can specify the number of columns, rows, and the gap between items. The `GridItem` component allows you to control the span and alignment of individual items.

## License

MIT
