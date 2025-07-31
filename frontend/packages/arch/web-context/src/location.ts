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

// The redirect function is designed to redirect the user to a new URL.
// It takes a single argument href which is a string representing the URL.
// Upon invocation, it sets location.href to the provided URL, thereby navigating to the webpage.
// While no validation logic is currently implemented prior to redirection,
// there is the potential for such checks to be included in the future as per your requirements.
export const redirect = (href: string) => {
  // Here, some verification logic can be added later.
  location.href = href;
};
