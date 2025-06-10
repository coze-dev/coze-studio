import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSettingFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_setting_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M14.5 11.9999C14.5 13.3807 13.3807 14.4999 12 14.4999C10.6193 14.4999 9.49999 13.3807 9.49999 11.9999C9.49999 10.6192 10.6193 9.49994 12 9.49994C13.3807 9.49994 14.5 10.6192 14.5 11.9999Z"/><path fillRule="evenodd" clipRule="evenodd" d="M3.99294 19.3546C4.19933 19.5967 4.51509 19.7132 4.83136 19.6786L7.77013 19.3574L8.96505 22.0814C9.09272 22.3724 9.35078 22.5878 9.66313 22.6465C11.2391 22.9424 12.7608 22.9424 14.3368 22.6465C14.6491 22.5878 14.9072 22.3724 15.0349 22.0814L16.2298 19.3574L19.1685 19.6786C19.4848 19.7132 19.8006 19.5967 20.007 19.3546C21.041 18.1415 21.8167 16.7965 22.346 15.2885C22.4505 14.9906 22.3938 14.6617 22.208 14.4065L20.4553 12L22.208 9.59345C22.3938 9.33823 22.4505 9.00933 22.346 8.71141C21.818 7.20715 21.0436 5.86153 20.007 4.64533C19.8006 4.4032 19.4848 4.28675 19.1685 4.32132L16.2298 4.64252L15.0349 1.91855C14.9072 1.62751 14.6491 1.41209 14.3368 1.35344C12.7608 1.05756 11.2391 1.05756 9.66313 1.35344C9.35078 1.41209 9.09272 1.62751 8.96505 1.91855L7.77013 4.64252L4.83136 4.32131C4.51509 4.28675 4.19933 4.4032 3.99295 4.64533C2.95895 5.85844 2.18323 7.20344 1.65393 8.71141C1.54936 9.00933 1.60607 9.33823 1.79195 9.59345L3.54463 12L1.79195 14.4065C1.60607 14.6617 1.54936 14.9906 1.65393 15.2885C2.18191 16.7928 2.95631 18.1384 3.99294 19.3546ZM16.5 11.9999C16.5 14.4852 14.4853 16.4999 12 16.4999C9.51471 16.4999 7.49999 14.4852 7.49999 11.9999C7.49999 9.51466 9.51471 7.49994 12 7.49994C14.4853 7.49994 16.5 9.51466 16.5 11.9999Z"/></svg>;
}

const IconCozSettingFill = React.forwardRef(IconCozSettingFillComponent);
export default IconCozSettingFill;
