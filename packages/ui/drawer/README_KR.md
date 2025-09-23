# @jerryshim-ui/drawer

`@radix-ui/react-dialog` 위에 구축된, 접근성 친화적인 Drawer(Sheet) 컴포넌트 모음입니다.

## 설치

```bash
pnpm add @jerryshim-ui/drawer @radix-ui/react-dialog class-variance-authority
```

## 빠른 시작

```tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@jerryshim-ui/drawer';

export default function Example() {
  return (
    <Sheet>
      <SheetTrigger className="btn">Open</SheetTrigger>
      <SheetContent side="right" animate="slide" radius="lg">
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
        </SheetHeader>
        <div className="py-4">Body</div>
        <SheetFooter>
          <SheetClose className="btn">Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

## API

모든 컴포넌트는 `@radix-ui/react-dialog` 프리미티브를 재노출하고, 스타일/버전 옵션을 제공합니다.

### `Sheet`

- 루트 컴포넌트. 열림/닫힘 상태를 관리합니다.

### `SheetTrigger`

- 시트를 여는 트리거 요소입니다.

### `SheetContent`

- 속성:
  - `side`: `'top' | 'bottom' | 'left' | 'right'` (기본값: `'right'`)
  - `animate`: `'slide' | 'none'` (기본값: `'slide'`)
  - `radius`: `'none' | 'sm' | 'md' | 'lg'` (기본값: `'lg'`)
  - `close`: `boolean` (기본값: `true`) – 우상단 닫기 버튼 렌더 여부.

### `SheetHeader`

- 제목/설명을 위한 레이아웃 래퍼입니다.

### `SheetFooter`

- 하단 영역 래퍼입니다. 모바일에서는 역순, 데스크톱에서는 가로 정렬됩니다.

### `SheetTitle`

- 제목 텍스트를 표시합니다.

### `SheetDescription`

- 설명 텍스트를 표시합니다.

### `SheetOverlay`

- 전체 화면 오버레이입니다.

### `SheetPortal`

- 콘텐츠가 사용하는 포털 래퍼입니다.

### `SheetClose`

- 상호작용 시 시트를 닫습니다.

## 스타일링 및 클래스

- Tailwind 유틸리티 유사 클래스들을 사용합니다. 디자인 토큰/유틸 설정이 필요합니다.
- `SheetContent`는 위치, 애니메이션, 모서리 반경을 제어합니다.

## 접근성

- Radix Dialog 기반으로 포커스 트랩, ARIA 속성, 키보드 상호작용을 지원합니다.

## TypeScript

- 모든 컴포넌트는 타입이 제공되며, `SheetContent`는 버전 속성을 노출합니다.

## 라이선스

MIT
