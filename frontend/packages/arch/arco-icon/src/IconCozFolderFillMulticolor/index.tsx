import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFolderFillMulticolorComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = false, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_folder_fill_multicolor${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 4.00006C1 2.89549 1.89543 2.00006 3 2.00006H9.17157C9.70201 2.00006 10.2107 2.21077 10.5858 2.58585L12 4.00006H21C22.1046 4.00006 23 4.89549 23 6.00006V19.0001C23 20.1046 22.1046 21.0001 21 21.0001H3C1.89543 21.0001 1 20.1046 1 19.0001V4.00006Z" fill={useCurrentColor ? 'currentColor' : '#409AEB'}/><path d="M1 7.86719C1 6.76262 1.89109 5.86719 2.99566 5.86719C7.49649 5.86719 16.9008 5.86719 21.0085 5.86719C22.1131 5.86719 23 6.76262 23 7.86719L23 19.0005C23 20.1051 22.1046 21.0005 21 21.0005H3C1.89543 21.0005 1 20.1051 1 19.0005V7.86719Z" fill={useCurrentColor ? 'currentColor' : '#6CBAFF'}/></svg>;
}

const IconCozFolderFillMulticolor = React.forwardRef(IconCozFolderFillMulticolorComponent);
export default IconCozFolderFillMulticolor;
