import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import { messengerApi } from './services/messengerApi';
import EmmuWidget from './EmmuWidget';
import EmmuChatModal from './EmmuChatModal';
import GenieAnimation from './GenieAnimation';
import OffscreenChatPanel from './OffscreenChatPanel';
import AnalyticsSuggestionComposer from './suggestions/AnalyticsSuggestionComposer';

/**
 * IqacEmmuAssistant
 * Renders the institutional messenger for all authenticated roles.
 * Controlled by user profile settings (toggle ON/OFF, mascot vs messenger symbol, transparent BG).
 */
export default function IqacEmmuAssistant() {
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();
  const academic = useAcademic();

  // Settings state from localStorage
  const [emmuEnabled, setEmmuEnabled] = useState(() => localStorage.getItem('nba_emmu_enabled') !== 'false');
  const [launcherStyle, setLauncherStyle] = useState(() => localStorage.getItem('nba_messenger_launcher_choice') || 'emmu');
  const [transparentBg, setTransparentBg] = useState(() => localStorage.getItem('nba_emmu_transparent_bg') === 'true');

  // Badge counts state across chats, suggestions, notifications
  const [badgeCounts, setBadgeCounts] = useState({
    unreadChats: 0,
    unreadSuggestions: 0,
    unreadNotifications: 0,
    totalUnread: 0,
  });

  // Chat state: 'closed' | 'opening' | 'open' | 'closing'
  const [chatState, setChatState] = useState('closed');
  const [emmuState, setEmmuState] = useState('normal');

  // Contextual Analytics Suggestion state
  const [activeAnalyticsContext, setActiveAnalyticsContext] = useState(null);
  const [isSuggestionComposerOpen, setIsSuggestionComposerOpen] = useState(false);

  const chatStateRef = useRef(chatState);
  chatStateRef.current = chatState;

  // Live DOM node references for Three.js Genie animation
  const widgetRef = useRef(null);
  const chatCardRef = useRef(null);

  // Listen to profile settings changes in real time
  useEffect(() => {
    const handleSettingsChange = () => {
      setEmmuEnabled(localStorage.getItem('nba_emmu_enabled') !== 'false');
      setLauncherStyle(localStorage.getItem('nba_messenger_launcher_choice') || 'emmu');
      setTransparentBg(localStorage.getItem('nba_emmu_transparent_bg') === 'true');
    };
    window.addEventListener('emmu-settings-changed', handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);
    return () => {
      window.removeEventListener('emmu-settings-changed', handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);

  // Listen to active analytics context broadcasts from analytics screens
  useEffect(() => {
    const handleContextEvent = (e) => {
      setActiveAnalyticsContext(e.detail || null);
    };
    window.addEventListener('nba-analytics-context', handleContextEvent);
    return () => window.removeEventListener('nba-analytics-context', handleContextEvent);
  }, []);

  // Clear analytics context when leaving analytics routes
  useEffect(() => {
    if (!location.pathname.includes('/analytics')) {
      setActiveAnalyticsContext(null);
      setIsSuggestionComposerOpen(false);
    }
  }, [location.pathname]);

  // Periodically sync unread badge counts
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    const fetchBadges = async () => {
      try {
        const data = await messengerApi.getBadgeCounts();
        if (isMounted && data) {
          setBadgeCounts(data);
        }
      } catch (err) {
        // silent fail on network / transient error
      }
    };
    fetchBadges();
    const timer = setInterval(fetchBadges, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isAuthenticated]);

  // Derive current academic UI context safely
  const academicContext = useMemo(() => {
    return {
      role: role || user?.role || 'USER',
      username: user?.username || null,
      pathname: location.pathname,
      schoolId: academic?.selectedSchoolId || user?.schoolId || null,
      schoolName: academic?.selectedSchool?.name || user?.schoolName || null,
      departmentId: academic?.selectedDepartmentId || null,
      departmentName: academic?.selectedDepartment?.name || null,
      programmeId: academic?.selectedProgramme?.id || null,
      programmeName: academic?.selectedProgramme?.name || null,
      batchId: academic?.selectedBatch?.id || null,
      batchName: academic?.selectedBatch?.name || null,
      courseId: academic?.selectedCourse?.id || null,
      courseName: academic?.selectedCourse?.name || null,
    };
  }, [academic, location.pathname, role, user]);

  // Derive rich analytics context with route fallback
  const effectiveAnalyticsContext = useMemo(() => {
    const isAnalyticsRoute = location.pathname.includes('/analytics');
    if (!isAnalyticsRoute) return null;

    const courseMatch = location.pathname.match(/(?:\/admin)?\/analytics\/batch\/([^/]+)\/course\/([^/]+)/);
    const batchMatch = location.pathname.match(/(?:\/admin)?\/analytics\/batch\/([^/]+)/);

    const routeLevel = courseMatch ? 'COURSE' : (batchMatch ? 'PROGRAMME_BATCH' : null);
    const routeBatchId = courseMatch ? courseMatch[1] : (batchMatch ? batchMatch[1] : null);
    const routeCourseId = courseMatch ? courseMatch[2] : null;

    if (!activeAnalyticsContext && !routeLevel) return null;

    return {
      role: role || user?.role || 'USER',
      username: user?.username || null,
      pathname: location.pathname,
      type: activeAnalyticsContext?.type || routeLevel || 'PROGRAMME_BATCH',
      schoolId: activeAnalyticsContext?.schoolId || academic?.selectedSchoolId || user?.schoolId || null,
      schoolName: activeAnalyticsContext?.schoolName || academic?.selectedSchool?.name || user?.schoolName || null,
      departmentId: activeAnalyticsContext?.departmentId || academic?.selectedDepartmentId || null,
      departmentName: activeAnalyticsContext?.departmentName || academic?.selectedDepartment?.name || null,
      masterProgrammeId: activeAnalyticsContext?.masterProgrammeId || activeAnalyticsContext?.programmeId || academic?.selectedProgramme?.id || null,
      programmeId: activeAnalyticsContext?.masterProgrammeId || activeAnalyticsContext?.programmeId || academic?.selectedProgramme?.id || null,
      programmeName: activeAnalyticsContext?.programmeName || academic?.selectedProgramme?.name || null,
      programmeBatchId: activeAnalyticsContext?.programmeBatchId || routeBatchId || academic?.selectedBatch?.id || null,
      batchId: activeAnalyticsContext?.programmeBatchId || routeBatchId || academic?.selectedBatch?.id || null,
      batchName: activeAnalyticsContext?.batchName || academic?.selectedBatch?.name || null,
      programmeBatchCourseId: activeAnalyticsContext?.programmeBatchCourseId || routeCourseId || academic?.selectedCourse?.id || null,
      courseId: activeAnalyticsContext?.programmeBatchCourseId || routeCourseId || academic?.selectedCourse?.id || null,
      courseName: activeAnalyticsContext?.courseName || academic?.selectedCourse?.name || null,
      courseCode: activeAnalyticsContext?.courseCode || null,
      coordinatorName: activeAnalyticsContext?.coordinatorName || null,
      coordinatorEmail: activeAnalyticsContext?.coordinatorEmail || null,
      coordinatorRole: activeAnalyticsContext?.coordinatorRole || (courseMatch ? 'COURSE_COORDINATOR' : 'PROGRAMME_COORDINATOR'),
    };
  }, [activeAnalyticsContext, location.pathname, role, user, academic]);

  // Determine if suggestion prompt should pop up
  const currentRole = (role || user?.role || '').toUpperCase();
  const canSendSuggestions = [
    'IQAC',
    'SUPER_ADMIN',
    'ADMIN',
    'TRUSTEE',
    'DIRECTOR',
    'SCHOOL_PROGRAMME_COORDINATOR',
    'HOD',
    'PROGRAMME_COORDINATOR'
  ].includes(currentRole);

  const showSuggestionPrompt = Boolean(
    canSendSuggestions &&
    effectiveAnalyticsContext &&
    (effectiveAnalyticsContext.programmeBatchId || effectiveAnalyticsContext.batchId)
  );

  const handleOpenChat = useCallback(() => {
    if (chatStateRef.current !== 'closed') return;
    setChatState('opening');
    setEmmuState('normal');
  }, []);

  const handleCloseChat = useCallback(() => {
    if (chatStateRef.current !== 'open') return;
    setChatState('closing');
    setEmmuState('normal');
  }, []);

  const handleGenieComplete = useCallback((completedState) => {
    if (completedState === 'opening') {
      setChatState('open');
    } else if (completedState === 'closing') {
      setChatState('closed');
    }
  }, []);

  // Visible to all authenticated roles unless toggled off
  if (!isAuthenticated || !emmuEnabled) {
    return null;
  }

  return (
    <>
      {/* DRAGGABLE EMMU MASCOT WIDGET (SOURCE FOR GENIE) */}
      <EmmuWidget
        ref={widgetRef}
        emmuState={emmuState}
        onOpenChat={handleOpenChat}
        notificationCount={badgeCounts?.totalUnread || 0}
        speechMessage="Institutional Messenger"
        showNotification={(badgeCounts?.totalUnread || 0) > 0}
        isChatOpen={chatState === 'open' || chatState === 'opening'}
        launcherStyle={launcherStyle}
        transparentBg={transparentBg}
        showSuggestionPrompt={showSuggestionPrompt}
        suggestionPromptContext={effectiveAnalyticsContext}
        onOpenSuggestionsComposer={() => setIsSuggestionComposerOpen(true)}
      />

      {/* CENTERED EMMU CHAT MODAL (DESTINATION FOR GENIE) */}
      <EmmuChatModal
        chatState={chatState}
        cardRef={chatCardRef}
        onClose={handleCloseChat}
        academicContext={effectiveAnalyticsContext || academicContext}
        setEmmuState={setEmmuState}
        onBadgeCountsChange={setBadgeCounts}
        initialBadges={badgeCounts}
      />

      {/* DIRECT CONTEXTUAL ANALYTICS SUGGESTION COMPOSER */}
      <AnalyticsSuggestionComposer
        isOpen={isSuggestionComposerOpen}
        onClose={() => setIsSuggestionComposerOpen(false)}
        academicContext={effectiveAnalyticsContext || academicContext}
        onSuggestionSent={() => {
          messengerApi.getBadgeCounts(true).then((b) => setBadgeCounts(b)).catch(() => {});
        }}
      />

      {/* THREE.JS WEBGL 3D GENIE ANIMATION LAYER */}
      <GenieAnimation
        sourceRef={widgetRef}
        destinationRef={chatCardRef}
        chatState={chatState}
        onAnimationComplete={handleGenieComplete}
      />

      {/* OFFSCREEN TEXTURE PRE-WARMING */}
      <OffscreenChatPanel />
    </>
  );
}
