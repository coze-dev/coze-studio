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

import { Container } from '../container';

import s from './index.module.less';

export const StepCard = (props: {
  content: string;
  title: string;
  imgSrc?: string;
}) => {
  const { imgSrc, content, title } = props;

  return (
    <>
      {imgSrc ? <img className={s.image} src={imgSrc} /> : null}

      <Container>
        <div className={s.title}>{title}</div>
        <div className={s.content}>{content}</div>
      </Container>
    </>
  );
};
