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

import { inject, injectable } from 'inversify';
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowDocumentOptions,
  type WorkflowLineEntity,
  type WorkflowPortEntity,
} from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base/types';

import {
  WorkflowLinesServiceProvider,
  type WorkflowLinesService,
} from '../services/workflow-line-service';

@injectable()
export class WorkflowDocumentCustomOptions implements WorkflowDocumentOptions {
  @inject(WorkflowLinesServiceProvider)
  linesServiceProvider: () => WorkflowLinesService;

  // copy form packages/workflow-sdk/core/src/workflow-document-container-module.ts
  cursors: {
    grab: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMCAyMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC40ODczIDIuNjIzNzhDOS45MDczMSAyLjYyMzc4IDkuNDM3MTMgMy4wOTM5NiA5LjQzNzEzIDMuNjczOTZWNS4xNDM3NkM5LjM5NDI4IDQuNDAyNzQgOC43Nzk3OCAzLjgxNTA0IDguMDI4MDIgMy44MTUwNEM3LjI0ODQ4IDMuODE1MDQgNi42MTY1MyA0LjQ0Njk5IDYuNjE2NTMgNS4yMjY1M1YxMS44Mjg5TDUuNjc0MTggMTEuMDA0OUM1LjE1NDg3IDEwLjU1MDkgNC40MDk1IDEwLjQ2MzYgMy43OTkzOCAxMC43ODU1TDMuNjk2OTQgMTAuODM5NkMzLjA2MjE3IDExLjE3NDUgMi45MjI2IDEyLjAyMjggMy40MTY2MiAxMi41NDM0TDcuMzM5NTkgMTYuNjc3NVYxNy4zMjU5QzcuMzM5NTkgMTcuNzg2MiA3LjcxMjY5IDE4LjE1OTMgOC4xNzI5MiAxOC4xNTkzSDEzLjgwODRDMTQuMjY4NyAxOC4xNTkzIDE0LjY0MTcgMTcuNzg2MiAxNC42NDE3IDE3LjMyNTlWMTYuNzkzNUMxNS44MDk0IDE1LjY0ODUgMTYuNDY3MyAxNC4wODE5IDE2LjQ2NzMgMTIuNDQ2NVYxMS40OTY3TDE2LjQ2NzEgNi42MzY4NUMxNi40NjcxIDUuOTU2MyAxNS45MTU0IDUuNDA0NjEgMTUuMjM0OCA1LjQwNDYxQzE0LjU1NDMgNS40MDQ2MSAxNC4wMDI2IDUuOTU2MyAxNC4wMDI2IDYuNjM2ODVMMTQuMDAyMSA1LjA0NzI4QzE0LjAwMjEgNC4zNjY3MyAxMy40NTA0IDMuODE1MDQgMTIuNzY5OCAzLjgxNTA0QzEyLjA4OTMgMy44MTUwNCAxMS41Mzc2IDQuMzY2NzMgMTEuNTM3NiA1LjA0NzI4TDExLjUzNzUgMy42NzM5NUMxMS41Mzc1IDMuMDkzOTYgMTEuMDY3MyAyLjYyMzc4IDEwLjQ4NzMgMi42MjM3OFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNDg3NCAxLjM3NDAyQzExLjM2MTIgMS4zNzQwMiAxMi4xMjExIDEuODYxMTggMTIuNTEwNSAyLjU3ODY4QzEyLjU5NTggMi41Njk4MyAxMi42ODIzIDIuNTY1MjggMTIuNzcgMi41NjUyOEMxMy44Mjc4IDIuNTY1MjggMTQuNzMxMSAzLjIyNzAxIDE1LjA4ODUgNC4xNTkxMUMxNS4xMzcgNC4xNTYyOSAxNS4xODU4IDQuMTU0ODYgMTUuMjM1IDQuMTU0ODZDMTYuNjA1OSA0LjE1NDg2IDE3LjcxNzIgNS4yNjYxOSAxNy43MTcyIDYuNjM3MDlMMTcuNzE3NCAxMi40NDY3QzE3LjcxNzQgMTQuMjM1NSAxNy4wNjQ0IDE1Ljk1NTkgMTUuODkxOSAxNy4yOTA0VjE3LjMyNjJDMTUuODkxOSAxOC40NzY4IDE0Ljk1OTEgMTkuNDA5NSAxMy44MDg1IDE5LjQwOTVIOC4xNzMwNkM3LjAyMjQ3IDE5LjQwOTUgNi4wODk3MyAxOC40NzY4IDYuMDg5NzMgMTcuMzI2MlYxNy4xNzY0TDIuNTEwMDMgMTMuNDA0MUMxLjQ0NTk5IDEyLjI4MjggMS43NDY2IDEwLjQ1NTUgMy4xMTM3OSA5LjczNDI0TDMuMjE2MjQgOS42ODAxOUMzLjg5MTY4IDkuMzIzODMgNC42NjE4NSA5LjI1NDAxIDUuMzY2NjYgOS40NTE5OFY1LjIyNjc4QzUuMzY2NjYgMy43NTY4NyA2LjU1ODI2IDIuNTY1MjggOC4wMjgxNiAyLjU2NTI4QzguMTcyOTMgMi41NjUyOCA4LjMxNDk5IDIuNTc2ODQgOC40NTM0NyAyLjU5OTA3QzguODM5NDMgMS44NzA0MiA5LjYwNTQ2IDEuMzc0MDIgMTAuNDg3NCAxLjM3NDAyWk0xMi40NDc2IDMuODU3ODdWOS40NzY0NkMxMi40NDc2IDkuNzI4NTIgMTIuMjQzMyA5LjkzMjg1IDExLjk5MTMgOS45MzI4NUMxMS43MzkyIDkuOTMyODUgMTEuNTM0OSA5LjcyODUyIDExLjUzNDkgOS40NzY0NlYzLjc5NjU1QzExLjUzNDkgMy43Nzk1NiAxMS41MzU4IDMuNzYyNzcgMTEuNTM3NiAzLjc0NjI2VjMuNjc0MkMxMS41Mzc2IDMuNDMyODIgMTEuNDU2MiAzLjIxMDQ2IDExLjMxOTMgMy4wMzMwOUMxMS4xMjcyIDIuNzg0MjggMTAuODI2MSAyLjYyNDAyIDEwLjQ4NzQgMi42MjQwMkMxMC4xMjM4IDIuNjI0MDIgOS44MDMzMiAyLjgwODg2IDkuNjE0ODMgMy4wODk3QzkuNTAyNjkgMy4yNTY3OSA5LjQzNzI2IDMuNDU3ODUgOS40MzcyNiAzLjY3NDJWMy43ODU3M0M5LjQzNzM1IDMuNzg5MzMgOS40MzczOSAzLjc5Mjk0IDkuNDM3MzkgMy43OTY1NVY5LjkwMTdDOS40MzczOSAxMC4xNTM3IDkuMjMzMDYgMTAuMzU4MSA4Ljk4MTAxIDEwLjM1ODFDOC43Mjg5NSAxMC4zNTgxIDguNTI0NjIgMTAuMTUzNyA4LjUyNDYyIDkuOTAxN1YzLjkwNTA3QzguNDE3NzMgMy44NjQ5IDguMzA0NjggMy44MzczMiA4LjE4NzI2IDMuODI0MTVDOC4xMzUwNCAzLjgxODI5IDguMDgxOTUgMy44MTUyOCA4LjAyODE2IDMuODE1MjhDNy4yNDg2MSAzLjgxNTI4IDYuNjE2NjYgNC40NDcyMyA2LjYxNjY2IDUuMjI2NzhWMTEuODI5Mkw1LjY3NDMxIDExLjAwNTJDNS41Nzg2OCAxMC45MjE2IDUuNDc1MzcgMTAuODUwNCA1LjM2NjY2IDEwLjc5MTlDNC44ODUwNiAxMC41MzI5IDQuMjk3MjggMTAuNTIzMSAzLjc5OTUyIDEwLjc4NThMMy42OTcwNyAxMC44Mzk4QzMuMDYyMzEgMTEuMTc0NyAyLjkyMjczIDEyLjAyMzEgMy40MTY3NSAxMi41NDM3TDcuMzM5NzMgMTYuNjc3N1YxNy4zMjYyQzcuMzM5NzMgMTcuNzg2NCA3LjcxMjgyIDE4LjE1OTUgOC4xNzMwNiAxOC4xNTk1SDEzLjgwODVDMTQuMjY4OCAxOC4xNTk1IDE0LjY0MTkgMTcuNzg2NCAxNC42NDE5IDE3LjMyNjJWMTYuNzkzOEMxNS43Mzc5IDE1LjcxOSAxNi4zODQ3IDE0LjI3MjggMTYuNDYgMTIuNzQ3QzE2LjQ2NDEgMTIuNjY0MSAxNi40NjY1IDEyLjU4MDkgMTYuNDY3MiAxMi40OTc1TDE2LjQ2NzQgMTIuNDQ2N0wxNi40NjcyIDYuNjM3MDlDMTYuNDY3MiA1Ljk2MjMgMTUuOTI0OCA1LjQxNDE5IDE1LjI1MjIgNS40MDQ5N0wxNS4yMzUgNS40MDQ4NkMxNS4xMjQ2IDUuNDA0ODYgMTUuMDE3NyA1LjQxOTM2IDE0LjkxNTkgNS40NDY1NlY5LjYwMjI2QzE0LjkxNTkgOS44NTQzMSAxNC43MTE2IDEwLjA1ODYgMTQuNDU5NSAxMC4wNTg2QzE0LjIwNzUgMTAuMDU4NiAxNC4wMDMxIDkuODU0MzEgMTQuMDAzMSA5LjYwMjI2VjYuNjA1MTRDMTQuMDAyOSA2LjYxNTc2IDE0LjAwMjcgNi42MjY0MSAxNC4wMDI3IDYuNjM3MDlWOS4yNzcwNUwxNC4wMDIyIDUuMDQ3NTJDMTQuMDAyMiA0Ljg2OTEzIDEzLjk2NDMgNC42OTk2IDEzLjg5NjEgNC41NDY1M0MxMy43MDY0IDQuMTIwNzIgMTMuMjgyMiAzLjgyMjM1IDEyLjc4NzYgMy44MTU0MUwxMi43NyAzLjgxNTI4QzEyLjY1ODQgMy44MTUyOCAxMi41NTA0IDMuODMwMSAxMi40NDc2IDMuODU3ODdaIiBmaWxsPSIjMUQxQzIzIi8+Cjwvc3ZnPg=="), auto';
    grabbing: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMCAyMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02LjYxODE3IDUuNTk4NzVDNi42MTgxNyA0LjgxOTIgNy4yNTAxMiA0LjE4NzI2IDguMDI5NjcgNC4xODcyNkM4Ljc3ODczIDQuMTg3MjYgOS4zOTE1MiA0Ljc3MDc1IDkuNDM4MjkgNS41MDgwMUM5LjQ1OTkyIDQuOTQ3MSA5LjkyMTQ3IDQuNDk5MDIgMTAuNDg3NyA0LjQ5OTAyQzExLjA2NzcgNC40OTkwMiAxMS41Mzc4IDQuOTY5MiAxMS41Mzc4IDUuNTQ5MTlWOC43NjI0NkwxMS41Mzc5IDYuNzExNUMxMS41Mzc5IDYuMDMwOTUgMTIuMDg5NiA1LjQ3OTI2IDEyLjc3MDIgNS40NzkyNkMxMy40NTA3IDUuNDc5MjYgMTQuMDAyNCA2LjAzMDk1IDE0LjAwMjQgNi43MTE1TDE0LjAwMjQgOC43NjI0NkwxNC4wMDI5IDguMDE5ODNDMTQuMDAyOSA3LjMzOTI5IDE0LjU1NDYgNi43ODc1OSAxNS4yMzUyIDYuNzg3NTlDMTUuOTE1NyA2Ljc4NzU5IDE2LjQ2NzQgNy4zMzkyOCAxNi40Njc0IDguMDE5ODNWMTEuNDk3TDE2LjQ2NzUgMTIuNDQ2N0MxNi40Njc1IDE0LjA4MjEgMTUuODA5NiAxNS42NDg3IDE0LjY0MiAxNi43OTM4VjE3LjMyNjJDMTQuNjQyIDE3Ljc4NjQgMTQuMjY4OSAxOC4xNTk1IDEzLjgwODcgMTguMTU5NUg4LjE3MzE3QzcuNzEyOTMgMTguMTU5NSA3LjMzOTg0IDE3Ljc4NjQgNy4zMzk4NCAxNy4zMjYyVjE1Ljk0MjRMNS4zNDU2MiAxNC43NTM0QzQuNTg5MjQgMTQuMzAyNCA0LjEyNTkxIDEzLjQ4NjcgNC4xMjU4OSAxMi42MDYxTDQuMTI1ODMgOS4yODM4M0M0LjEyNTgyIDguOTU0MjcgNC4zMjAwMyA4LjY1NTY2IDQuNjIxMjkgOC41MjIwNUw2LjYxODE3IDcuNjM2MzRWNS41OTg3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNDg3OCAzLjI0OTAyQzExLjI3OTYgMy4yNDkwMiAxMS45Nzc4IDMuNjQ5MDIgMTIuMzkxNyA0LjI1Nzk2QzEyLjUxNTEgNC4yMzkwNiAxMi42NDE2IDQuMjI5MjYgMTIuNzcwMyA0LjIyOTI2QzEzLjcyMjQgNC4yMjkyNiAxNC41NDkzIDQuNzY1MzEgMTQuOTY1NyA1LjU1MjA3QzE1LjA1NDMgNS41NDI1IDE1LjE0NDIgNS41Mzc1OSAxNS4yMzUzIDUuNTM3NTlDMTYuNjA2MiA1LjUzNzU5IDE3LjcxNzYgNi42NDg5MyAxNy43MTc2IDguMDE5ODNMMTcuNzE3NyAxMi40NDY3QzE3LjcxNzcgMTQuMjM1NSAxNy4wNjQ3IDE1Ljk1NTkgMTUuODkyMSAxNy4yOTA0VjE3LjMyNjJDMTUuODkyMSAxOC40NzY4IDE0Ljk1OTQgMTkuNDA5NSAxMy44MDg4IDE5LjQwOTVIOC4xNzMzMkM3LjAyMjczIDE5LjQwOTUgNi4wODk5OCAxOC40NzY4IDYuMDg5OTggMTcuMzI2MlYxNi42NTI0TDQuNzA1NjMgMTUuODI3QzMuNTcxMDYgMTUuMTUwNSAyLjg3NjA3IDEzLjkyNzEgMi44NzYwNCAxMi42MDYxTDIuODc1OTggOS4yODM4NUMyLjg3NTk2IDguNDU5OTYgMy4zNjE0OSA3LjcxMzQ1IDQuMTE0NjIgNy4zNzk0TDUuMzY4MzIgNi44MjMzM1Y1LjU5ODc1QzUuMzY4MzIgNC4xMjg4NSA2LjU1OTkxIDIuOTM3MjYgOC4wMjk4MiAyLjkzNzI2QzguNjA4MzEgMi45MzcyNiA5LjE0MzU1IDMuMTIxNyA5LjU4MDA1IDMuNDM1MDVDOS44NTg1MyAzLjMxNTMyIDEwLjE2NTQgMy4yNDkwMiAxMC40ODc4IDMuMjQ5MDJaTTEyLjQ0NzkgNS41MjE4NlY5LjQ3NTU3QzEyLjQ0NzkgOS43Mjc2MiAxMi4yNDM2IDkuOTMxOTUgMTEuOTkxNiA5LjkzMTk1QzExLjc1NjggOS45MzE5NSAxMS41NjM0IDkuNzU0NjUgMTEuNTM4IDkuNTI2NjNDMTEuNTM2MSA5LjUwOTg3IDExLjUzNTIgOS40OTI4MyAxMS41MzUyIDkuNDc1NTdWNS40NzE1OEMxMS41MTU0IDUuMjAwODMgMTEuMzkzIDQuOTU4NTggMTEuMjA2NiA0Ljc4MzU4QzExLjAxODggNC42MDcxMSAxMC43NjU5IDQuNDk5MDIgMTAuNDg3OCA0LjQ5OTAyQzEwLjQ3NjYgNC40OTkwMiAxMC40NjU0IDQuNDk5MTkgMTAuNDU0MiA0LjQ5OTU0QzkuOTAzNDcgNC41MTY4NCA5LjQ1OTY0IDQuOTU4MjQgOS40Mzg0NCA1LjUwODAxQzkuNDM4MiA1LjUwNDMgOS40Mzc5NSA1LjUwMDU4IDkuNDM3NjkgNS40OTY4OFY5LjkwMjQzQzkuNDM3NjkgMTAuMTU0NSA5LjIzMzM2IDEwLjM1ODggOC45ODEzMSAxMC4zNTg4QzguNzI5MjUgMTAuMzU4OCA4LjUyNDkyIDEwLjE1NDUgOC41MjQ5MiA5LjkwMjQzVjQuMjc2NTNDOC4zNzA4NiA0LjIxODgyIDguMjA0MDIgNC4xODcyNiA4LjAyOTgyIDQuMTg3MjZDNy4yNTAyNyA0LjE4NzI2IDYuNjE4MzIgNC44MTkyIDYuNjE4MzIgNS41OTg3NUw2LjYxODI3IDkuOTc1OTlDNi42MTgyNyAxMC4yMjggNi40MTM5NCAxMC40MzI0IDYuMTYxODkgMTAuNDMyNEM1LjkwOTgzIDEwLjQzMjQgNS43MDU1IDEwLjIyOCA1LjcwNTUgOS45NzU5OVY4LjA0MTIyTDQuNjIxNDQgOC41MjIwNUM0LjMyMDE4IDguNjU1NjYgNC4xMjU5NyA4Ljk1NDI3IDQuMTI1OTggOS4yODM4M0w0LjEyNjA0IDEyLjYwNjFDNC4xMjYwNiAxMy40ODY3IDQuNTg5MzkgMTQuMzAyNCA1LjM0NTc2IDE0Ljc1MzRMNy4zMzk5OCAxNS45NDI0VjE3LjMyNjJDNy4zMzk5OCAxNy43ODY0IDcuNzEzMDggMTguMTU5NSA4LjE3MzMyIDE4LjE1OTVIMTMuODA4OEMxNC4yNjkgMTguMTU5NSAxNC42NDIxIDE3Ljc4NjQgMTQuNjQyMSAxNy4zMjYyVjE2Ljc5MzhDMTUuNzM4MSAxNS43MTkgMTYuMzg1IDE0LjI3MjggMTYuNDYwMyAxMi43NDdDMTYuNDY0NiAxMi42NiAxNi40NjcgMTIuNTcyOCAxNi40Njc2IDEyLjQ4NTRMMTYuNDY3NyAxMi40NDY3TDE2LjQ2NzYgOC4wMTk4M0MxNi40Njc2IDcuMzQ1MDQgMTUuOTI1MiA2Ljc5NjkzIDE1LjI1MjUgNi43ODc3MUwxNS4yMzUzIDYuNzg3NTlDMTUuMTI1IDYuNzg3NTkgMTUuMDE4IDYuODAyMSAxNC45MTYyIDYuODI5MzFWOS42MDEzNkMxNC45MTYyIDkuODUzNDIgMTQuNzExOSAxMC4wNTc3IDE0LjQ1OTggMTAuMDU3N0MxNC4yMDc4IDEwLjA1NzcgMTQuMDAzNCA5Ljg1MzQxIDE0LjAwMzQgOS42MDEzNlY3Ljk4OTg1QzE0LjAwMzIgNy45OTk4MiAxNC4wMDMxIDguMDA5ODEgMTQuMDAzMSA4LjAxOTgzTDE0LjAwMzQgOS42MDEzNkwxNC4wMDI1IDYuNzExNUMxNC4wMDI1IDYuNDQ5NzQgMTMuOTIwOSA2LjIwNzA1IDEzLjc4MTggNi4wMDc0OEMxMy41NjIgNS42OTI0MiAxMy4xOTg5IDUuNDg0ODMgMTIuNzg3IDUuNDc5MzdMMTIuNzcwMyA1LjQ3OTI2QzEyLjY1ODggNS40NzkyNiAxMi41NTA3IDUuNDk0MDggMTIuNDQ3OSA1LjUyMTg2WiIgZmlsbD0iIzFEMUMyMyIvPgo8L3N2Zz4="), auto';
  };

  /** Is there an error in the connection? */
  isErrorLine(
    fromPort?: WorkflowPortEntity,
    toPort?: WorkflowPortEntity,
  ): boolean {
    const linesService = this.linesServiceProvider();
    return linesService.isError(fromPort?.node?.id, toPort?.node?.id);
  }

  /** Are the lines vertical? */
  isVerticalLine(line: WorkflowLineEntity): boolean {
    return this.isSubCanvasLinkLine(line);
  }

  /** Does the line hide the arrow? */
  isHideArrowLine(line: WorkflowLineEntity): boolean {
    return this.isSubCanvasLinkLine(line);
  }

  /** Is the line disabled? */
  isDisabledLine(line: WorkflowLineEntity): boolean {
    return this.isSubCanvasLinkLine(line);
  }

  /** Can lines be deleted? */
  canDeleteLine(line: WorkflowLineEntity): boolean {
    if (
      line.from?.flowNodeType === StandardNodeType.Loop &&
      line.to?.flowNodeType === FlowNodeBaseType.SUB_CANVAS
    ) {
      return false;
    }
    if (
      line.from?.flowNodeType === StandardNodeType.Batch &&
      line.to?.flowNodeType === FlowNodeBaseType.SUB_CANVAS
    ) {
      return false;
    }
    return true;
  }

  /** Are the two ports allowed to connect? */
  // eslint-disable-next-line complexity -- TODO configuration move to node
  canAddLine(
    fromPort: WorkflowPortEntity,
    toPort: WorkflowPortEntity,
  ): boolean {
    // Cannot be the same node self-looping
    if (fromPort.node === toPort.node) {
      return false;
    }
    if (toPort.node.flowNodeType === StandardNodeType.Comment) {
      return false;
    }
    // Child canvas nodes connect to sub-nodes
    if (
      (fromPort.node.flowNodeType === FlowNodeBaseType.SUB_CANVAS &&
        fromPort.node === toPort.node.parent) ||
      (toPort.node.flowNodeType === FlowNodeBaseType.SUB_CANVAS &&
        toPort.node === fromPort.node.parent)
    ) {
      return true;
    }
    // Loop and loopFunction connections cannot be changed
    if (
      toPort.portID === 'loop-function-inline-input' ||
      fromPort.portID === 'loop-function-inline-output' ||
      fromPort.portID === 'loop-output-to-function'
    ) {
      return false;
    }
    if (
      toPort.portID === 'batch-function-inline-input' ||
      fromPort.portID === 'batch-function-inline-output' ||
      fromPort.portID === 'batch-output-to-function'
    ) {
      return false;
    }
    // Not in different containers
    if (fromPort.node.parent?.id !== toPort.node.parent?.id) {
      return false;
    }
    // Unable to connect to wrong port
    if (
      fromPort.node.flowNodeType === 'error' ||
      toPort.node.flowNodeType === 'error'
    ) {
      return false;
    }
    return true;
  }

  private isSubCanvasLinkLine(line: WorkflowLineEntity): boolean {
    if (
      line.fromPort.portID === 'loop-output-to-function' &&
      line.toPort?.portID === 'loop-function-input'
    ) {
      return true;
    }
    if (
      line.fromPort.portID === 'batch-output-to-function' &&
      line.toPort?.portID === 'batch-function-input'
    ) {
      return true;
    }
    return false;
  }

  allNodesDefaultExpanded = false;
}
