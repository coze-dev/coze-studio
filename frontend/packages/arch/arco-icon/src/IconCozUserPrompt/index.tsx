import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozUserPromptComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_user_prompt${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M10.4999 1.5C13.2599 1.5 15.4999 3.7385 15.4999 6.5C15.4999 9.2615 13.2599 11.5 10.4999 11.5C7.73988 11.5 5.49988 9.2615 5.49988 6.5C5.49988 3.7385 7.73988 1.5 10.4999 1.5ZM7.49988 6.5C7.49988 8.157 8.84488 9.5 10.4999 9.5C12.1549 9.5 13.4999 8.157 13.4999 6.5C13.4999 4.843 12.1549 3.5 10.4999 3.5C8.84488 3.5 7.49988 4.843 7.49988 6.5Z"/><path d="M4.12488 18C4.04488 18.3195 3.99988 18.6545 3.99988 19V20H12.4999V22H3.99988C2.89988 22 1.99988 21.1 1.99988 20V19C1.99988 15.6865 4.68488 13 7.99988 13H12.4999V15H7.99988C6.13488 15 4.56988 16.275 4.12488 18zM22.5 14C22.7761 14 23 13.7761 23 13.5V12.5C23 12.2239 22.7761 12 22.5 12L16.5 12C16.2239 12 16 12.2239 16 12.5V13.5C16 13.7761 16.2239 14 16.5 14H22.5zM23 17.5C23 17.7761 22.7761 18 22.5 18H14.5C14.2239 18 14 17.7761 14 17.5V16.5C14 16.2239 14.2239 16 14.5 16H22.5C22.7761 16 23 16.2239 23 16.5V17.5zM20.5 22C20.7761 22 21 21.7761 21 21.5V20.5C21 20.2239 20.7761 20 20.5 20H14.5C14.2239 20 14 20.2239 14 20.5V21.5C14 21.7761 14.2239 22 14.5 22H20.5z"/></svg>;
}

const IconCozUserPrompt = React.forwardRef(IconCozUserPromptComponent);
export default IconCozUserPrompt;
