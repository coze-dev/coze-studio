import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowBackComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_arrow_back${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M15.5 7.00002H5.87869L8.4139 4.4648C8.80442 4.07428 8.80442 3.44113 8.4139 3.05061C8.02338 2.66009 7.39023 2.66009 6.99971 3.05061L2.75737 7.29291C2.56211 7.48817 2.46448 7.7441 2.46448 8.00002C2.46448 8.25594 2.56211 8.51186 2.75737 8.70713L7.00347 12.9527C7.39227 13.3414 8.0226 13.3414 8.41137 12.9526C8.79952 12.5645 8.80026 11.9354 8.41303 11.5463L5.87869 9.00002H15.2652C17.1982 9.00002 20.2652 10.9807 20.2652 14C20.2652 17.0193 17.1982 19.0199 15.2652 19.0199H11.6269C11.0801 19.0199 10.6368 19.4632 10.6368 20.0099C10.6368 20.5567 11.0801 21 11.6269 21H15.5C19.366 21 22.5 17.866 22.5 14C22.5 10.134 19.366 7.00002 15.5 7.00002Z"/></svg>;
}

const IconCozArrowBack = React.forwardRef(IconCozArrowBackComponent);
export default IconCozArrowBack;
