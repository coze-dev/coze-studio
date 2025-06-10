/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as domain_machine_task from './namespaces/domain_machine_task';
import * as invite from './namespaces/invite';
import * as landing_page from './namespaces/landing_page';
import * as market from './namespaces/market';
import * as resource from './namespaces/resource';
import * as task from './namespaces/task';

export { domain_machine_task, invite, landing_page, market, resource, task };
export * from './namespaces/domain_machine_task';
export * from './namespaces/invite';
export * from './namespaces/landing_page';
export * from './namespaces/market';
export * from './namespaces/resource';
export * from './namespaces/task';

export type Int64 = string | number;

export default class StoneCozeSpaceService<T> {
  private request: any = () => {
    throw new Error('StoneCozeSpaceService.request is undefined');
  };
  private baseURL: string | ((path: string) => string) = '';

  constructor(options?: {
    baseURL?: string | ((path: string) => string);
    request?<R>(
      params: {
        url: string;
        method: 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH';
        data?: any;
        params?: any;
        headers?: any;
      },
      options?: T,
    ): Promise<R>;
  }) {
    this.request = options?.request || this.request;
    this.baseURL = options?.baseURL || '';
  }

  private genBaseURL(path: string) {
    return typeof this.baseURL === 'string'
      ? this.baseURL + path
      : this.baseURL(path);
  }

  /** POST /api/coze_space/create_task_replay */
  CreateTaskReplay(
    req?: task.CreateTaskReplayRequest,
    options?: T,
  ): Promise<task.CreateTaskReplayResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/create_task_replay');
    const method = 'POST';
    const data = { task_id: _req['task_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/get_task_replay */
  GetTaskReplay(
    req?: task.GetTaskReplayRequest,
    options?: T,
  ): Promise<task.GetTaskReplayResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/get_task_replay');
    const method = 'POST';
    const data = { task_id: _req['task_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/delete_task */
  DeleteCozeSpaceTask(
    req: task.DeleteCozeSpaceTaskRequest,
    options?: T,
  ): Promise<task.DeleteCozeSpaceTaskResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/delete_task');
    const method = 'POST';
    const data = { task_id: _req['task_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/update_task */
  UpdateCozeSpaceTask(
    req: task.UpdateCozeSpaceTaskRequest,
    options?: T,
  ): Promise<task.UpdateCozeSpaceTaskResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/update_task');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      task_name: _req['task_name'],
      mcp_tool_list: _req['mcp_tool_list'],
      expert_agent_config: _req['expert_agent_config'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/create_task */
  CreateCozeSpaceTask(
    req: task.CreateCozeSpaceTaskRequest,
    options?: T,
  ): Promise<task.CreateCozeSpaceTaskResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/create_task');
    const method = 'POST';
    const data = {
      task_name: _req['task_name'],
      task_type: _req['task_type'],
      file_uri_list: _req['file_uri_list'],
      mcp_tool_list: _req['mcp_tool_list'],
      agent_ids: _req['agent_ids'],
      expert_agent_config: _req['expert_agent_config'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/chat */
  CozeSpaceChat(
    req?: task.CozeSpaceChatRequest,
    options?: T,
  ): Promise<task.CozeSpaceChatResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/chat');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      query: _req['query'],
      files: _req['files'],
      mcp_list: _req['mcp_list'],
      chat_type: _req['chat_type'],
      pause_reason: _req['pause_reason'],
      task_run_mode: _req['task_run_mode'],
      expert_agent_run_config: _req['expert_agent_run_config'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/poll_step_list */
  PollStepList(
    req?: task.PollStepListRequest,
    options?: T,
  ): Promise<task.PollStepListResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/poll_step_list');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      answer_id: _req['answer_id'],
      next_key: _req['next_key'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/operate_task */
  OperateTask(
    req?: task.OperateTaskRequest,
    options?: T,
  ): Promise<task.OperateTaskResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/operate_task');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      operate_type: _req['operate_type'],
      pause_reason: _req['pause_reason'],
      browser: _req['browser'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/get_task_list */
  GetCozeSpaceTaskList(
    req?: task.GetCozeSpaceTaskListRequest,
    options?: T,
  ): Promise<task.GetCozeSpaceTaskListResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/get_task_list');
    const method = 'POST';
    const data = { cursor: _req['cursor'], size: _req['size'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/get_message_list */
  GetMessageList(
    req?: task.GetMessageListRequest,
    options?: T,
  ): Promise<task.GetMessageListResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/get_message_list');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      cursor: _req['cursor'],
      size: _req['size'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/update_task_plan */
  UpdateTaskPlan(
    req: task.UpdateTaskPlanRequest,
    options?: T,
  ): Promise<task.UpdateTaskPlanResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/update_task_plan');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      action_id: _req['action_id'],
      task_plan: _req['task_plan'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/get_task_replay_by_id */
  GetTaskReplayById(
    req?: task.GetTaskReplayByIdRequest,
    options?: T,
  ): Promise<task.GetTaskReplayByIdResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/get_task_replay_by_id');
    const method = 'POST';
    const data = {
      task_share_id: _req['task_share_id'],
      secret: _req['secret'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/operate_task_replay */
  OperateTaskReplay(
    req?: task.OperateTaskReplayRequest,
    options?: T,
  ): Promise<task.OperateTaskReplayResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/operate_task_replay');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      task_share_id: _req['task_share_id'],
      operate_type: _req['operate_type'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/upload_task_file */
  UploadTaskFile(
    req?: task.UploadTaskFileRequest,
    options?: T,
  ): Promise<task.UploadTaskFileResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/upload_task_file');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      file_name: _req['file_name'],
      file_content: _req['file_content'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/upload_user_research_file */
  UploadUserResearchFile(
    req: task.UploadUserResearchFileRequest,
    options?: T,
  ): Promise<task.UploadUserResearchFileResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/upload_user_research_file');
    const method = 'POST';
    const data = {
      task_id: _req['task_id'],
      action: _req['action'],
      file_type: _req['file_type'],
      file_name: _req['file_name'],
      file_content: _req['file_content'],
      desc: _req['desc'],
      fields: _req['fields'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/coze_space/landing_page/email_subscribe
   *
   * landing页邮箱预约
   */
  LandingPageEmailSubscribe(
    req?: landing_page.LandingPageEmailSubscribeRequest,
    options?: T,
  ): Promise<landing_page.LandingPageEmailSubscribeResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/landing_page/email_subscribe');
    const method = 'POST';
    const data = { email: _req['email'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/get_url */
  GetUrl(
    req: resource.GetUrlRequest,
    options?: T,
  ): Promise<resource.GetUrlResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/get_url');
    const method = 'POST';
    const data = { uri: _req['uri'], expire_seconds: _req['expire_seconds'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/landing_page */
  LandingPage(
    req?: market.LandingPageRequest,
    options?: T,
  ): Promise<market.LandingPageResponse> {
    const url = this.genBaseURL('/api/coze_space/landing_page');
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /api/coze_space/expert_product_details */
  ExpertProductDetails(
    req: market.ExpertProductDetailsRequest,
    options?: T,
  ): Promise<market.ExpertProductDetailsResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/expert_product_details');
    const method = 'POST';
    const data = { agent_id: _req['agent_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/digg */
  Digg(req: market.DiggRequest, options?: T): Promise<market.DiggResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/digg');
    const method = 'POST';
    const data = {
      agent_id: _req['agent_id'],
      action_type: _req['action_type'],
      is_cancel: _req['is_cancel'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/search_stock */
  SearchStock(
    req: task.SearchStockRequest,
    options?: T,
  ): Promise<task.SearchStockResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/search_stock');
    const method = 'POST';
    const data = {
      search_type: _req['search_type'],
      stock_search_word: _req['stock_search_word'],
      sector_search_word: _req['sector_search_word'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /api/coze_space/text2image */
  Text2Image(
    req: resource.Text2ImageRequest,
    options?: T,
  ): Promise<resource.Text2ImageResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/text2image');
    const method = 'GET';
    const params = {
      prompt: _req['prompt'],
      width: _req['width'],
      height: _req['height'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/coze_space/get_invite_info
   *
   * invite
   */
  GetInviteInfo(
    req?: invite.GetInviteInfoRequest,
    options?: T,
  ): Promise<invite.GetInviteInfoResponse> {
    const url = this.genBaseURL('/api/coze_space/get_invite_info');
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /api/coze_space/check_invite_code */
  CheckInviteCode(
    req?: invite.CheckInviteCodeRequest,
    options?: T,
  ): Promise<invite.CheckInviteCodeResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/coze_space/check_invite_code');
    const method = 'POST';
    const data = { code: _req['code'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/expert_product_list */
  ExpertProductList(
    req?: market.ExpertProductListRequest,
    options?: T,
  ): Promise<market.ExpertProductListResponse> {
    const url = this.genBaseURL('/api/coze_space/expert_product_list');
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /api/coze_space/check_in_wait_list */
  CheckInWaitList(
    req?: invite.CheckInWaitListRequest,
    options?: T,
  ): Promise<invite.CheckInWaitListResponse> {
    const url = this.genBaseURL('/api/coze_space/check_in_wait_list');
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /api/coze_space/join_wait_list */
  JoinWaitList(
    req?: invite.JoinWaitListRequest,
    options?: T,
  ): Promise<invite.JoinWaitListResponse> {
    const url = this.genBaseURL('/api/coze_space/join_wait_list');
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /api/coze_space/trigger_scheduled_task */
  TriggerScheduledTask(
    req: task.TriggerScheduledTaskRequest,
    options?: T,
  ): Promise<task.TriggerScheduledTaskResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/trigger_scheduled_task');
    const method = 'POST';
    const data = { task_id: _req['task_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/get_sandbox_token */
  GetSandboxToken(
    req: task.GetSandboxTokenRequest,
    options?: T,
  ): Promise<task.GetSandboxTokenResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/coze_space/get_sandbox_token');
    const method = 'POST';
    const data = { task_id: _req['task_id'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/coze_space/get_user_scheduled_tasks */
  GetUserScheduledTasks(
    req?: task.GetUserScheduledTasksRequest,
    options?: T,
  ): Promise<task.GetUserScheduledTasksResponse> {
    const url = this.genBaseURL('/api/coze_space/get_user_scheduled_tasks');
    const method = 'POST';
    return this.request({ url, method }, options);
  }
}
/* eslint-enable */
