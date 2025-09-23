import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './Drawer';

const BasicDrawer = ({
  side = 'right' as 'top' | 'bottom' | 'left' | 'right',
  animate = 'slide' as 'slide' | 'none',
  close = true,
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <button>Open</button>
    </SheetTrigger>
    <SheetContent side={side} animate={animate} close={close} data-testid="sheet-content">
      <SheetHeader>
        <SheetTitle>Title</SheetTitle>
        <SheetDescription>Desc</SheetDescription>
      </SheetHeader>
      <SheetClose asChild>
        <button>Close</button>
      </SheetClose>
    </SheetContent>
  </Sheet>
);

describe('<Sheet />', () => {
  afterEach(() => cleanup());

  it('Trigger 클릭 시 dialog가 열리고 trigger/content의 data-state가 open이 된다', async () => {
    render(<BasicDrawer />);

    const trigger = screen.getByRole('button', { name: /open/i });
    expect(trigger).toHaveAttribute('data-state', 'closed');

    await userEvent.click(trigger);

    // 이름 매칭 없이 role로만 찾기 (Radix가 숨김 타이틀을 중복 생성할 수 있음)
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // aria-labelledby 연결을 직접 확인
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();

    // state 확인
    expect(trigger).toHaveAttribute('data-state', 'open');
    const content = screen.getByTestId('sheet-content');
    expect(content).toHaveAttribute('data-state', 'open');
  });

  it('side="right" + slide일 때 위치/애니메이션 유틸과 data-state가 반영된다', async () => {
    render(<BasicDrawer side="right" animate="slide" />);
    await userEvent.click(screen.getByRole('button', { name: /open/i }));

    const content = await screen.findByTestId('sheet-content');
    // 위치 유틸
    expect(content.className).toMatch(/inset-y-0/);
    expect(content.className).toMatch(/right-0/);
    expect(content.className).toMatch(/border-l/);
    // 애니메이션 유틸
    expect(content.className).toMatch(/slide-in-from-right-/);
    // 상태
    expect(content).toHaveAttribute('data-state', 'open');
  });

  it('side="top" + slide 조합 클래스가 붙고 data-state=open이다', async () => {
    render(<BasicDrawer side="top" animate="slide" />);
    await userEvent.click(screen.getByRole('button', { name: /open/i }));

    const content = await screen.findByTestId('sheet-content');
    expect(content.className).toMatch(/inset-x-0/);
    expect(content.className).toMatch(/top-0/);
    expect(content.className).toMatch(/border-b/);
    expect(content.className).toMatch(/slide-in-from-top-/);
    expect(content).toHaveAttribute('data-state', 'open');
  });

  it('animate="none"이면 animate-in/out 유틸이 없고 data-state=open만 있다', async () => {
    render(<BasicDrawer animate="none" side="left" />);
    await userEvent.click(screen.getByRole('button', { name: /open/i }));

    const content = await screen.findByTestId('sheet-content');
    // 위치 유틸은 있음
    expect(content.className).toMatch(/left-0/);
    // 애니메이션 유틸 없음
    expect(content.className).not.toMatch(/slide-in-from-|slide-out-to-/);
    expect(content.className).not.toMatch(/transition/);
    // 상태
    expect(content).toHaveAttribute('data-state', 'open');
  });

  it('close={false}면 우상단 닫기 아이콘이 렌더되지 않는다', async () => {
    render(<BasicDrawer close={false} />);
    await userEvent.click(screen.getByRole('button', { name: /open/i }));

    const dialog = await screen.findByRole('dialog');
    const iconButton = dialog.querySelector('button.absolute.right-4.top-4');
    expect(iconButton).toBeNull();
  });
});
