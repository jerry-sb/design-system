import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Spinner } from './Spinner';

// Helper to select only the leaf containers (exclude the final sr-only span)
function getLeafContainers(statusEl: HTMLElement): NodeListOf<Element> {
  return statusEl.querySelectorAll(':scope > span[style*="animation-duration"]');
}

describe('<Spinner />', () => {
  it('renders a polite status with accessible name and aria-busy', () => {
    render(<Spinner />);
    const status = screen.getByRole('status', { name: /loading/i });
    expect(status).toHaveAttribute('aria-busy');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('renders 8 leaves with default speed (800ms)', () => {
    render(<Spinner />);
    const status = screen.getByRole('status', { name: /loading/i });
    const leaves = getLeafContainers(status);
    expect(leaves.length).toBe(8);
    for (const leaf of Array.from(leaves)) {
      // Inline style is applied directly in component
      expect((leaf as HTMLElement).style.animationDuration).toBe('800ms');
    }
  });

  it('applies fast speed (600ms) when speed="fast"', () => {
    render(<Spinner speed="fast" />);
    const status = screen.getByRole('status', { name: /loading/i });
    const leaves = getLeafContainers(status);
    for (const leaf of Array.from(leaves)) {
      expect((leaf as HTMLElement).style.animationDuration).toBe('600ms');
    }
  });

  it('applies slow speed (1000ms) when speed="slow"', () => {
    render(<Spinner speed="slow" />);
    const status = screen.getByRole('status', { name: /loading/i });
    const leaves = getLeafContainers(status);
    for (const leaf of Array.from(leaves)) {
      expect((leaf as HTMLElement).style.animationDuration).toBe('1000ms');
    }
  });

  it('when loading=false, returns children only (no status)', () => {
    render(<Spinner loading={false}>Inner content</Spinner>);
    // children should be visible and there should be no status role
    expect(screen.getByText('Inner content')).toBeVisible();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('with children, overlays spinner and hides original content', () => {
    const { container } = render(<Spinner>Overlay target</Spinner>);
    // spinner is present
    screen.getByRole('status', { name: /loading/i });
    // original content is in the DOM but hidden under aria-hidden wrapper
    const hiddenHost = container.querySelector('[aria-hidden]');
    expect(hiddenHost).not.toBeNull();
    expect(hiddenHost).toHaveTextContent('Overlay target');
  });
});
