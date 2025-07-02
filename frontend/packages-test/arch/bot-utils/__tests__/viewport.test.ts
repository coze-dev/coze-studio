import { setMobileBody, setPCBody } from '../src/viewport';

describe('viewport', () => {
  it('#setMobileBody', () => {
    setMobileBody();
    const bodyStyle = document?.body?.style;
    const htmlStyle = document?.getElementsByTagName('html')?.[0]?.style;
    expect(bodyStyle.minWidth).toEqual('0');
    expect(bodyStyle.minHeight).toEqual('0');
    expect(htmlStyle.minWidth).toEqual('0');
    expect(htmlStyle.minHeight).toEqual('0');
  });

  it('#setPCBody', () => {
    setPCBody();
    const bodyStyle = document?.body?.style;
    const htmlStyle = document?.getElementsByTagName('html')?.[0]?.style;
    expect(bodyStyle.minWidth).toEqual('1200px');
    expect(bodyStyle.minHeight).toEqual('600px');
    expect(htmlStyle.minWidth).toEqual('1200px');
    expect(htmlStyle.minHeight).toEqual('600px');
  });
});
