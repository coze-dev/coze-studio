import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTemplateFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_template_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 2.89543 2.89543 2 4 2H10.25C10.8023 2 11.25 2.44772 11.25 3V21C11.25 21.5523 10.8023 22 10.25 22H4C2.89543 22 2 21.1046 2 20V4ZM12.75 3C12.75 2.44772 13.1977 2 13.75 2H20C21.1046 2 22 2.89543 22 4V10.25C22 10.8023 21.5523 11.25 21 11.25H13.75C13.1977 11.25 12.75 10.8023 12.75 10.25V3ZM13.75 12.75C13.1977 12.75 12.75 13.1977 12.75 13.75V21C12.75 21.5523 13.1977 22 13.75 22H20C21.1046 22 22 21.1046 22 20V13.75C22 13.1977 21.5523 12.75 21 12.75H13.75Z"/></svg>;
}

const IconCozTemplateFill = React.forwardRef(IconCozTemplateFillComponent);
export default IconCozTemplateFill;
