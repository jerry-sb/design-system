// Carousel.test.tsx
import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@jerryshim-ui/flow-dom/global', () => ({}));

vi.mock('@jerryshim-ui/flow-carousel', () => {
  const initCarousels = vi.fn(() => () => {});
  return { initCarousels };
});

import { initCarousels } from '@jerryshim-ui/flow-carousel';

import { Carousel } from './Carousel';

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

// 래퍼 헬퍼: 텍스트에서 data-carousel 가진 가장 가까운 조상 잡기
const getWrapperByChildText = (text: string) =>
  screen.getByText(text).closest('[data-carousel]') as HTMLElement;

describe('<Carousel />', () => {
  it('renders with auto slide and interval attributes', () => {
    render(
      <Carousel auto interval={5000}>
        <div>Slide A</div>
      </Carousel>,
    );

    const wrapper = getWrapperByChildText('Slide A');
    expect(wrapper).toHaveAttribute('data-carousel', 'slide');
    expect(wrapper).toHaveAttribute('data-carousel-interval', '5000');
  });

  it('uses provided id and merges className', () => {
    render(
      <Carousel id="my-carousel" className="custom-class">
        <div>Slide B</div>
      </Carousel>,
    );

    const wrapper = document.getElementById('my-carousel') as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('custom-class');
    // 기본 클래스도 함께 있는지 체크하고 싶으면:
    expect(wrapper).toHaveClass('relative', 'w-full');
  });

  it('initializes on mount, re-inits on id change, and disposes on cleanup', () => {
    const disposer1 = vi.fn();
    const disposer2 = vi.fn();

    (initCarousels as unknown as Mock)
      .mockReturnValueOnce(disposer1)
      .mockReturnValueOnce(disposer2);

    const { rerender, unmount } = render(
      <Carousel id="first">
        <div>Slide C</div>
      </Carousel>,
    );

    // mount 시 1회
    expect(initCarousels).toHaveBeenCalledTimes(1);

    // id 변경 → 이전 effect cleanup(disposer1) 호출 후 재초기화
    rerender(
      <Carousel id="second">
        <div>Slide C</div>
      </Carousel>,
    );

    expect(disposer1).toHaveBeenCalledTimes(1);
    expect(initCarousels).toHaveBeenCalledTimes(2);

    // 언마운트 → 두번째 disposer 호출
    unmount();
    expect(disposer2).toHaveBeenCalledTimes(1);
  });
});
