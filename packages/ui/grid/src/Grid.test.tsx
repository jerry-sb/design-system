import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Grid, GridItem } from './Grid';

describe('Grid', () => {
  it('renders with columns and rows data attributes', () => {
    render(
      <Grid columns={2} rows={2} data-testid="grid">
        <GridItem>1</GridItem>
        <GridItem>2</GridItem>
        <GridItem>3</GridItem>
        <GridItem>4</GridItem>
      </Grid>,
    );
    const grid = screen.getByTestId('grid');
    expect(grid).toHaveAttribute('data-columns', '2');
    expect(grid).toHaveAttribute('data-rows', '2');
  });

  it('applies item spans', () => {
    render(
      <Grid columns={4} data-testid="grid">
        <GridItem data-testid="item" colSpan={2} rowSpan={1} />
      </Grid>,
    );
    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();
  });
});
