import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFolderFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_folder_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 4C1 2.89543 1.89543 2 3 2H9.17157C9.70201 2 10.2107 2.21071 10.5858 2.58579L12 4H21C22.1046 4 23 4.89543 23 6V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V4Z"/></svg>;
}

const IconCozFolderFill = React.forwardRef(IconCozFolderFillComponent);
export default IconCozFolderFill;
