import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImportComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_import${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M22 4C22 2.89543 21.1046 2 20 2H4C2.89543 2 2 2.89543 2 4V9.5H4V4H20V20H4V14.5H2V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V4Z"/><path d="M0.5 12C0.5 11.4477 0.947716 11 1.5 11H9.75V9.46485C9.75 9.06658 10.1929 8.82817 10.5254 9.04751L14.3675 11.5827C14.667 11.7803 14.667 12.2197 14.3675 12.4173L10.5254 14.9525C10.1929 15.1718 9.75 14.9334 9.75 14.5352V13H1.5C0.947716 13 0.5 12.5523 0.5 12Z"/></svg>;
}

const IconCozImport = React.forwardRef(IconCozImportComponent);
export default IconCozImport;
