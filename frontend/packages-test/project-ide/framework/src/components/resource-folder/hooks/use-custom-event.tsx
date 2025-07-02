import React, { useEffect, useRef } from 'react';

enum EventKey {
  MouseDown = 'mouseDown',
  MouseDownInDiv = 'mouseDownInDiv',
  MouseUpInDiv = 'mouseUpInDiv',
  MouseUp = 'mouseUp',
  MouseMove = 'mouseMove',
  KeyDown = 'keyDown',
}

const useEvent = () => {
  const mouseDownRef = useRef<Array<(e) => void>>([]);
  const mouseDownInDivRef = useRef<Array<(e) => void>>([]);
  const mouseUpInDivRef = useRef<Array<(e) => void>>([]);
  const mouseUpRef = useRef<Array<(e) => void>>([]);
  const mouseMoveRef = useRef<Array<(e) => void>>([]);
  const keyDownRef = useRef<Array<(e) => void>>([]);

  const addEventListener = (key: EventKey, fn: (e) => void) => {
    if (key === EventKey.KeyDown) {
      keyDownRef.current.push(fn);
    } else if (key === EventKey.MouseDownInDiv) {
      mouseDownInDivRef.current.push(fn);
    } else if (key === EventKey.MouseUpInDiv) {
      mouseUpInDivRef.current.push(fn);
    } else if (key === EventKey.MouseDown) {
      mouseDownRef.current.push(fn);
    } else if (key === EventKey.MouseUp) {
      mouseUpRef.current.push(fn);
    } else if (key === EventKey.MouseMove) {
      mouseMoveRef.current.push(fn);
    }
  };

  const onMouseDown = e => {
    mouseDownRef.current.forEach(fn => {
      fn(e);
    });
  };
  const onMouseDownInDiv = e => {
    mouseDownInDivRef.current.forEach(fn => {
      fn(e);
    });
  };
  const onMouseUpInDiv = e => {
    mouseUpInDivRef.current.forEach(fn => {
      fn(e);
    });
  };
  const onMouseUp = e => {
    mouseUpRef.current.forEach(fn => {
      fn(e);
    });
  };
  const onKeyDown = e => {
    keyDownRef.current.forEach(fn => {
      fn(e);
    });
  };
  const onMouseMove = e => {
    mouseMoveRef.current.forEach(fn => {
      fn(e);
    });
  };

  useEffect(() => {
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const customEventBox = ({ children }) => (
    <div
      className={'resource-list-custom-event-wrapper'}
      onMouseDownCapture={onMouseDownInDiv}
      onMouseUp={onMouseUpInDiv}
    >
      {children}
    </div>
  );

  return { addEventListener, customEventBox, onMouseDownInDiv, onMouseUpInDiv };
};

export { useEvent, EventKey };
