// 组件用途：首页浮动 AI 助手，提供博客介绍和基础问答。
import { useEffect, useRef, useState } from 'react';
import { Button, Input, Tooltip } from 'antd';
import type { InputRef } from 'antd';
import {
  ClearOutlined,
  CloseOutlined,
  LoadingOutlined,
  RobotOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { aiApi, type AiChatMessage } from '@/services/ai';
import './styles/index.module.less';

interface DisplayMessage extends AiChatMessage {
  id: string;
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AiChat() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<DisplayMessage[]>(() => [
    { id: 'welcome', role: 'assistant', content: t('ai.welcome') },
  ]);
  const inputRef = useRef<InputRef>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const suggestions = t('ai.suggestions', { returnObjects: true }) as string[];

  useEffect(() => {
    setMessages((current) =>
      current.length === 1 && current[0].id === 'welcome'
        ? [{ ...current[0], content: t('ai.welcome') }]
        : current,
    );
  }, [i18n.language, t]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const sendQuestion = async (value = input) => {
    const message = value.trim();
    if (!message || loading) return;

    const history = messages
      .filter((item) => item.id !== 'welcome')
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));
    setInput('');
    setError('');
    setMessages((current) => [...current, { id: createMessageId(), role: 'user', content: message }]);
    setLoading(true);

    try {
      const response = await aiApi.chat({
        message,
        history,
        locale: i18n.language.startsWith('en') ? 'en' : 'zh',
      });
      setMessages((current) => [...current, { id: createMessageId(), role: 'assistant', content: response.reply }]);
    } catch {
      setError(t('ai.error'));
      setInput(message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: t('ai.welcome') }]);
    setInput('');
    setError('');
  };

  return (
    <>
      {open && (
        <section className="ai-chat-panel" role="dialog" aria-modal="false" aria-label={t('ai.title')}>
          <header className="ai-chat-header">
            <div className="ai-chat-title">
              <span className="ai-chat-icon"><RobotOutlined /></span>
              <div>
                <strong>{t('ai.title')}</strong>
                <span>{t('ai.badge')}</span>
              </div>
            </div>
            <div className="ai-chat-header-actions">
              <Tooltip title={t('ai.clear')}>
                <Button type="text" shape="circle" icon={<ClearOutlined />} aria-label={t('ai.clear')} onClick={clearMessages} />
              </Tooltip>
              <Tooltip title={t('common.close')}>
                <Button type="text" shape="circle" icon={<CloseOutlined />} aria-label={t('common.close')} onClick={() => setOpen(false)} />
              </Tooltip>
            </div>
          </header>

          <div className="ai-chat-body">
            <div className="ai-chat-messages" role="list">
              {messages.map((item) => (
                <div key={item.id} className={`ai-chat-message ${item.role}`} role="listitem">
                  <div className="ai-chat-message-content">{item.content}</div>
                </div>
              ))}
              {loading && (
                <div className="ai-chat-message assistant" role="status">
                  <div className="ai-chat-message-content ai-chat-loading"><LoadingOutlined spin /> {t('ai.thinking')}</div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {!messages.some((item) => item.role === 'user') && (
              <div className="ai-chat-suggestions">
                {suggestions.map((question) => (
                  <Button key={question} type="default" block onClick={() => { void sendQuestion(question); }}>
                    {question}
                  </Button>
                ))}
              </div>
            )}

            {error && <div className="ai-chat-error" role="alert">{error}</div>}
          </div>

          <div className="ai-chat-composer">
            <Input.TextArea
              ref={inputRef}
              value={input}
              maxLength={500}
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder={t('ai.placeholder')}
              disabled={loading}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendQuestion();
                }
              }}
            />
            <Button
              type="primary"
              className="btn-gradient ai-chat-send"
              icon={<SendOutlined />}
              disabled={!input.trim() || loading}
              onClick={() => { void sendQuestion(); }}
            >
              {t('ai.send')}
            </Button>
          </div>
        </section>
      )}

      {!open && (
        <Tooltip title={t('ai.open')}>
          <Button
            type="primary"
            shape="circle"
            className="ai-chat-launcher btn-gradient"
            icon={<RobotOutlined />}
            aria-label={t('ai.open')}
            onClick={() => setOpen(true)}
          />
        </Tooltip>
      )}
    </>
  );
}
