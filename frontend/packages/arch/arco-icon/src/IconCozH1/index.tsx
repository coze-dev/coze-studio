import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozH1Component(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_h1${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2 3C1.44772 3 1 3.44772 1 4V20C1 20.5523 1.44772 21 2 21 2.55228 21 3 20.5523 3 20V13H12V20C12 20.5523 12.4477 21 13 21 13.5523 21 14 20.5523 14 20V4C14 3.44772 13.5523 3 13 3 12.4477 3 12 3.44772 12 4V11H3V4C3 3.44772 2.55228 3 2 3zM17.6039 12.9101C17.3376 13.0493 17.0185 12.8557 17.0186 12.5552 17.0188 12.0217 17.0196 11.7811 17.0227 10.9729 17.0232 10.8294 17.1006 10.6971 17.2255 10.6264L19.9946 9.05758C20.0568 9.0198 20.1265 9 20.1974 9H21.6014C21.8346 9 22.0236 9.2097 22.0236 9.46838V19.9492C22.0236 20.5416 21.5411 21.0219 20.9487 21.0219 20.3563 21.0219 19.8783 20.5416 19.8783 19.9492V11.7211L17.6039 12.9101z"/></svg>;
}

const IconCozH1 = React.forwardRef(IconCozH1Component);
export default IconCozH1;
