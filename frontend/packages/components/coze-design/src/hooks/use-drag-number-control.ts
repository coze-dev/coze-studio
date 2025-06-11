/* eslint-disable max-lines-per-function -- ignore*/
import { useState, useRef, useEffect } from 'react';

/**
 * Utility functions for number formatting and limiting
 */
const numberUtils = {
  /**
   * Get decimal places from step value
   */
  getDecimalPlaces: (step: number): number => {
    const stepString = step.toString();
    const decimalPart = stepString.split('.')[1];
    return decimalPart ? decimalPart.length : 0;
  },

  /**
   * Format value to match step decimal places
   */
  formatValue: (val: number, step: number): number => {
    const decimalPlaces = numberUtils.getDecimalPlaces(step);
    return Number(val.toFixed(decimalPlaces));
  },

  /**
   * Limit value to min/max constraints
   */
  limitValue: (
    val: number,
    options: { step: number; min?: number; max?: number },
  ): number => {
    let limitedValue = numberUtils.formatValue(val, options.step);
    if (typeof options.min === 'number') {
      limitedValue = Math.max(options.min, limitedValue);
    }
    if (typeof options.max === 'number') {
      limitedValue = Math.min(options.max, limitedValue);
    }
    return limitedValue;
  },
};

/**
 * A custom hook for implementing drag control for number inputs
 * @param options - Configuration options for the drag control
 * @returns Object containing drag state and handlers
 */
export const useDragNumberControl = (options: {
  value: number | undefined;
  onChange: (value: number) => void;
  step: number;
  min?: number;
  max?: number;
}) => {
  const { value, onChange, step, min, max } = options;

  // Track dragging state
  const [isDragging, setIsDragging] = useState(false);

  // Store starting position and value
  const startXRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);

  // Timer reference for auto-change and current delta value
  const autoChangeTimerRef = useRef<number | null>(null);
  const currentDeltaRef = useRef<number>(0);

  /**
   * Auto-change value when dragging near screen edges
   */
  const autoChangeValue = (direction: 'increase' | 'decrease') => {
    const change = direction === 'increase' ? 1 : -1;
    currentDeltaRef.current += change;
    const newValue = numberUtils.limitValue(
      startValueRef.current + currentDeltaRef.current * step,
      { step, min, max },
    );
    onChange(newValue);
  };

  /**
   * Handle mouse movement during drag
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) {
      return;
    }

    if (autoChangeTimerRef.current) {
      window.clearInterval(autoChangeTimerRef.current);
      autoChangeTimerRef.current = null;
    }

    const edgeThreshold = 50;
    const screenWidth = window.innerWidth;

    if (e.clientX < edgeThreshold) {
      autoChangeTimerRef.current = window.setInterval(() => {
        autoChangeValue('decrease');
      }, 50) as unknown as number;
    } else if (e.clientX > screenWidth - edgeThreshold) {
      autoChangeTimerRef.current = window.setInterval(() => {
        autoChangeValue('increase');
      }, 50) as unknown as number;
    } else {
      const deltaX = e.clientX - startXRef.current;
      currentDeltaRef.current = Math.round(deltaX);
      const newValue = numberUtils.limitValue(
        startValueRef.current + currentDeltaRef.current * step,
        { step, min, max },
      );
      onChange(newValue);
    }
  };

  /**
   * Handle mouse up event to end dragging
   */
  const handleMouseUp = () => {
    setIsDragging(false);
    document.documentElement.classList.remove('ew-resize-cursor');

    if (autoChangeTimerRef.current) {
      window.clearInterval(autoChangeTimerRef.current);
      autoChangeTimerRef.current = null;
    }

    currentDeltaRef.current = 0;
  };

  // Clean up timer on unmount
  useEffect(
    () => () => {
      if (autoChangeTimerRef.current !== null) {
        window.clearInterval(autoChangeTimerRef.current);
      }
    },
    [],
  );

  // Add and clean up global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  /**
   * Start dragging operation
   */
  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    inputRef?: React.RefObject<HTMLInputElement>,
  ) => {
    setIsDragging(true);
    document.documentElement.classList.add('ew-resize-cursor');
    inputRef?.current?.blur();
    startXRef.current = e.clientX;
    startValueRef.current = Number(value) || 0;
  };

  return {
    isDragging,
    handleDragStart,
  };
};
