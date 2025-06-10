import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPythonComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_python${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path fillRule="evenodd" clipRule="evenodd" d="M6 6C6.00006 3.23866 8.23858 1 11 1H13C15.7614 1 18 3.23858 18 6C20.7614 6 23 8.23858 23 11V13C23 15.7614 20.7614 18 18 18C18 20.7614 15.7614 23 13 23H11C8.23858 23 6 20.7614 6 18C3.23858 18 1 15.7614 1 13V11C1 8.23857 3.23858 6 6 6ZM7.00088 8L11 8C11.5523 8 12 7.55228 12 7C12 6.44772 11.5523 6 11 6L8 6C8.00006 4.34316 9.34321 3 11 3H13C14.6569 3 16 4.34315 16 6V9C16 10.1046 15.1046 11 14 11H10C7.79086 11 6 12.7909 6 15L6 16C4.34314 16 3 14.6569 3 13L3 11C3 9.34314 4.34315 8 6 8H6.99912C6.99941 8 7.00059 8 7.00088 8C7.00059 8 7.00118 8 7.00088 8ZM18 8V9C18 11.2091 16.2091 13 14 13H10C8.89543 13 8 13.8954 8 15V18C8 19.6569 9.34315 21 11 21H13C14.6569 21 16 19.6569 16 18H13C12.4477 18 12 17.5523 12 17C12 16.4477 12.4477 16 13 16H18C19.6569 16 21 14.6569 21 13V11C21 9.34315 19.6569 8 18 8Z"/></svg>;
}

const IconCozPython = React.forwardRef(IconCozPythonComponent);
export default IconCozPython;
