import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './index';

describe('<Button />', () => {
  it('기본 렌더링: role/name + 기본 variant/color 데이터 속성', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: /save/i });

    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('data-variant', 'solid');
    expect(btn).toHaveAttribute('data-color', 'blue');
    // compoundVariants에 따라 기본 클래스가 붙는지(대표값만 체크)
    expect(btn.className).toMatch(/bg-theme-blue-9/);
  });

  it('preset이 지정되면 비지정 prop만 보충한다 (success=green/solid)', () => {
    render(<Button preset="success">OK</Button>);
    const btn = screen.getByRole('button', { name: /ok/i });

    expect(btn).toHaveAttribute('data-variant', 'solid');
    expect(btn).toHaveAttribute('data-color', 'green');
    expect(btn.className).toMatch(/bg-theme-green-9/);
  });

  it('variant/color 조합: outline + amber → 경계/텍스트 클래스', () => {
    render(
      <Button variant="outline" color="amber">
        Outline
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /outline/i });

    expect(btn.className).toMatch(/border-theme-amber-6/);
    expect(btn.className).toMatch(/bg-theme-amber-5/);
  });

  it('disabled이면 클릭이 차단되고 disabled 속성이 실제로 부여된다', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disable Me
      </Button>,
    );

    const btn = screen.getByRole('button', { name: /disable me/i });

    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled(); // 네 구현: button의 disabled 속성으로 클릭 자체가 발생 안 함
  });

  it('loading이면 aria-disabled만 세팅되고 disabled 속성은 없다', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Loading
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /loading/i });

    expect(btn).not.toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('asChild=true이면 내부 요소에 aria-disabled가 적용되고 disabled 속성은 없어야 한다', async () => {
    render(
      <Button asChild disabled>
        <a href="/go">Link</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: /link/i });

    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('disabled');
  });

  it('size/radius 데이터 속성과 클래스가 반영된다', () => {
    render(
      <Button size="lg" radius="full">
        Big
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /big/i });

    expect(btn).toHaveAttribute('data-size', 'lg');
    expect(btn.className).toMatch(/rounded-full/);
  });
});
