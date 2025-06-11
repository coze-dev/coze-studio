import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPuzzleFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_puzzle_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M12.5 3.33332C12.5 2.04466 11.3807 1 10 1C8.61932 1 7.50003 2.04466 7.50003 3.33332C7.50003 3.72083 7.7261 4.29728 8.04227 4.91399C8.29169 5.40049 7.95592 6 7.40921 6H4C2.89543 6 2 6.89543 2 8V11.4092C2 11.9559 2.59951 12.2917 3.08601 12.0422C3.70272 11.7261 4.27917 11.5 4.66668 11.5C5.95534 11.5 7 12.6193 7 14C7 15.3807 5.95534 16.5 4.66668 16.5C4.27917 16.5 3.70272 16.2739 3.08601 15.9578C2.59951 15.7083 2 16.0441 2 16.5908V20C2 21.1046 2.89543 22 4 22H16C17.1046 22 18 21.1046 18 20V16.5908C18 16.0441 18.5995 15.7083 19.086 15.9577C19.7027 16.2739 20.2792 16.5 20.6667 16.5C21.9554 16.5 23 15.3807 23 14C23 12.6193 21.9554 11.5 20.6667 11.5C20.2792 11.5 19.7027 11.7261 19.086 12.0423C18.5995 12.2917 18 11.9559 18 11.4092V8C18 6.89543 17.1046 6 16 6H12.5909C12.0441 6 11.7084 5.40049 11.9578 4.91399C12.274 4.29728 12.5 3.72083 12.5 3.33332Z"/></svg>;
}

const IconCozPuzzleFill = React.forwardRef(IconCozPuzzleFillComponent);
export default IconCozPuzzleFill;
