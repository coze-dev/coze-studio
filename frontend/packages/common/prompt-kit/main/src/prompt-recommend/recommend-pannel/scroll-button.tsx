import {
  IconCozArrowLeftFill,
  IconCozArrowRightFill,
} from '@coze/coze-design/icons';

export const LeftScrollButton = ({
  handleScroll,
}: {
  handleScroll: () => void;
}) => (
  <div
    className="absolute bottom-0 left-0 top-0 w-8 z-10"
    style={{
      background:
        'linear-gradient(90deg, #F9F9F9 0%, rgba(249, 249, 249, 0.00) 100%)',
    }}
  >
    <div
      onClick={handleScroll}
      className="w-6 h-6 coz-bg-max flex justify-center items-center absolute left-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer rounded-lg coz-stroke-primary coz-shadow-small"
    >
      <IconCozArrowLeftFill className="w-4 h-4" />
    </div>
  </div>
);

export const RightScrollButton = ({
  handleScroll,
}: {
  handleScroll: () => void;
}) => (
  <div
    className="absolute bottom-0 right-0 top-0 w-8"
    style={{
      background:
        'linear-gradient(270deg, #F9F9F9 0%, rgba(249, 249, 249, 0.00) 100%)',
    }}
  >
    <div
      onClick={handleScroll}
      className="w-6 h-6 coz-bg-max flex justify-center items-center absolute right-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer rounded-lg coz-stroke-primary coz-shadow-small"
    >
      <IconCozArrowRightFill className="w-4 h-4" />
    </div>
  </div>
);
