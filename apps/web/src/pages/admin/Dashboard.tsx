import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import {
  EyeOutlined,
  FileTextOutlined,
  MessageOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { StatsDTO } from '@my-blog/shared';
import { api } from '../../services/api';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsDTO | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={8} lg={4}>
        <Card>
          <Statistic title={t('admin.totalViews')} value={stats?.totalViews ?? 0} prefix={<EyeOutlined />} />
        </Card>
      </Col>
      <Col xs={12} md={8} lg={4}>
        <Card>
          <Statistic title={t('admin.articleCount')} value={stats?.articleCount ?? 0} prefix={<FileTextOutlined />} />
        </Card>
      </Col>
      <Col xs={12} md={8} lg={4}>
        <Card>
          <Statistic title={t('admin.publishedCount')} value={stats?.publishedCount ?? 0} prefix={<CheckCircleOutlined />} />
        </Card>
      </Col>
      <Col xs={12} md={8} lg={4}>
        <Card>
          <Statistic title={t('admin.projectCount')} value={stats?.projectCount ?? 0} prefix={<ProjectOutlined />} />
        </Card>
      </Col>
      <Col xs={12} md={8} lg={4}>
        <Card>
          <Statistic title={t('admin.messageCount')} value={stats?.messageCount ?? 0} prefix={<MessageOutlined />} />
        </Card>
      </Col>
    </Row>
  );
}
