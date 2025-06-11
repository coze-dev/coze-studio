import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozImportFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_import_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M2.00001 4C2.00001 2.89543 2.89544 2 4.00001 2H20C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H4.00001C2.89544 22 2.00001 21.1046 2.00001 20V14.5H8.24992V14.5352C8.24992 16.1283 10.0217 17.0819 11.3514 16.2045L15.1935 13.6694C16.3916 12.8789 16.3916 11.1212 15.1935 10.3307L11.3514 7.79553C10.0217 6.91815 8.24992 7.87179 8.24992 9.46488V9.49996H2.00001V4Z"/><path d="M14.3674 12.4174C14.6669 12.2198 14.6669 11.7803 14.3674 11.5827L10.5253 9.04755C10.1929 8.8282 9.74992 9.06661 9.74992 9.46488V11H1.5C0.947714 11 0.5 11.4477 0.5 12C0.5 12.5522 0.947714 13 1.5 13H9.74992V14.5352C9.74992 14.9335 10.1929 15.1719 10.5253 14.9525L14.3674 12.4174Z"/></svg>;
}

const IconCozImportFill = React.forwardRef(IconCozImportFillComponent);
export default IconCozImportFill;
