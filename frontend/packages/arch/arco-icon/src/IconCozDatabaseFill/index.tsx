import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozDatabaseFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_database_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 25 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M22.6233 6.5C22.6233 9.26142 18.1461 11.5 12.6233 11.5C7.10044 11.5 2.62329 9.26142 2.62329 6.5C2.62329 3.73858 7.10044 1.5 12.6233 1.5C18.1461 1.5 22.6233 3.73858 22.6233 6.5ZM22.6233 9.52894C21.2667 11.5425 17.3024 13 12.6233 13C7.94417 13 3.97991 11.5425 2.62329 9.52894V11.3873V12V12.6126C2.62329 13.2099 2.78534 13.8112 3.21681 14.2242C4.93577 15.8695 8.50228 17 12.6233 17C16.7443 17 20.3108 15.8695 22.0298 14.2242C22.4612 13.8112 22.6233 13.2099 22.6233 12.6126V12V11.3873V9.52894ZM12.6233 18.4985C17.3024 18.4985 21.2667 17.0411 22.6233 15.0275V16.8859V17.4985V18.1112C22.6233 18.7084 22.4612 19.3098 22.0298 19.7228C20.3108 21.368 16.7443 22.4985 12.6233 22.4985C8.50228 22.4985 4.93577 21.368 3.21681 19.7228C2.78534 19.3098 2.62329 18.7084 2.62329 18.1112V17.4985V16.8859V15.0275C3.97991 17.0411 7.94417 18.4985 12.6233 18.4985Z"/></svg>;
}

const IconCozDatabaseFill = React.forwardRef(IconCozDatabaseFillComponent);
export default IconCozDatabaseFill;
