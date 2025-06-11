import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFolderBracketComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_folder_bracket${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M1 5C1 3.89543 1.89543 3 3 3H4C4.55228 3 5 3.44772 5 4 5 4.55228 4.55228 5 4 5H3V19H4C4.55228 19 5 19.4477 5 20 5 20.5523 4.55228 21 4 21H3C1.89543 21 1 20.1046 1 19V5zM23 5C23 3.89543 22.1046 3 21 3H20C19.4477 3 19 3.44772 19 4 19 4.55228 19.4477 5 20 5H21V19H20C19.4477 19 19 19.4477 19 20 19 20.5523 19.4477 21 20 21H21C22.1046 21 23 20.1046 23 19V5z"/><path fillRule="evenodd" clipRule="evenodd" d="M4.5 8C4.5 6.89543 5.39543 6 6.5 6H9.67157C10.202 6 10.7107 6.21071 11.0858 6.58579L12 7.5H17.5C18.6046 7.5 19.5 8.39543 19.5 9.5V16C19.5 17.1046 18.6046 18 17.5 18H6.5C5.39543 18 4.5 17.1046 4.5 16V8ZM10.5858 8.91421C10.9609 9.28929 11.4696 9.5 12 9.5H17.5V16H6.5V8H9.67157L10.5858 8.91421Z"/></svg>;
}

const IconCozFolderBracket = React.forwardRef(IconCozFolderBracketComponent);
export default IconCozFolderBracket;
