import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozAlignRightComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_align_right${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21.3333 1.86668C21.3333 1.57212 21.0945 1.33334 20.8 1.33334H19.8667C19.5721 1.33334 19.3333 1.57212 19.3333 1.86668V22.1333C19.3333 22.4279 19.5721 22.6667 19.8667 22.6667H20.8C21.0945 22.6667 21.3333 22.4279 21.3333 22.1333V1.86668zM4.14613 17.1C3.85157 17.1 3.61279 16.7033 3.61279 16.2138V14.3862C3.61279 13.8968 3.85157 13.5 4.14613 13.5H16.4016C16.6962 13.5 16.935 13.8968 16.935 14.3862V16.2138C16.935 16.7033 16.6962 17.1 16.4016 17.1H4.14613zM8.1376 10.5C7.84305 10.5 7.60427 10.1032 7.60427 9.61381V7.78615C7.60427 7.29673 7.84305 6.89998 8.1376 6.89998H16.4016C16.6962 6.89998 16.935 7.29673 16.935 7.78615V9.61381C16.935 10.1032 16.6962 10.5 16.4016 10.5H8.1376z"/></svg>;
}

const IconCozAlignRight = React.forwardRef(IconCozAlignRightComponent);
export default IconCozAlignRight;
