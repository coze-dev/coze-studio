import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFileAudioComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = false, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'illustration';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_file_audio${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 4.8C3 3.11984 3 2.27976 3.32698 1.63803C3.6146 1.07354 4.07354 0.614601 4.63803 0.32698C5.27976 0 6.11984 0 7.8 0H21.0118C21.7455 0 22.1124 0 22.4577 0.0828902C22.7638 0.15638 23.0564 0.277593 23.3249 0.442079C23.6276 0.627605 23.887 0.887032 24.4059 1.40589L31.5941 8.59411C32.113 9.11297 32.3724 9.3724 32.5579 9.67515C32.7224 9.94356 32.8436 10.2362 32.9171 10.5423C33 10.8876 33 11.2545 33 11.9882V31.2C33 32.8802 33 33.7202 32.673 34.362C32.3854 34.9265 31.9265 35.3854 31.362 35.673C30.7202 36 29.8802 36 28.2 36H7.8C6.11984 36 5.27976 36 4.63803 35.673C4.07354 35.3854 3.6146 34.9265 3.32698 34.362C3 33.7202 3 32.8802 3 31.2V4.8Z" fill={useCurrentColor ? 'currentColor' : '#00BF40'}/><path d="M23 1.15882C23 0.795333 23 0.613588 23.0719 0.52943C23.1342 0.456407 23.2278 0.417654 23.3235 0.425189C23.4339 0.433872 23.5624 0.562385 23.8194 0.819411L32.1806 9.18059C32.4376 9.43761 32.5661 9.56613 32.5748 9.67646C32.5823 9.7722 32.5436 9.86575 32.4706 9.92812C32.3864 10 32.2047 10 31.8412 10H27.8C26.1198 10 25.2798 10 24.638 9.67302C24.0735 9.3854 23.6146 8.92646 23.327 8.36197C23 7.72024 23 6.88016 23 5.2V1.15882Z" fill={useCurrentColor ? 'currentColor' : '#fff'} fillOpacity=".3"/><path d="M15.0833 29.25C14.1667 29.25 13.3819 28.9236 12.7292 28.2708C12.0764 27.6181 11.75 26.8333 11.75 25.9167C11.75 25 12.0764 24.2153 12.7292 23.5625C13.3819 22.9097 14.1667 22.5833 15.0833 22.5833C15.4028 22.5833 15.6979 22.6215 15.9688 22.6979C16.2396 22.7743 16.5 22.8889 16.75 23.0417V15.5C16.75 14.8096 17.3096 14.25 18 14.25H23V16.75H19.0417C18.6965 16.75 18.4167 17.0298 18.4167 17.375V25.9167C18.4167 26.8333 18.0903 27.6181 17.4375 28.2708C16.7847 28.9236 16 29.25 15.0833 29.25Z" fill={useCurrentColor ? 'currentColor' : '#fff'}/></svg>;
}

const IconCozFileAudio = React.forwardRef(IconCozFileAudioComponent);
export default IconCozFileAudio;
