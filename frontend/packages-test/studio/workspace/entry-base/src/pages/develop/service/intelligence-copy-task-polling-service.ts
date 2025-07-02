import mitt, { type Emitter } from 'mitt';
import { uniqBy } from 'lodash-es';
import {
  type EntityTaskData,
  IntelligenceStatus,
  type TaskStruct,
} from '@coze-arch/idl/intelligence_api';
import { intelligenceApi } from '@coze-arch/bot-api';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PollCopyTaskEvent = {
  onCopyTaskUpdate: EntityTaskData[];
};

export class IntelligenceCopyTaskPollingService {
  readonly defaultTimeout = 2000;
  readonly timeoutStep = 2000;
  taskPool: TaskStruct[] = [];
  timeout = this.defaultTimeout;
  timerId: ReturnType<typeof setTimeout> | null = null;
  eventCenter: Emitter<PollCopyTaskEvent>;

  constructor() {
    this.eventCenter = mitt<PollCopyTaskEvent>();
  }

  removeTaskPoll = (params: EntityTaskData[]) => {
    this.taskPool = this.taskPool.filter(
      task => !params.find(p => p.entity_id === task.entity_id),
    );
  };

  poll = async () => {
    const response = await intelligenceApi.EntityTaskSearch({
      task_list: this.taskPool,
    });
    const taskMap = response.data?.entity_task_map ?? {};
    const taskList = Object.entries(taskMap).map(([_, task]) => task);

    const finishPollList = taskList.filter(
      task => task.entity_status !== IntelligenceStatus.Copying,
    );

    this.removeTaskPoll(finishPollList);

    this.eventCenter.emit('onCopyTaskUpdate', taskList);
  };

  resetTimeout = () => {
    this.timeout = this.defaultTimeout;
  };

  increaseTimeout = () => {
    this.timeout += this.timeoutStep;
  };

  checkIsContinuePoll = () => Boolean(this.taskPool.length);

  clearTimer = () => {
    if (!this.timerId) {
      return;
    }
    clearTimeout(this.timerId);
  };

  run = () => {
    this.timerId = setTimeout(async () => {
      await this.poll();
      if (!this.checkIsContinuePoll()) {
        return;
      }
      this.increaseTimeout();
      this.run();
    }, this.timeout);
  };

  registerPolling = (params: TaskStruct[]) => {
    const prevLength = this.taskPool.length;

    this.taskPool = uniqBy(
      this.taskPool.concat(params),
      task => task.entity_id,
    );

    const currentLength = this.taskPool.length;

    if (!prevLength && currentLength) {
      this.resetTimeout();
      this.run();
    }
  };

  clearAll = () => {
    this.clearTimer();
    this.eventCenter.off('onCopyTaskUpdate');
    this.taskPool = [];
    this.timerId = null;
  };
}

export const intelligenceCopyTaskPollingService =
  new IntelligenceCopyTaskPollingService();
