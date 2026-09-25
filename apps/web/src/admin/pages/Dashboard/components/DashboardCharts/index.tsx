// 组件用途：展示后台内容分布图表。（趋势图曾为硬编码假数据，在无按日统计模型前先移除。）
import { useMemo } from 'react';
import { Card } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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
}

export default function DashboardCharts({ distribution, contentTotal }: DashboardChartsProps) {
  const { t } = useTranslation();
  const distributionOption = useMemo<EChartsOption>(
    () => ({
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
    }),
    [contentTotal, distribution, t],
  );

  return (
    <>
      <Card className="admin-panel admin-distribution-panel">
        <div className="admin-panel-title">
          <span>
            <ReadOutlined />
          </span>
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
