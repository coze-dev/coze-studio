import { useEffect, useState } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';

import { EncapsulateRenderService } from '../encapsulate-render-service';
import { EncapsulateService } from '../../encapsulate';

export const useEncapsulate = () => {
  const encapsulateService = useService<EncapsulateService>(EncapsulateService);
  const encapsulateRenderService = useService<EncapsulateRenderService>(
    EncapsulateRenderService,
  );
  const [loading, setLoading] = useState(encapsulateRenderService.loading);

  useEffect(() => {
    const disposable = encapsulateRenderService.onLoadingChange(setLoading);
    return () => {
      disposable.dispose();
    };
  }, []);

  const handleEncapsulate = async () => {
    encapsulateRenderService.setLoading(true);
    try {
      await encapsulateService.encapsulate();
      encapsulateRenderService.closeModal();
    } catch (e) {
      console.error(e);
    }
    encapsulateRenderService.setLoading(false);
  };

  return {
    handleEncapsulate,
    loading,
  };
};
