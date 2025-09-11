import React, { useRef, useState, useEffect } from 'react';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Spin } from '@coze-arch/bot-semi';
import { Line } from '@antv/g2plot';

const request = (url, params?: {}, method?: string) =>
  fetch(url, {
    method: method || 'POST',
    headers:
      method !== 'GET'
        ? {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Agw-Js-Conv': 'str',
            'x-requested-with': 'XMLHttpRequest',
          }
        : undefined,
    body: method !== 'GET' ? JSON.stringify(params) : undefined,
  })
    .then(res => res.json())
    .then(res => {
      if (typeof res.code === 'number' && res.code !== 0) {
        throw new Error(res.msg);
      } else {
        return res;
      }
    });

export const BotStatisticChartItem: React.FC = ({
  title = '',
  description = '',
  updateTimestamp,
  dateRange,
  api,
  botId,
  spaceId,
  dataAdapter,
}: {
  title: string;
  description: string;
  updateTimestamp: number;
  dateRange: [number, number];
  botId: string;
  spaceId: string;
  api: string;
  dataAdapter?: (data) => [];
}) => {
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const lineChart = useRef<Line | null>(null);

  useEffect(() => {
    const dom = chartRef.current;
    if (dom) {
      const line = new Line(dom, {
        data: [],
        xField: 'date',
        yField: 'value',
        seriesField: 'category',
        xAxis: {
          type: 'time',
        },
        yAxis: {
          label: {
            formatter: v =>
              `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`),
          },
        },
      });
      lineChart.current = line;
      line.render();
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    request(api, {
      agent_id: botId,
      start_time: dateRange[0],
      end_time: dateRange[1],
      _updateTimestamp: updateTimestamp,
    })
      .then(res => {
        const list = dataAdapter?.(res.data);
        console.log('res', list);
        const line = lineChart.current;
        if (line) {
          line.changeData(list);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [updateTimestamp, dateRange, api, botId, dataAdapter]);

  return (
    <div className="bg-white min-h-[220px] border border-solid border-gray-200 rounded-[8px] p-[24px]">
      <div className="flex items-center gap-[6px] mb-[12px]">
        <div className="text-[14px] font-[500]">{title}</div>
        <Tooltip content={description} position="top">
          <IconCozInfoCircle className="w-[14px] h-[14px] block text-gray-400" />
        </Tooltip>
      </div>
      <Spin spinning={loading}>
        <div className="w-full h-[218px]" ref={chartRef} />
      </Spin>
    </div>
  );
};

export default BotStatisticChartItem;
