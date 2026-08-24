// 组件用途：封装后台图表实例的初始化、响应式和销毁。
import { useEffect, useRef } from 'react';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, PieChart, GridComponent, TitleComponent, TooltipComponent, CanvasRenderer]);

interface AdminChartProps {
  className?: string;
  option: EChartsOption;
}

export default function AdminChart({ className, option }: AdminChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;
    const chart = echarts.init(chartRef.current);
    const resizeObserver = new ResizeObserver(() => chart.resize());

    chart.setOption(option);
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div ref={chartRef} className={className} />;
}
