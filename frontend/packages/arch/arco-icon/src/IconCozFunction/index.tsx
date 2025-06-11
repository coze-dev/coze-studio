import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFunctionComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_function${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M6.70369 5.81874C6.95722 4.19616 8.35479 3 9.99706 3H11.5C12.0523 3 12.5 3.44772 12.5 4 12.5 4.55228 12.0523 5 11.5 5H9.99706C9.34015 5 8.78112 5.47846 8.67971 6.1275L8.23088 9H10.5C11.0523 9 11.5 9.44772 11.5 10 11.5 10.5523 11.0523 11 10.5 11H7.91838L6.79631 18.1813C6.54278 19.8038 5.14521 21 3.50294 21H2C1.44772 21 1 20.5523 1 20 1 19.4477 1.44772 19 2 19H3.50294C4.15985 19 4.71888 18.5215 4.82029 17.8725L5.89412 11H3.5C2.94772 11 2.5 10.5523 2.5 10 2.5 9.44772 2.94772 9 3.5 9H6.20662L6.70369 5.81874zM13.5 9C12.9477 9 12.5 9.44772 12.5 10 12.5 10.5523 12.9477 11 13.5 11H14.632C14.7056 11 14.7705 11.0483 14.7916 11.1188L15.9152 14.8643 13.4824 18.9191C13.4522 18.9693 13.398 19 13.3394 19H12C11.4477 19 11 19.4477 11 20 11 20.5523 11.4477 21 12 21H13.3394C14.1005 21 14.8058 20.6007 15.1973 19.9481L16.6927 17.4558 17.2927 19.4559C17.5677 20.3724 18.4112 21 19.368 21H20.5C21.0523 21 21.5 20.5523 21.5 20 21.5 19.4477 21.0523 19 20.5 19H19.368C19.2944 19 19.2295 18.9517 19.2084 18.8812L18.0848 15.1357 20.5176 11.0809C20.5478 11.0307 20.602 11 20.6606 11H22C22.5523 11 23 10.5523 23 10 23 9.44772 22.5523 9 22 9H20.6606C19.8995 9 19.1942 9.39931 18.8027 10.0519L17.3073 12.5442 16.7073 10.5441C16.4323 9.62761 15.5888 9 14.632 9H13.5z"/></svg>;
}

const IconCozFunction = React.forwardRef(IconCozFunctionComponent);
export default IconCozFunction;
