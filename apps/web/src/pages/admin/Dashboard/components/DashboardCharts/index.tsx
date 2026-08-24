// 组件用途：展示后台运营趋势和内容分布图表。
import { useMemo } from 'react';
import { Card } from 'antd';
import { ReadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import * as echarts from 'echarts/core';
import type { EChartsOption } from 'echarts';
import AdminChart from '../AdminChart';

export interface DistributionItem {
  label: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  distribution: DistributionItem[];
  contentTotal: number;
  totalViews: number;
  totalArticles: number;
}

export default function DashboardCharts({ distribution, contentTotal, totalViews, totalArticles }: DashboardChartsProps) {
  const { t } = useTranslation();
  const trendValues = [8, 10, 12, 9, 14, 18, Math.max(24, totalViews + totalArticles)];
  const trendLabels = ['05-23', '05-24', '05-25', '05-26', '05-27', '05-28', '05-29'];
  const trendOption = useMemo<EChartsOption>(() => ({
    grid: { left: 8, right: 8, top: 24, bottom: 28, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#dbe3ef',
      textStyle: { color: '#0f172a' },
    },
    xAxis: {
      type: 'category',
      data: trendLabels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#dbe3ef' } },
      axisLabel: { color: '#64748b', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#edf2f7' } },
    },
    series: [
      {
        type: 'bar',
        data: trendValues,
        barWidth: 28,
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2563eb' },
            { offset: 1, color: 'rgba(37, 99, 235, 0.18)' },
          ]),
        },
      },
    ],
  }), [trendValues]);
  const distributionOption = useMemo<EChartsOption>(() => ({
    color: distribution.map((item) => item.color),
    title: {
      text: String(contentTotal),
      subtext: t('admin.contentItems'),
      left: 'center',
      top: '41%',
      textStyle: { color: '#0f172a', fontSize: 28, fontWeight: 800 },
      subtextStyle: { color: '#64748b', fontSize: 13, fontWeight: 700 },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#dbe3ef',
      textStyle: { color: '#0f172a' },
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: distribution.map((item) => ({ name: item.label, value: item.value })),
      },
    ],
  }), [contentTotal, distribution, t]);

  return (
    <>
      <Card className="admin-panel admin-trend-panel">
        <div className="admin-panel-title">
          <span><ThunderboltOutlined /></span>
          <h2>{t('admin.activityTrend')}</h2>
        </div>
        <AdminChart className="admin-echart admin-trend-chart" option={trendOption} />
      </Card>

      <Card className="admin-panel admin-distribution-panel">
        <div className="admin-panel-title">
          <span><ReadOutlined /></span>
          <h2>{t('admin.contentDistribution')}</h2>
        </div>
        <AdminChart className="admin-echart admin-donut-chart" option={distributionOption} />
        <div className="admin-donut-legend">
          {distribution.map((item) => {
            const percent = contentTotal ? Math.round((item.value / contentTotal) * 100) : 0;
            return (
              <div key={item.label}>
                <span style={{ background: item.color }} />
                <p>{item.label}</p>
                <strong>{percent}%</strong>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
