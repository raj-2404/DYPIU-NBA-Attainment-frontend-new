import React, { useState } from 'react';
import { Lightbulb, Send, X, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { messengerApi } from '../services/messengerApi';

export default function AnalyticsSuggestionComposer({
  isOpen,
  onClose,
  academicContext = {},
  onSuggestionSent,
}) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ATTAINMENT_GAP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isCourseContext = Boolean(academicContext?.programmeBatchCourseId || academicContext?.courseId || academicContext?.courseName);
  const targetRoleTitle = isCourseContext
    ? 'Course Coordinator'
    : 'Programme Coordinator';
  const recipientName = academicContext?.coordinatorName || null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await messengerApi.createSuggestion({
        schoolId: academicContext?.schoolId || null,
        departmentId: academicContext?.departmentId || null,
        masterProgrammeId: academicContext?.programmeId || academicContext?.masterProgrammeId || null,
        programmeBatchId: academicContext?.batchId || academicContext?.programmeBatchId || null,
        programmeBatchCourseId: academicContext?.courseId || academicContext?.programmeBatchCourseId || null,
        contextType: isCourseContext ? 'COURSE' : 'PROGRAMME_BATCH',
        category,
        content: content.trim(),
      });

      const confirmRecipient = recipientName ? `${recipientName} (${targetRoleTitle})` : targetRoleTitle;
      setSuccessMsg(`Suggestion successfully delivered to ${confirmRecipient}!`);
      setContent('');
      onSuggestionSent?.();
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit suggestion:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 100020,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--surface-modal, #ffffff)',
          borderRadius: 16,
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.28)',
          border: '1px solid var(--border-glass, rgba(226, 232, 240, 0.8))',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.18)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Lightbulb size={18} color="#fef08a" />
            </div>
            <div>
              <div style={{ lineHeight: 1.2 }}>Academic Suggestion</div>
              <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 500, marginTop: 2 }}>
                Targeted Continuous Quality Improvement
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTEXT SUMMARY CARD */}
        <div
          style={{
            padding: '14px 20px',
            background: 'var(--surface-header, #f8fafc)',
            borderBottom: '1px solid var(--border-glass, #e2e8f0)',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: 'var(--text-secondary, #64748b)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            Active Analytics Context
          </div>

          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary, #1e293b)' }}>
            {academicContext?.programmeName || 'Academic Programme'}{' '}
            {academicContext?.batchName ? `• ${academicContext.batchName}` : ''}
          </div>

          {academicContext?.courseName && (
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-secondary, #475569)',
                marginTop: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>📖 Course:</span>
              <span style={{ color: '#4f46e5' }}>
                {academicContext?.courseCode ? `[${academicContext.courseCode}] ` : ''}
                {academicContext.courseName}
              </span>
            </div>
          )}

          {/* RECIPIENT HIGHLIGHT CARD */}
          <div
            style={{
              marginTop: 10,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(79, 70, 229, 0.08)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#4f46e5',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={14} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#4f46e5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {recipientName || `Assigned ${targetRoleTitle}`}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>
                  Recipient • {targetRoleTitle}
                  {academicContext?.coordinatorEmail ? ` (${academicContext.coordinatorEmail})` : ''}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: '#4f46e5',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              Direct
            </span>
          </div>
        </div>

        {/* COMPOSER FORM */}
        <form onSubmit={handleSend} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 10,
                color: '#ef4444',
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 10,
                color: '#10b981',
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} flexShrink={0} />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-primary, #334155)',
                marginBottom: 6,
              }}
            >
              Suggestion Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--input-border, #cbd5e1)',
                fontSize: 13,
                color: 'var(--text-primary, #1e293b)',
                background: 'var(--input-bg, #ffffff)',
                outline: 'none',
              }}
            >
              <option value="ATTAINMENT_GAP">Attainment Gap Observation</option>
              <option value="CURRICULUM_ACTION">Curriculum Action Recommendation</option>
              <option value="CONTINUOUS_IMPROVEMENT">Continuous Improvement Initiative</option>
              <option value="GENERAL">General Academic Suggestion</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-primary, #334155)',
                marginBottom: 6,
              }}
            >
              Suggestion Details
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide constructive recommendations on improving attainment, closing course gaps, or curriculum actions..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--input-border, #cbd5e1)',
                fontSize: 13,
                color: 'var(--text-primary, #1e293b)',
                background: 'var(--input-bg, #ffffff)',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--input-border, #cbd5e1)',
                background: 'transparent',
                color: 'var(--text-secondary, #475569)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: content.trim() && !isSubmitting ? '#4f46e5' : '#a5b4fc',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: content.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: content.trim() && !isSubmitting ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
              }}
            >
              <span>{isSubmitting ? 'Submitting...' : 'Send Suggestion'}</span>
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
