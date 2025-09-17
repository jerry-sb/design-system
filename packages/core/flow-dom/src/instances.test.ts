import '@jerryshim-ui/flow-dom/global';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { Instances } from './instances';
import { instances } from './singletons';

// 모듈 보강: 테스트용 컴포넌트 키 추가
declare module './instances' {
  interface ComponentMap {
    TestComponent: { value?: number };
  }
}

const createInstance = (opts: { withDestroyAndRemove?: boolean } = {}) => {
  const base = { destroy: vi.fn() } as {
    destroy: () => void;
    destroyAndRemoveInstance?: () => void;
  };
  if (opts.withDestroyAndRemove) {
    base.destroyAndRemoveInstance = vi.fn();
  }
  return base;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Instances', () => {
  it('addInstance/getInstance 기본 동작', () => {
    const insts = new Instances();
    const a = createInstance();

    insts.addInstance('TestComponent', a, 'id1');
    expect(insts.getInstance('TestComponent', 'id1')).toBe(a);

    const bucket = insts.getInstances('TestComponent');
    expect(bucket).toBeDefined();
    expect(bucket && bucket.id1).toBe(a);
  });

  it('id 미지정 시 랜덤 키로 추가됨', () => {
    const insts = new Instances();
    const a = createInstance();

    insts.addInstance('TestComponent', a);
    const bucket = insts.getInstances('TestComponent');
    expect(bucket).toBeDefined();

    const keys = Object.keys(bucket || {});
    expect(keys.length).toBe(1);
    expect(bucket && bucket[keys[0]!]).toBe(a);
  });

  it('override=false일 때 동일 ID 추가시 경고 후 무시', () => {
    const insts = new Instances();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const a = createInstance();
    const b = createInstance();

    insts.addInstance('TestComponent', a, 'dup');
    insts.addInstance('TestComponent', b, 'dup'); // override 기본값 false

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(insts.getInstance('TestComponent', 'dup')).toBe(a);
  });

  it('override=true일 때 기존 인스턴스의 destroyAndRemoveInstance 호출 후 교체', () => {
    const insts = new Instances();
    const oldInst = createInstance({ withDestroyAndRemove: true });
    const newInst = createInstance();

    insts.addInstance('TestComponent', oldInst, 'k');
    insts.addInstance('TestComponent', newInst, 'k', true);

    expect(oldInst.destroyAndRemoveInstance).toHaveBeenCalledTimes(1);
    expect(insts.getInstance('TestComponent', 'k')).toBe(newInst);
  });

  it('destroyAndRemoveInstance: destroy 호출 후 제거', () => {
    const insts = new Instances();
    const a = createInstance();

    insts.addInstance('TestComponent', a, 'x');
    insts.destroyAndRemoveInstance('TestComponent', 'x');

    expect(a.destroy).toHaveBeenCalledTimes(1);
    expect(insts.getInstance('TestComponent', 'x')).toBeUndefined();
  });

  it('removeInstance: 존재할 때만 삭제', () => {
    const insts = new Instances();
    const a = createInstance();

    insts.addInstance('TestComponent', a, 'rm');
    expect(insts.getInstance('TestComponent', 'rm')).toBeDefined();

    insts.removeInstance('TestComponent', 'rm');
    expect(insts.getInstance('TestComponent', 'rm')).toBeUndefined();
  });

  it('destroyInstanceObject: 존재할 때만 destroy 호출', () => {
    const insts = new Instances();
    const a = createInstance();

    insts.addInstance('TestComponent', a, 'd');
    insts.destroyInstanceObject('TestComponent', 'd');
    expect(a.destroy).toHaveBeenCalledTimes(1);

    // 없는 id에 대해선 호출 안 됨
    insts.destroyInstanceObject('TestComponent', 'nope');
    expect(a.destroy).toHaveBeenCalledTimes(1);
  });

  it('instanceExists 동작 확인', () => {
    const insts = new Instances();
    const a = createInstance();

    expect(insts.instanceExists('TestComponent', 'z')).toBe(false);
    insts.addInstance('TestComponent', a, 'z');
    expect(insts.instanceExists('TestComponent', 'z')).toBe(true);
    insts.removeInstance('TestComponent', 'z');
    expect(insts.instanceExists('TestComponent', 'z')).toBe(false);
  });

  it('getInstances: 비어있으면 undefined, 요소가 있으면 bucket 반환', () => {
    const insts = new Instances();
    expect(insts.getInstances('TestComponent')).toBeUndefined();

    const a = createInstance();
    insts.addInstance('TestComponent', a, 'q');
    expect(insts.getInstances('TestComponent')).toBeDefined();

    insts.removeInstance('TestComponent', 'q');
    expect(insts.getInstances('TestComponent')).toBeUndefined();
  });

  it('getAllInstances: 내부 구조 반환', () => {
    const insts = new Instances();
    const a = createInstance();

    insts.addInstance('TestComponent', a, 'g');
    const all = insts.getAllInstances();
    expect(all).toBeDefined();
    expect(all.TestComponent).toBeDefined();
    expect(all.TestComponent && all.TestComponent.g).toBe(a);
  });
});

describe('window.JerryInstances 글로벌 노출', () => {
  it('window.JerryInstances가 싱글톤 instances를 가리킴', () => {
    // jsdom 환경에서 사이드이펙트로 설정됨
    expect(window.JerryInstances).toBe(instances);
  });
});
