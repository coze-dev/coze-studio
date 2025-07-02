export type TracePointName = 'success' | 'fail' | string;

export interface TraceDuration {
  points: TracePointName[];
  interval: {
    [key: TracePointName]: number;
  };
}

export function genDurationTracer() {
  const duration: TraceDuration = {
    points: [],
    interval: {},
  };

  const tracer = (pointName: TracePointName) => {
    if (!pointName) {
      return duration;
    }
    if (duration.points.indexOf(pointName) === -1) {
      duration.points.push(pointName);
    }
    performance.mark(pointName);
    if (duration.points.length > 1) {
      const curIdx = duration.points.length - 1;
      const measure = performance.measure(
        'measure',
        duration.points[curIdx - 1],
        duration.points[curIdx],
      );
      duration.interval[pointName] = measure?.duration ?? 0;
    }

    return duration;
  };

  return {
    tracer,
  };
}
