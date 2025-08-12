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

import {
  DotStatus,
  type GenerateBackGroundModal,
  type GenerateAvatarModal,
  GenerateType,
} from '../../src/types/generate-image';
import {
  DEFAULT_BOT_GENERATE_AVATAR_MODAL,
  DEFAULT_BOT_GENERATE_BACKGROUND_MODAL,
  useGenerateImageStore,
} from '../../src/store/generate-image-store';

describe('useGenerateImageStore', () => {
  beforeEach(() => {
    useGenerateImageStore.getState().clearGenerateImageStore();
  });
  it('setGenerateAvatarModalByImmer', () => {
    const avatar: GenerateAvatarModal = DEFAULT_BOT_GENERATE_AVATAR_MODAL();

    useGenerateImageStore.getState().setGenerateAvatarModalByImmer(state => {
      state.gif.dotStatus = DotStatus.Generating;
    });

    expect(
      useGenerateImageStore.getState().generateAvatarModal.gif.dotStatus,
    ).toBe(DotStatus.Generating);

    expect(
      useGenerateImageStore.getState().generateAvatarModal.gif.loading,
    ).toBe(avatar.gif.loading);
  });

  it('setGenerateAvatarModalByImmer', () => {
    const avatar: GenerateBackGroundModal =
      DEFAULT_BOT_GENERATE_BACKGROUND_MODAL();

    useGenerateImageStore
      .getState()
      .setGenerateBackgroundModalByImmer(state => {
        state.gif.dotStatus = DotStatus.Generating;
      });

    expect(
      useGenerateImageStore.getState().generateBackGroundModal.gif.dotStatus,
    ).toBe(DotStatus.Generating);

    expect(
      useGenerateImageStore.getState().generateBackGroundModal.gif.loading,
    ).toBe(avatar.gif.loading);
  });

  it('resets the generateAvatarModal to default', () => {
    useGenerateImageStore.getState().setGenerateAvatarModal({
      visible: false,
      activeKey: GenerateType.Static,
      selectedImage: { id: '', img_info: {} },
      generatingTaskId: undefined,
      gif: {
        loading: false,
        dotStatus: DotStatus.None,
        text: '',
        image: { id: '', img_info: {} },
      },
      image: {
        loading: false,
        dotStatus: DotStatus.None,
        text: '',
        textCustomizable: false,
      },
    });

    useGenerateImageStore.getState().resetGenerateAvatarModal();

    expect(useGenerateImageStore.getState().generateAvatarModal).toEqual(
      DEFAULT_BOT_GENERATE_AVATAR_MODAL(),
    );
  });
  it('clears the image and notice lists when clearGenerateImageStore is called', () => {
    useGenerateImageStore.getState().updateImageList([{ id: '1' }]);
    useGenerateImageStore.getState().updateNoticeList([{ un_read: true }]);

    useGenerateImageStore.getState().clearGenerateImageStore();

    expect(useGenerateImageStore.getState().imageList).toEqual([]);
    expect(useGenerateImageStore.getState().noticeList).toEqual([]);
    expect(useGenerateImageStore.getState().generateAvatarModal).toEqual(
      DEFAULT_BOT_GENERATE_AVATAR_MODAL(),
    );
    expect(useGenerateImageStore.getState().generateBackGroundModal).toEqual(
      DEFAULT_BOT_GENERATE_BACKGROUND_MODAL(),
    );
  });

  it('adds an image to an empty imageList correctly', () => {
    const image = { id: '1', url: 'http://example.com/image1.png' };
    useGenerateImageStore.getState().pushImageList(image);
    expect(useGenerateImageStore.getState().imageList).toEqual([image]);
  });

  it('adds multiple images to imageList correctly', () => {
    const image1 = { id: '1', url: 'http://example.com/image1.png' };
    const image2 = { id: '2', url: 'http://example.com/image2.png' };
    useGenerateImageStore.getState().pushImageList(image1);
    useGenerateImageStore.getState().pushImageList(image2);
    expect(useGenerateImageStore.getState().imageList).toEqual([
      image1,
      image2,
    ]);
  });

  it('retains existing images in imageList when a new image is added', () => {
    const image1 = { id: '1', url: 'http://example.com/image1.png' };
    const image2 = { id: '2', url: 'http://example.com/image2.png' };
    useGenerateImageStore.getState().pushImageList(image1);
    useGenerateImageStore.getState().pushImageList(image2);
    expect(useGenerateImageStore.getState().imageList).toEqual([
      image1,
      image2,
    ]);
  });
});
