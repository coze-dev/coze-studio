import { expect, it } from 'vitest';

import { SchemaExtractor } from '..';
import { imageflowSchemaJSON } from './resource/imageflow-schema';
import { imageflowExtractorConfig } from './resource/imageflow-config';

it('extract imageflow schema', () => {
  const schemaExtractor = new SchemaExtractor(imageflowSchemaJSON);
  const extractedImageflowSchema = schemaExtractor.extract(
    imageflowExtractorConfig,
  );
  expect(extractedImageflowSchema).toStrictEqual([
    {
      nodeId: '164069',
      nodeType: '4',
      properties: {
        inputs: [
          { name: 'prompt', value: 'ss', isImage: false },
          { name: 'ratio', value: 'sss', isImage: false },
          { name: 'width', value: 'sss', isImage: false },
          { name: 'height', value: 'ss', isImage: false },
        ],
      },
    },
    {
      nodeId: '164578',
      nodeType: '4',
      properties: {
        inputs: [
          { name: 'reference_picture_url', value: 'ss', isImage: false },
          { name: 'skin', value: 'data', isImage: false },
          { name: 'template_picture_url', value: 'msg', isImage: false },
        ],
      },
    },
    {
      nodeId: '146804',
      nodeType: '4',
      properties: {
        inputs: [{ name: 'prompt', value: 'data', isImage: false }],
      },
    },
    {
      nodeId: '140741',
      nodeType: '4',
      properties: {
        inputs: [
          { name: 'bright', value: 'sss', isImage: false },
          { name: 'origin_url', value: 'data', isImage: false },
        ],
      },
    },
  ]);
});
