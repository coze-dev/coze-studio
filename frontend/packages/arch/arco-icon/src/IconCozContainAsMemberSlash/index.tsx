import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozContainAsMemberSlashComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_contain_as_member_slash${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M4.22075 18.364C3.83023 18.7545 3.83023 19.3877 4.22075 19.7782 4.61127 20.1687 5.24444 20.1687 5.63496 19.7782L19.7771 5.63606C20.1676 5.24554 20.1676 4.61237 19.7771 4.22185 19.3866 3.83132 18.7534 3.83133 18.3629 4.22185L4.22075 18.364zM8.03338 19.5L10.0334 17.5H12.4978C15.1939 17.5 17.4369 15.5601 17.9072 13H14.5334L16.5334 11H17.9072C17.8394 10.6311 17.7348 10.2752 17.5974 9.93598L19.0982 8.43525C19.672 9.49555 19.9978 10.7097 19.9978 12 19.9978 16.1422 16.64 19.5 12.4978 19.5H8.03338zM9.46231 11L7.46231 13H5.99785C5.44556 13 4.99785 12.5523 4.99785 12 4.99785 11.4477 5.44556 11 5.99785 11H9.46231zM15.386 5.07631L13.8058 6.6565C13.3866 6.55424 12.9486 6.50002 12.4978 6.50002H5.99785C5.44556 6.50002 4.99785 6.05231 4.99785 5.50002 4.99785 4.94774 5.44556 4.50002 5.99785 4.50002H12.4978C13.5214 4.50002 14.4971 4.70506 15.386 5.07631z"/></svg>;
}

const IconCozContainAsMemberSlash = React.forwardRef(IconCozContainAsMemberSlashComponent);
export default IconCozContainAsMemberSlash;
