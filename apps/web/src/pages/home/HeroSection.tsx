import { Button } from 'antd';
import { ReadOutlined, RocketOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteStore } from '../../store/site';
import { pick } from '../../utils/content';

function splitTitle(text: string): [string, string] {
  if (text.includes(' ')) {
    const words = text.split(' ');
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }
  const mid = Math.ceil(text.length * 0.6);
  return [text.slice(0, mid), text.slice(mid)];
}

export default function HeroSection() {
  const { t } = useTranslation();
  const hero = useSiteStore((s) => s.site?.config.hero);

  const title = pick(hero?.titleZh, hero?.titleEn) || t('footer.rights');
  const [line1, line2] = splitTitle(title);

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-left">
          <p className="hero-greeting">{hero?.greeting || 'Hi, 我是 yh'}</p>
          <h1 className="hero-title">
            <span className="hero-line1">{line1}</span>
            <span className="hero-line2 gradient-text">{line2}</span>
          </h1>
          <p className="hero-desc">{pick(hero?.descZh, hero?.descEn)}</p>
          <div className="hero-actions">
            <Link to="/projects">
              <Button type="primary" size="large" icon={<RocketOutlined />} className="btn-gradient">
                {t('hero.viewProjects')}
              </Button>
            </Link>
            <Link to="/articles">
              <Button size="large" icon={<ReadOutlined />}>
                {t('hero.readArticles')}
              </Button>
            </Link>
          </div>
        </div>
        <div className="hero-right">
          <img src="/images/hero-illustration.svg" alt="hero illustration" className="hero-img" />
        </div>
      </div>
    </section>
  );
}
