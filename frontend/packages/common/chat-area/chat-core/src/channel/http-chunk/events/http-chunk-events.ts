/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export enum HttpChunkEvents {
  // Received message
  MESSAGE_RECEIVED = 'http_chunk_message_received',
  // Abnormal message received
  MESSAGE_RECEIVED_INVALID = 'http_chunk_message_received_invalid',
  // overall pull timeout
  TOTAL_FETCH_TIMEOUT = 'http_chunk_total_fetch_timeout',
  // Private room timeout
  BETWEEN_CHUNK_TIMEOUT = 'http_chunk_between_chunk_timeout',
  // Start fetching
  FETCH_START = 'http_chunk_fetch_start',
  // Fetch request successful
  FETCH_SUCCESS = 'http_chunk_fetch_success',
  // Fetch request exception
  FETCH_ERROR = 'http_chunk_fetch_error',
  // Invalid message format
  INVALID_MESSAGE = 'http_chunk_invalid_message',
  // Pull flow starts
  READ_STREAM_START = 'http_chunk_read_stream_start',
  // Pull flow anomaly
  READ_STREAM_ERROR = 'http_chunk_read_stream_error',
  // Fetch to read stream full success
  ALL_SUCCESS = 'http_chunk_all_success',
}
