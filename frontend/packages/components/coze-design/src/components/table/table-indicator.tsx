import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Loading } from '@/components/loading';

import type {
  IndicatorProps,
  IndicatorMethods,
  IndicatorState,
} from './table-types';

import './index.css';
export const Indicator = forwardRef<IndicatorMethods, IndicatorProps>(
  ({ onIntersecting, loadedText, loadingText }, ref) => {
    const indicatorRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<IndicatorState>({
      done: false,
    });

    useEffect(() => {
      const intersectionHandler = (entries: IntersectionObserverEntry[]) => {
        const isIntersecting = entries[0]?.isIntersecting;

        onIntersecting(isIntersecting);
      };
      const observer = new IntersectionObserver(intersectionHandler);
      indicatorRef.current && observer.observe(indicatorRef.current);
      return () => observer.disconnect();
    }, []);

    useImperativeHandle(ref, () => ({
      changeState: setState,
    }));

    return !state.done ? (
      <div ref={indicatorRef} className="coz-table-indicator">
        {!state.done && <Loading size="middle" loading={true} />}
        <span className="hidden">{state.done ? '' : loadingText}</span>
      </div>
    ) : (
      <div className="coz-table-indicator-done">
        <div className="coz-table-indicator-divider">
          <div className="coz-table-indicator-line" />
          <div className="coz-table-indicator-dotted" />
          <span className="coz-table-indicator-tips">{loadedText}</span>
          <div className="coz-table-indicator-dotted" />
          <div className="coz-table-indicator-line" />
        </div>
      </div>
    );
  },
);

Indicator.displayName = 'Indicator';
