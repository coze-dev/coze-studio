/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as api from './namespaces/api';
import * as bidirectional from './namespaces/bidirectional';
import * as common from './namespaces/common';
import * as rpc from './namespaces/rpc';
import * as voice_api from './namespaces/voice_api';

export { api, bidirectional, common, rpc, voice_api };
export * from './namespaces/api';
export * from './namespaces/bidirectional';
export * from './namespaces/common';
export * from './namespaces/rpc';
export * from './namespaces/voice_api';

export type Int64 = string | number;

export default class MultimediaApiService<T> {
  private request: any = () => {
    throw new Error('MultimediaApiService.request is undefined');
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

  /** POST /v1/audio/speech */
  PublicAudioSpeech(
    req?: api.AudioSpeechRequest,
    options?: T,
  ): Promise<api.AudioSpeechResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/audio/speech');
    const method = 'POST';
    const data = {
      input: _req['input'],
      voice_id: _req['voice_id'],
      response_format: _req['response_format'],
      speed: _req['speed'],
      sample_rate: _req['sample_rate'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v1/audio/rooms */
  PublicCreateRoom(
    req?: api.CreateRoomRequest,
    options?: T,
  ): Promise<api.CreateRoomResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/audio/rooms');
    const method = 'POST';
    const data = {
      bot_id: _req['bot_id'],
      conversation_id: _req['conversation_id'],
      voice_id: _req['voice_id'],
      config: _req['config'],
      uid: _req['uid'],
      workflow_id: _req['workflow_id'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /v1/audio/voices/clone
   *
   * 实际上是open网关通过 rpc 调用过来
   */
  PublicCloneVoice(
    req?: api.CloneVoiceRequest,
    options?: T,
  ): Promise<api.CloneVoiceResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/audio/voices/clone');
    const method = 'POST';
    const data = {
      audio: _req['audio'],
      text: _req['text'],
      language: _req['language'],
      voice_id: _req['voice_id'],
      voice_name: _req['voice_name'],
      preview_text: _req['preview_text'],
      space_id: _req['space_id'],
      description: _req['description'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v1/audio/voices */
  PublicListVoice(
    req?: api.ListVoiceRequest,
    options?: T,
  ): Promise<api.ListVoiceResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/audio/voices');
    const method = 'GET';
    const params = {
      filter_system_voice: _req['filter_system_voice'],
      model_type: _req['model_type'],
      page_num: _req['page_num'],
      page_size: _req['page_size'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/resource/audio/check_create_voice
   *
   * 创建音色权限判定
   */
  APICheckCreateVoice(
    req?: voice_api.CheckCreateVoiceRequest,
    options?: T,
  ): Promise<voice_api.CheckCreateVoiceResponse> {
    const url = this.genBaseURL('/api/resource/audio/check_create_voice');
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /**
   * POST /api/resource/audio/clone_voice
   *
   * 克隆音色
   */
  APICloneVoice(
    req: voice_api.CloneVoiceRequest,
    options?: T,
  ): Promise<voice_api.CloneVoiceResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/resource/audio/clone_voice');
    const method = 'POST';
    const data = {
      voice_id: _req['voice_id'],
      audio_format: _req['audio_format'],
      audio_bytes: _req['audio_bytes'],
      compare_text: _req['compare_text'],
      preview_text: _req['preview_text'],
      space_id: _req['space_id'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/resource/audio/voices
   *
   * 获取音色列表
   */
  APIMGetVoice(
    req?: voice_api.MGetVoiceRequest,
    options?: T,
  ): Promise<voice_api.MGetVoiceResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/resource/audio/voices');
    const method = 'POST';
    const data = {
      voice_ids: _req['voice_ids'],
      prefix_voice_name: _req['prefix_voice_name'],
      language_code: _req['language_code'],
      scene: _req['scene'],
      self_created: _req['self_created'],
      voice_type: _req['voice_type'],
      space_id: _req['space_id'],
      voice_state: _req['voice_state'],
      gender: _req['gender'],
      age: _req['age'],
      page_index: _req['page_index'],
      page_size: _req['page_size'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/resource/audio/create_voice
   *
   * 创建音色
   */
  APICreateVoice(
    req: voice_api.CreateVoiceRequest,
    options?: T,
  ): Promise<voice_api.CreateVoiceResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/resource/audio/create_voice');
    const method = 'POST';
    const data = {
      voice_name: _req['voice_name'],
      space_id: _req['space_id'],
      voice_desc: _req['voice_desc'],
      icon_uri: _req['icon_uri'],
      language_code: _req['language_code'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/audio/speech
   *
   * 获取音色列表
   */
  APIAudioSpeech(
    req: voice_api.AudioSpeechRequest,
    options?: T,
  ): Promise<voice_api.AudioSpeechResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/audio/speech');
    const method = 'POST';
    const data = {
      voice_id: _req['voice_id'],
      input: _req['input'],
      response_format: _req['response_format'],
      response_data_type: _req['response_data_type'],
      speed: _req['speed'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/resource/audio/update_voice
   *
   * 更新音色
   */
  APIUpdateVoice(
    req: voice_api.UpdateVoiceRequest,
    options?: T,
  ): Promise<voice_api.UpdateVoiceResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/resource/audio/update_voice');
    const method = 'POST';
    const data = {
      voice_id: _req['voice_id'],
      voice_name: _req['voice_name'],
      voice_desc: _req['voice_desc'],
      icon_uri: _req['icon_uri'],
      language_code: _req['language_code'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/resource/audio/voice_menu
   *
   * 获取音色相关的菜单栏
   */
  APIGetVoiceMenu(
    req?: voice_api.GetVoiceMenuRequest,
    options?: T,
  ): Promise<voice_api.GetVoiceMenuResponse> {
    const url = this.genBaseURL('/api/resource/audio/voice_menu');
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /**
   * POST /api/resource/audio/voice/fg
   *
   * 音色资源开关
   */
  APIVoiceFeatureGateway(
    req?: voice_api.VoiceFeatureGatewayRequest,
    options?: T,
  ): Promise<voice_api.VoiceFeatureGatewayResponse> {
    const url = this.genBaseURL('/api/resource/audio/voice/fg');
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** GET /v1/chat */
  PublicStreamChat(
    req?: bidirectional.StreamRequest,
    options?: T,
  ): Promise<bidirectional.StreamResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/chat');
    const method = 'GET';
    const params = {
      EventType: _req['EventType'],
      EventID: _req['EventID'],
      Data: _req['Data'],
      Extended: _req['Extended'],
    };
    return this.request({ url, method, params }, options);
  }

  /** POST /v1/audio/transcriptions */
  PublicAudioTranscriptions(
    req: api.AudioTranscriptionsRequest,
    options?: T,
  ): Promise<api.AudioTranscriptionsResponse> {
    const _req = req;
    const url = this.genBaseURL('/v1/audio/transcriptions');
    const method = 'POST';
    const data = { body: _req['body'] };
    const headers = { 'Content-Type': _req['Content-Type'] };
    return this.request({ url, method, data, headers }, options);
  }

  /**
   * POST /api/audio/transcriptions
   *
   * 获取音色列表
   */
  APIAudioTranscriptions(
    req?: voice_api.AudioTranscriptionsRequest,
    options?: T,
  ): Promise<voice_api.AudioTranscriptionsResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/api/audio/transcriptions');
    const method = 'POST';
    const data = { Body: _req['Body'] };
    const headers = { 'Content-Type': _req['Content-Type'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** GET /v1/audio/speech */
  PublicAudioStreamSpeech(
    req?: bidirectional.StreamRequest,
    options?: T,
  ): Promise<bidirectional.StreamResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/audio/speech');
    const method = 'GET';
    const params = {
      EventType: _req['EventType'],
      EventID: _req['EventID'],
      Data: _req['Data'],
      Extended: _req['Extended'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v1/audio/transcriptions */
  PublicAudioStreamTranscriptions(
    req?: bidirectional.StreamRequest,
    options?: T,
  ): Promise<bidirectional.StreamResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/audio/transcriptions');
    const method = 'GET';
    const params = {
      EventType: _req['EventType'],
      EventID: _req['EventID'],
      Data: _req['Data'],
      Extended: _req['Extended'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/resource/audio/purchase_voice_clone_package
   *
   * 购买语音克隆包
   */
  APIPurchaseVoiceClonePackage(
    req: voice_api.PurchaseVoiceClonePackageRequest,
    options?: T,
  ): Promise<voice_api.PurchaseVoiceClonePackageResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/api/resource/audio/purchase_voice_clone_package',
    );
    const method = 'POST';
    const data = {
      number: _req['number'],
      coze_account_id: _req['coze_account_id'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/resource/audio/delete_voice
   *
   * 删除音色
   */
  APIDeleteVoice(
    req: voice_api.DeleteVoiceRequest,
    options?: T,
  ): Promise<voice_api.DeleteVoiceResponse> {
    const _req = req;
    const url = this.genBaseURL('/api/resource/audio/delete_voice');
    const method = 'POST';
    const data = { voice_id: _req['voice_id'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v1/audio/simult_interpretation */
  PublicSimultInterpretation(
    req?: bidirectional.StreamRequest,
    options?: T,
  ): Promise<bidirectional.StreamResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/audio/simult_interpretation');
    const method = 'GET';
    const params = {
      EventType: _req['EventType'],
      EventID: _req['EventID'],
      Data: _req['Data'],
      Extended: _req['Extended'],
    };
    return this.request({ url, method, params }, options);
  }
}
/* eslint-enable */
