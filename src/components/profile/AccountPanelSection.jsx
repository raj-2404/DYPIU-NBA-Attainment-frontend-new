import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Smartphone,
  SlidersHorizontal,
  Sparkles,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import { usersApi } from '../../api/users';

export const tabs = [
  { id: 'profile', label: 'Info', icon: UserRound },
  { id: 'customizations', label: 'Customizations', icon: Palette },
  { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
];

const cardStyle = {
  background: 'var(--surface-secondary)',
  border: '1px solid var(--border-glass)',
  borderRadius: 14,
  padding: '14px 16px',
  boxShadow: 'var(--shadow-glass)',
};

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      style={{
        width: 40,
        height: 22,
        padding: 2,
        border: 0,
        borderRadius: 99,
        cursor: 'pointer',
        background: checked ? '#4f46e5' : '#cbd5e1',
        transition: 'background .18s',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transform: `translateX(${checked ? 18 : 0}px)`,
          transition: 'transform .18s',
          boxShadow: '0 1px 3px rgba(15,23,42,.2)',
        }}
      />
    </button>
  );
}

function Detail({ label, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 5, color: 'var(--text-primary)', fontSize: 13, fontWeight: 750, overflowWrap: 'anywhere' }}>
        {value || 'Not available'}
      </div>
    </div>
  );
}

function AccountPanelSection({
  accountPanelRef,
  tab,
  setTab,
  preferences,
  setPreferences,
  onTogglePreference,
  onClose,
  user,
  roleLabel,
  courseCount = 0,
  batchName,
  enableProfileSwitching = false,
  className = '',
  style = {},
}) {
  const { role, availableProfiles = [], isLoadingProfiles, loadAvailableProfiles, switchProfile } = useAuth();
  const { theme, setTheme, isDark, reducedMotion, toggleReducedMotion } = useTheme();
  const [profileSwitchError, setProfileSwitchError] = useState('');
  const [switchingProfileKey, setSwitchingProfileKey] = useState(null);
  const [switchingSchoolId, setSwitchingSchoolId] = useState(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Manage Account / Sessions State
  const [sessionData, setSessionData] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [sessionSuccess, setSessionSuccess] = useState('');
  const [isLoggingOutOthers, setIsLoggingOutOthers] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionError('');
    try {
      const res = await apiClient.get('/users/me/sessions');
      setSessionData(res.data?.data || res.data);
    } catch (err) {
      console.warn('Failed to load sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'settings') {
      loadSessions();
    }
  }, [tab, loadSessions]);

  const handlePasswordChange = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters in length.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await apiClient.put('/users/me/password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(res.data?.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to change password. Please check your current password.'
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogoutOtherSessions = async () => {
    setIsLoggingOutOthers(true);
    setSessionError('');
    setSessionSuccess('');
    try {
      const res = await apiClient.post('/users/me/sessions/logout-other');
      setSessionSuccess(res.data?.message || 'All other active sessions have been signed out.');
      setShowLogoutConfirm(false);
      loadSessions();
    } catch (err) {
      setSessionError(err?.response?.data?.message || err?.message || 'Failed to sign out other sessions.');
    } finally {
      setIsLoggingOutOthers(false);
    }
  };

  // Emmu Messenger Settings State
  const [emmuEnabled, setEmmuEnabled] = useState(() => localStorage.getItem('nba_emmu_enabled') !== 'false');
  const [launcherChoice, setLauncherChoice] = useState(() => localStorage.getItem('nba_messenger_launcher_choice') || 'emmu');
  const [transparentBg, setTransparentBg] = useState(() => localStorage.getItem('nba_emmu_transparent_bg') === 'true');

  const handleToggleEmmu = () => {
    const next = !emmuEnabled;
    setEmmuEnabled(next);
    localStorage.setItem('nba_emmu_enabled', String(next));
    window.dispatchEvent(new Event('emmu-settings-changed'));
  };

  const handleLauncherChoice = (choice) => {
    setLauncherChoice(choice);
    localStorage.setItem('nba_messenger_launcher_choice', choice);
    window.dispatchEvent(new Event('emmu-settings-changed'));
  };

  const handleToggleTransparentBg = () => {
    const next = !transparentBg;
    setTransparentBg(next);
    localStorage.setItem('nba_emmu_transparent_bg', String(next));
    window.dispatchEvent(new Event('emmu-settings-changed'));
  };

  const toggle = onTogglePreference || ((key) => setPreferences?.((prev) => ({ ...prev, [key]: !prev[key] })));
  const userName = user?.name || user?.username || 'Academic User';
  const initials = userName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const department = user?.department?.name || user?.departmentName || 'Not assigned';
  const school = user?.school?.name || user?.schoolName || 'Not assigned';
  const about = `${roleLabel || 'Academic user'} in the Outcome-Based Education Attainment System, responsible for assigned academic workflow and attainment activities.`;
  const profileRoleName = (profileRole) => String(profileRole || 'Profile')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  useEffect(() => {
    if (enableProfileSwitching) void loadAvailableProfiles();
  }, [enableProfileSwitching, loadAvailableProfiles]);

  const schoolList = useMemo(() => {
    const map = new Map();
    if (Array.isArray(user?.schools)) {
      user.schools.forEach((s) => {
        if (s?.id) {
          const id = String(s.id);
          map.set(id, {
            id,
            name: s.name || s.schoolName || s.code || `School ${id}`,
            code: s.code || '',
          });
        }
      });
    }
    if (Array.isArray(user?.assignments)) {
      user.assignments.forEach((a) => {
        if (a?.schoolId) {
          const id = String(a.schoolId);
          if (!map.has(id)) {
            map.set(id, {
              id,
              name: a.schoolName || `School ${id}`,
              code: '',
            });
          }
        }
      });
    }
    if (Array.isArray(availableProfiles)) {
      availableProfiles.forEach((p) => {
        if (p?.schoolId) {
          const id = String(p.schoolId);
          if (!map.has(id)) {
            map.set(id, {
              id,
              name: p.schoolName || id,
              code: '',
            });
          } else if (p.schoolName && map.get(id).name.startsWith('School ')) {
            map.get(id).name = p.schoolName;
          }
        }
      });
    }
    if (user?.schoolId && !map.has(String(user.schoolId))) {
      const id = String(user.schoolId);
      map.set(id, {
        id,
        name: user.schoolName || (typeof user.school === 'object' ? user.school?.name : null) || `School ${id}`,
        code: (typeof user.school === 'object' ? user.school?.code : '') || '',
      });
    }
    return Array.from(map.values());
  }, [user?.schools, user?.assignments, user?.schoolId, user?.schoolName, user?.school, availableProfiles]);

  // Chosen school resolution: if user has multiple schools assigned, show the chosen one
  const chosenSchoolName = useMemo(() => {
    if (user?.schoolId) {
      const match = schoolList.find((s) => String(s.id) === String(user.schoolId));
      if (match && match.name) return match.name;
    }
    if (user?.schoolName) return user.schoolName;
    if (typeof user?.school === 'object' && user.school?.name) return user.school.name;
    if (schoolList.length === 1) return schoolList[0].name;
    return 'Not assigned';
  }, [user?.schoolId, user?.schoolName, user?.school, schoolList]);

  // Profile self-edit state (Full name & Employee ID)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || user?.username || '');
  const [profileEmployeeId, setProfileEmployeeId] = useState(user?.employeeId || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    setProfileName(user?.name || user?.username || '');
    setProfileEmployeeId(user?.employeeId || '');
  }, [user?.name, user?.username, user?.employeeId]);

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!profileName.trim()) {
      setProfileMsg({ text: 'Full name cannot be empty', type: 'error' });
      return;
    }
    setSavingProfile(true);
    setProfileMsg({ text: '', type: '' });
    try {
      await usersApi.updateMe({
        name: profileName.trim(),
        employeeId: profileEmployeeId.trim() || null,
      });
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditingProfile(false);
      if (user) {
        user.name = profileName.trim();
        user.employeeId = profileEmployeeId.trim() || null;
      }
      setTimeout(() => setProfileMsg({ text: '', type: '' }), 3500);
    } catch (err) {
      setProfileMsg({
        text: err?.response?.data?.message || err?.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const rolesForCurrentSchool = useMemo(() => {
    if (!Array.isArray(availableProfiles) || availableProfiles.length === 0) return [];
    const currentSchoolId = user?.schoolId ? String(user.schoolId) : null;

    const filtered = availableProfiles.filter((p) => {
      if (p.role === 'IQAC') return true;
      if (currentSchoolId && p.schoolId) {
        return String(p.schoolId) === currentSchoolId;
      }
      if (!p.schoolId) return true;
      if (!currentSchoolId) return true;
      return false;
    });

    return filtered.length > 0 ? filtered : availableProfiles;
  }, [availableProfiles, user?.schoolId]);

  const isProfileCurrent = (profile) => {
    if (Boolean(profile.isCurrent)) return true;
    const roleMatches = profile.role === role;
    if (!roleMatches) return false;
    if (profile.schoolId) {
      return String(profile.schoolId) === String(user?.schoolId);
    }
    if (profile.departmentId && user?.departmentId) {
      return String(profile.departmentId) === String(user.departmentId);
    }
    return true;
  };

  const executeSwitch = async (profile, profileKey) => {
    setProfileSwitchError('');
    setSwitchingProfileKey(profileKey);
    const result = await switchProfile(profile);
    if (!result.success) {
      setProfileSwitchError(result.error || 'Unable to switch profile.');
      setSwitchingProfileKey(null);
      setSwitchingSchoolId(null);
      return;
    }

    const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    window.location.assign(`${basePath}${result.targetPath}`);
  };

  const handleSwitchProfile = async (profile, profileKey) => {
    if (isProfileCurrent(profile)) return;
    await executeSwitch(profile, profileKey);
  };

  const handleSwitchSchool = async (targetSchoolId) => {
    const currentSchoolId = user?.schoolId ? String(user.schoolId) : null;
    if (currentSchoolId && String(targetSchoolId) === currentSchoolId) return;

    setProfileSwitchError('');
    setSwitchingSchoolId(targetSchoolId);

    let targetProfile = availableProfiles.find(
      (p) => String(p.schoolId) === String(targetSchoolId) && p.role === role
    );

    if (!targetProfile) {
      targetProfile = availableProfiles.find(
        (p) => String(p.schoolId) === String(targetSchoolId)
      );
    }

    if (!targetProfile) {
      targetProfile = {
        role: role || 'DIRECTOR',
        schoolId: targetSchoolId,
      };
    }

    const profileKey = `school-${targetSchoolId}-${targetProfile.role}`;
    await executeSwitch(targetProfile, profileKey);
  };

  const notificationItems = useMemo(
    () => [
      { title: 'Workflow updates', key: 'workflow', description: 'Submissions, revisions and workflow steps' },
      { title: 'Course updates', key: 'course', description: 'Course assignments, outcomes and mappings' },
      { title: 'ATR alerts', key: 'atr', description: 'Attainment gaps and corrective actions' },
      { title: 'Approval updates', key: 'approval', description: 'Approval decisions and requests' },
      { title: 'Email notifications', key: 'email', description: 'Send selected updates to your email' },
      { title: 'In-app notifications', key: 'inApp', description: 'Show updates in the application' },
    ],
    []
  );

  return (
    <section
      className={className}
      ref={accountPanelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Account profile"
      onMouseDown={(event) => event.stopPropagation()}
      style={{
        width: 'min(85%, 867px)',
        height: 'min(646px, calc(100vh - 40px))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--surface-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-webkit-blur)',
        border: '1px solid var(--border-glass)',
        borderRadius: 22,
        boxShadow: 'var(--shadow-glass)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <header
        style={{
          minHeight: 68,
          padding: '14px 20px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h2 style={{ margin: 2, color: 'var(--text-primary)', fontSize: 19 }}>Account</h2>
          <p style={{ margin: '4px 0 13px', color: 'var(--text-muted)', fontSize: 12.5 }}>
            Your account, security, customizations and preferences
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close account panel"
          style={{
            width: 34,
            height: 34,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--border-glass)',
            borderRadius: '50%',
            color: 'var(--text-muted)',
            background: 'var(--surface-primary)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px 22px' }}>
        <nav
          aria-label="Account sections"
          style={{
            display: 'flex',
            gap: 5,
            overflowX: 'auto',
            paddingBottom: 14,
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {tabs.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab?.(id)}
              style={{
                flex: '0 0 auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 36,
                padding: '0 12px',
                border: 0,
                borderRadius: 8,
                background: tab === id ? 'var(--accent-subtle)' : 'transparent',
                color: tab === id ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: 12.5,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <TabIcon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* TAB 1: Profile */}
        {tab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: '228px minmax(0, 1fr)', gap: 22, paddingTop: 20 }}>
            <aside style={{ textAlign: 'center', borderRight: '1px solid #e7edf5', padding: '10px 18px 10px 2px' }}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  margin: '0 auto 12px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  color: '#fff',
                  fontSize: 29,
                  fontWeight: 850,
                  background: 'linear-gradient(135deg,#818cf8,#4338ca)',
                  boxShadow: '0 8px 22px rgba(79,70,229,.24)',
                }}
              >
                {initials}
              </div>
              <div style={{ color: '#172033', fontSize: 16, fontWeight: 850 }}>{userName}</div>
              <div style={{ marginTop: 4, color: '#64748b', fontSize: 12 }}>{roleLabel || 'Academic User'}</div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 13,
                  padding: '5px 9px',
                  borderRadius: 99,
                  color: '#047857',
                  background: '#ecfdf5',
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                <Check size={12} />
                Active
              </span>

              {enableProfileSwitching && (schoolList.length > 1 || rolesForCurrentSchool.length > 1) && (
                <div style={{ marginTop: 18, paddingTop: 15, borderTop: '1px solid #e7edf5', textAlign: 'left' }}>
                  {/* TIER 1: SCHOOL SWITCHER (if >1 school assigned) */}
                  {schoolList.length > 1 && (
                    <div style={{ marginBottom: rolesForCurrentSchool.length > 1 ? 16 : 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#475569',
                          fontSize: 10,
                          fontWeight: 850,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        <Building2 size={13} style={{ color: '#4f46e5' }} />
                        <span>Switch School</span>
                      </div>
                      <div style={{ display: 'grid', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 2 }}>
                        {schoolList.map((s) => {
                          const isCurrent = user?.schoolId && String(s.id) === String(user.schoolId);
                          const isSwitching = switchingSchoolId === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSwitchSchool(s.id)}
                              disabled={isCurrent || isLoadingProfiles || Boolean(switchingProfileKey)}
                              title={s.name}
                              style={{
                                width: '100%',
                                minHeight: 32,
                                padding: '6px 8px',
                                borderRadius: 8,
                                border: isCurrent ? '1.5px solid #818cf8' : '1px solid #e2e8f0',
                                background: isCurrent ? '#eef2ff' : '#fff',
                                color: isCurrent ? '#3730a3' : '#334155',
                                textAlign: 'left',
                                cursor: isCurrent || isLoadingProfiles || Boolean(switchingProfileKey) ? 'default' : 'pointer',
                                fontSize: 11,
                                fontWeight: isCurrent ? 800 : 600,
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 6,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {isSwitching ? 'Switching…' : s.name}
                              </span>
                              {isCurrent && <Check size={12} style={{ color: '#4f46e5', flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TIER 2: ROLE SWITCHER (filtered to current school, if >1 role available) */}
                  {rolesForCurrentSchool.length > 1 && (
                    <div style={{ marginTop: schoolList.length > 1 ? 14 : 0, paddingTop: schoolList.length > 1 ? 14 : 0, borderTop: schoolList.length > 1 ? '1px dashed #e2e8f0' : 'none' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#475569',
                          fontSize: 10,
                          fontWeight: 850,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}
                      >
                        <ShieldCheck size={13} style={{ color: '#4f46e5' }} />
                        <span>Switch Role</span>
                      </div>
                      <div style={{ display: 'grid', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 2 }}>
                        {rolesForCurrentSchool.map((profile, index) => {
                          const profileKey = `${profile.role}-${profile.schoolId ?? ''}-${profile.departmentId ?? profile.programmeBatchId ?? index}`;
                          const isCurrent = isProfileCurrent(profile);
                          const isSwitching = switchingProfileKey === profileKey;
                          return (
                            <button
                              key={profileKey}
                              type="button"
                              onClick={() => handleSwitchProfile(profile, profileKey)}
                              disabled={isCurrent || isLoadingProfiles || Boolean(switchingProfileKey)}
                              title={profile.displayName || profileRoleName(profile.role)}
                              style={{
                                width: '100%',
                                minHeight: 32,
                                padding: '6px 8px',
                                borderRadius: 8,
                                border: isCurrent ? '1.5px solid #818cf8' : '1px solid #e2e8f0',
                                background: isCurrent ? '#eef2ff' : '#fff',
                                color: isCurrent ? '#3730a3' : '#334155',
                                textAlign: 'left',
                                cursor: isCurrent || isLoadingProfiles || Boolean(switchingProfileKey) ? 'default' : 'pointer',
                                fontSize: 11,
                                fontWeight: isCurrent ? 800 : 600,
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 6,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                <div>{isSwitching ? 'Switching…' : profileRoleName(profile.role)}</div>
                                {profile.departmentName && (
                                  <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {profile.departmentName}
                                  </div>
                                )}
                              </div>
                              {isCurrent && <Check size={12} style={{ color: '#4f46e5', flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {profileSwitchError && <div style={{ marginTop: 8, color: '#b91c1c', fontSize: 10.5, fontWeight: 700 }}>{profileSwitchError}</div>}
                </div>
              )}
            </aside>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: '#172033' }}>Personal information</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile((prev) => !prev);
                    setProfileMsg({ text: '', type: '' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isEditingProfile ? '#f1f5f9' : '#eef2ff',
                    color: isEditingProfile ? '#475569' : '#4f46e5',
                    border: '1px solid ' + (isEditingProfile ? '#cbd5e1' : '#c7d2fe'),
                    transition: 'all .15s',
                  }}
                >
                  <Edit3 size={13} />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit profile'}</span>
                </button>
              </div>

              {profileMsg.text && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    background: profileMsg.type === 'error' ? '#fef2f2' : '#ecfdf5',
                    color: profileMsg.type === 'error' ? '#b91c1c' : '#047857',
                    border: '1px solid ' + (profileMsg.type === 'error' ? '#fecaca' : '#a7f3d0'),
                  }}
                >
                  {profileMsg.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                    <div style={cardStyle}>
                      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Enter full name"
                        required
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          background: 'var(--surface-input)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={cardStyle}>
                      <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={profileEmployeeId}
                        onChange={(e) => setProfileEmployeeId(e.target.value)}
                        placeholder="e.g. EMP1024"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          background: 'var(--surface-input)',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <Detail label="Role (Managed by Admin)" value={roleLabel} />
                    <Detail label="Email address (Managed by Admin)" value={user?.email} />
                    <Detail label="Department" value={department} />

                    <div style={cardStyle}>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>School</span>
                        {schoolList.length > 1 && (
                          <span style={{ fontSize: 9.5, background: 'var(--brand-subtle)', color: 'var(--brand-primary)', padding: '1px 6px', borderRadius: 99, fontWeight: 800 }}>
                            Active School
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: 5, color: 'var(--text-primary)', fontSize: 13, fontWeight: 750, overflowWrap: 'anywhere' }}>
                        {chosenSchoolName}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      style={{
                        padding: '7px 14px',
                        background: 'var(--surface-tertiary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      style={{
                        padding: '7px 16px',
                        background: '#4f46e5',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 750,
                        color: '#fff',
                        cursor: savingProfile ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 6px rgba(79, 70, 229, 0.28)',
                      }}
                    >
                      <Save size={14} />
                      <span>{savingProfile ? 'Saving…' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                  <Detail label="Full name" value={user?.name || userName} />
                  <Detail label="Role" value={roleLabel} />
                  <Detail label="Email address" value={user?.email} />
                  <Detail label="Department" value={department} />

                  <div style={cardStyle}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>School</span>
                      {schoolList.length > 1 && (
                        <span style={{ fontSize: 9.5, background: 'var(--brand-subtle)', color: 'var(--brand-primary)', padding: '1px 6px', borderRadius: 99, fontWeight: 800 }}>
                          Active School
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 5, color: 'var(--text-primary)', fontSize: 13, fontWeight: 750, overflowWrap: 'anywhere' }}>
                      {chosenSchoolName}
                    </div>
                  </div>

                  <Detail label="Employee ID" value={user?.employeeId || user?.id || 'Not set'} />
                </div>
              )}
              <h3 style={{ margin: '22px 0 9px', fontSize: 15, color: 'var(--text-primary)' }}>About</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.65, fontSize: 13 }}>{about}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 20 }}>
                <Detail label="Courses assigned" value={String(courseCount)} />
                <Detail label="Current batch" value={batchName || 'Not selected'} />
                <Detail label="Account status" value="Active" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Customizations */}
        {tab === 'customizations' && (
          <div style={{ paddingTop: 20, display: 'grid', gap: 14 }}>
            {/* THEME SWITCHER - iOS Style Light / Dark mode Cards */}
            <div style={{ ...cardStyle, display: 'grid', gap: 12 }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: 13.5 }}>Interface Theme</strong>
                <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11.5 }}>
                  Choose your visual preference. Light and Dark themes apply across all modules immediately.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {/* Light Mode */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: !isDark ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    background: !isDark ? 'var(--accent-subtle)' : 'var(--surface-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#d97706',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)',
                    }}
                  >
                    <Sun size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: !isDark ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      Light Mode
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Crisp daylight glass</div>
                  </div>
                  {!isDark && <Check size={18} color="var(--accent-primary)" />}
                </button>

                {/* Dark Mode */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: isDark ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    background: isDark ? 'var(--accent-subtle)' : 'var(--surface-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#a5b4fc',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                    }}
                  >
                    <Moon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: isDark ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      Dark Mode
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Deep translucent navy</div>
                  </div>
                  {isDark && <Check size={18} color="var(--accent-primary)" />}
                </button>
              </div>
            </div>

            {/* EMMU MESSENGER MAIN TOGGLE */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #075e54, #128c7e)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: 13.5 }}>Emmu Messenger</strong>
                <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11.5 }}>
                  Institutional messenger for direct encrypted chats, suggestions, and workflow notifications.
                </div>
              </div>
              <Toggle checked={emmuEnabled} onChange={handleToggleEmmu} />
            </div>

            {/* MESSENGER LAUNCHER ICON SELECTION */}
            {emmuEnabled && (
              <div style={{ ...cardStyle, display: 'grid', gap: 10 }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>Messenger Launcher Style</strong>
                  <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11.5 }}>
                    Select how the floating messenger widget appears on your screen.
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {/* Option 1: Emmu Mascot */}
                  <button
                    type="button"
                    onClick={() => handleLauncherChoice('emmu')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: launcherChoice === 'emmu' ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      background: launcherChoice === 'emmu' ? 'var(--accent-subtle)' : 'var(--surface-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: '#0f172a',
                        display: 'grid',
                        placeItems: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}emmu.png`}
                        alt="Emmu"
                        style={{ width: 28, height: 28, objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 12.5,
                          color: launcherChoice === 'emmu' ? 'var(--accent-primary)' : 'var(--text-primary)',
                        }}
                      >
                        Emmu Mascot
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Interactive Mascot</div>
                    </div>
                    {launcherChoice === 'emmu' && <Check size={16} color="var(--accent-primary)" />}
                  </button>

                  {/* Option 2: Standard Messenger Icon */}
                  <button
                    type="button"
                    onClick={() => handleLauncherChoice('messenger')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: launcherChoice === 'messenger' ? '2px solid #075e54' : '1px solid var(--border-glass)',
                      background: launcherChoice === 'messenger' ? 'rgba(7, 94, 84, 0.08)' : 'var(--surface-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #075e54, #128c7e)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      <MessageSquare size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 12.5,
                          color: launcherChoice === 'messenger' ? '#065f46' : 'var(--text-primary)',
                        }}
                      >
                        Messenger FAB
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Standard Icon</div>
                    </div>
                    {launcherChoice === 'messenger' && <Check size={16} color="#075e54" />}
                  </button>
                </div>
              </div>
            )}

            {/* MASCOT BACKGROUND TRANSPARENCY OPTION */}
            {emmuEnabled && launcherChoice === 'emmu' && (
              <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sparkles size={18} color="var(--accent-primary)" />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>Transparent Mascot Background</strong>
                  <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11.5 }}>
                    Remove the dark circular portal and border for a floating cutout mascot character.
                  </div>
                </div>
                <Toggle checked={transparentBg} onChange={handleToggleTransparentBg} />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Settings */}
        {tab === 'settings' && (
          <div style={{ paddingTop: 20, display: 'grid', gap: 16 }}>
            {/* 1. MANAGE ACCOUNT & ACTIVE SESSIONS */}
            <div style={{ ...cardStyle, display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    <Monitor size={18} />
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>Manage Account & Sessions</strong>
                    <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11.5 }}>
                      Review current device details, recent login activity, and manage authorized sessions.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm((p) => !p)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    fontSize: 12,
                    fontWeight: 750,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <LogOut size={14} />
                  Log Out Other Devices
                </button>
              </div>

              {/* Confirmation Prompt for Terminating Other Sessions */}
              {showLogoutConfirm && (
                <div
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 12, fontWeight: 650 }}>
                    <AlertCircle size={16} />
                    <span>Terminate all other active sessions and revoke existing tokens?</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowLogoutConfirm(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border-glass)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-muted)',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isLoggingOutOthers}
                      onClick={handleLogoutOtherSessions}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: 11.5,
                        fontWeight: 750,
                        cursor: 'pointer',
                      }}
                    >
                      {isLoggingOutOthers ? 'Terminating...' : 'Confirm Sign Out'}
                    </button>
                  </div>
                </div>
              )}

              {sessionSuccess && (
                <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                  {sessionSuccess}
                </div>
              )}
              {sessionError && (
                <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
                  {sessionError}
                </div>
              )}

              {/* Current Session Device Card */}
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--accent-subtle)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--accent-primary)',
                      flexShrink: 0,
                    }}
                  >
                    <Laptop size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                        {sessionData?.currentSession?.os || 'Desktop Device'} • {sessionData?.currentSession?.browser || 'Browser'}
                      </strong>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 99,
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                        Active Now
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>
                      IP: {sessionData?.currentSession?.ipAddress || '127.0.0.1'} • Current Authenticated Session
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Login History */}
              {sessionData?.recentLogins && sessionData.recentLogins.length > 0 && (
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                    Recent Login History
                  </div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {sessionData.recentLogins.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'var(--surface-primary)',
                          border: '1px solid var(--border-glass)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 11.5,
                        }}
                      >
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'} • {entry.remarks || 'Web Authentication'}
                        </div>
                        <span style={{ color: '#10b981', fontWeight: 750, fontSize: 10.5 }}>
                          {entry.status || 'SUCCESS'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. PASSWORD MANAGEMENT */}
            <form onSubmit={handlePasswordChange} style={{ ...cardStyle, display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <LockKeyhole size={18} />
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>Security & Password</strong>
                  <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11.5 }}>
                    Update your account password. Requires verification of your current password.
                  </div>
                </div>
              </div>

              {passwordSuccess && (
                <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={16} />
                  <span>{passwordError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
                {/* Current Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 750, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '9px 34px 9px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border-glass)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((p) => !p)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 750, color: 'var(--text-muted)', marginBottom: 5 }}>
                    New Password (min 6 chars)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '9px 34px 9px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border-glass)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((p) => !p)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 750, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '9px 34px 9px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border-glass)',
                        background: 'var(--surface-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 750,
                    cursor: (!currentPassword || !newPassword || !confirmPassword || isSavingPassword) ? 'not-allowed' : 'pointer',
                    opacity: (!currentPassword || !newPassword || !confirmPassword || isSavingPassword) ? 0.6 : 1,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSavingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>

            {/* 3. REDUCED MOTION */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-glass)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--accent-primary)',
                  flexShrink: 0,
                }}
              >
                <Eye size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: 13.5 }}>Reduced Motion</strong>
                <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11.5 }}>
                  Disable the 3D genie effect and limit decorative transitions and animations across the entire application.
                </div>
              </div>
              <Toggle checked={reducedMotion} onChange={toggleReducedMotion} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(AccountPanelSection);
