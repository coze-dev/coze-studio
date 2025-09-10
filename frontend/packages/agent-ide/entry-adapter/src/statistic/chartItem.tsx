import React, { useRef, useEffect } from 'react';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/bot-semi';
import { Line } from '@antv/g2plot';

export const BotStatisticChartItem: React.FC = ({
  title = '',
  description = '',
}: {
  title: string;
  description: string;
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dom = chartRef.current;
    if (dom) {
      fetch(
        'https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json',
      )
        .then(res => res.json())
        .then(data => {
          const line = new Line(dom, {
            data,
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            xAxis: {
              type: 'time',
            },
            yAxis: {
              label: {
                // 数值格式化为千分位
                formatter: v =>
                  `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`),
              },
            },
          });

          line.render();
        });
    }
  }, []);

  return (
    <div className="bg-white min-h-[220px] border border-solid border-gray-200 rounded-[8px] p-[24px]">
      <div className="flex items-center gap-[6px] mb-[12px]">
        <div className="text-[14px] font-[500]">{title}</div>
        <Tooltip content={description} position="top">
          <IconCozInfoCircle className="w-[14px] h-[14px] block text-gray-400" />
        </Tooltip>
      </div>
      <div className="w-full h-[218px]" ref={chartRef} />
    </div>
  );
};

export default BotStatisticChartItem;
