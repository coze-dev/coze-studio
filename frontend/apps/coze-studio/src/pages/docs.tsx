import { useEffect } from 'react';

const DocsRedirect = () => {
  useEffect(() => {
    location.href = `https://www.coze.cn${location.pathname}`;
  }, []);
  return null;
};

export default DocsRedirect;
