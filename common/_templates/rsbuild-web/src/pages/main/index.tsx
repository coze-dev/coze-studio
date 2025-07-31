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

import { Link } from 'react-router-dom';
import { useState } from 'react';

import rsbuildLogo from '@/assets/rsbuild.png';
import reactLogo from '@/assets/react.svg';

import s from './index.module.less';

export function MainPage() {
  const [count, setCount] = useState(0);

  return (
    <div className={s.container}>
      <div className="flex items-center justify-center mb-12">
        <a href="https://www.rsbuild.dev" target="_blank" rel="noreferrer">
          <img
            src={rsbuildLogo}
            className="h-16 p-1.5 mr-12"
            alt="Rsbuild logo"
          />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className="h-16 p-1.5 animate-[spin_20s_linear_infinite]"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-3xl">Rsbuild + React</h1>
      <div className="p-4">
        <button
          type="button"
          className="p-2 mb-4 bg-blue-500 rounded-md text-slate-50"
          onClick={() => setCount(c => c + 1)}
        >
          count is {count}
        </button>
        <p>
          Edit <code className="text-sm font-mono">src/App.tsx</code> and save
          to test HMR
        </p>
      </div>
      <Link to="page1" className="font-light underline text-blue-600">
        page1
      </Link>
      <p className="mt-8 text-gray-400 font-light">
        Click on the Rsbuild and React logos to learn more
      </p>
    </div>
  );
}
