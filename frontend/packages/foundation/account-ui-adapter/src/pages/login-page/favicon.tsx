import FaviconBase from './favicon-base.png';
import FaviconAddon from './favicon-addon.png';

export const Favicon = () => (
  <div className="relative flex items-center">
    <img
      src={FaviconBase}
      className="w-[100px] h-[100px] rounded-[21px] border border-solid coz-stroke-plus"
    />
    <img
      src={FaviconAddon}
      className="absolute left-1/2 translate-x-[34px] top-[40px] w-[51px]"
    />
  </div>
);
