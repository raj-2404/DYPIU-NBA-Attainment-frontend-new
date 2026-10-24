import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import AttainmentProgressTracker from './AttainmentProgressTracker';
import dypLogo from '../../assets/image.png';
import iqacLogo from '../../assets/iqac.png';

export default function AppHeader() {
  const location = useLocation();
  const { role, user } = useAuth();
  const {
    schools,
    loadSchools,
  } = useAcademic();

  const isFaculty = role === 'FACULTY';
  const isWorkflowRoute = location.pathname.includes('workflow');
  const loadedSchoolRef = useRef(null);

  // Always refresh the authenticated user's school details when the header
  // loads, so the displayed name reflects the current school record.
  useEffect(() => {
    if (user?.schoolId && loadedSchoolRef.current !== String(user.schoolId)) {
      loadedSchoolRef.current = String(user.schoolId);
      loadSchools();
    }
  }, [loadSchools, user?.schoolId]);

  const schoolName =
    user?.school?.name ??
    user?.schoolName ??
    schools.find((school) => school.id === user?.schoolId || school.schoolId === user?.schoolId)?.name ??
    'School';

  // Completely suppress main header in all workflow routes (Director, HOD, Programme Coordinator, Course Coordinator)
  if (isWorkflowRoute) {
    return null;
  }

  return (
    <div className="app-header-shell" style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className="app-header-frame" style={{ width: '100%', padding: '25px 35px 0', boxSizing: 'border-box' }}>
        <header
          className="app-header-card glass-header"
          style={{
            width: '100%',
            margin: 0,
            padding: '24px 30px',
            background: 'var(--surface-header)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-webkit-blur)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '25px',
            boxSizing: 'border-box',
            transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <img
            className="app-header-logo"
            src={dypLogo}
            alt="DYPIU logo"
            style={{
              height: '78px',
              width: 'auto',
              maxWidth: 'min(30vw, 263px)',
              objectFit: 'contain',
              display: 'block',
              flexShrink: 0,
              justifySelf: 'start',
            }}
          />

          <div
            className="app-header-title"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              minWidth: 0,
              textAlign: 'center',
            }}
          >
            <h1 className="app-header-title-text" style={{ margin: 0, fontSize: '24px', fontWeight: '950', color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              Outcome-Based Education (OBE) Attainment System
            </h1>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {schoolName}
            </div>
          </div>

          <img
            className="app-header-logo"
            src={iqacLogo}
            alt="IQAC logo"
            style={{
              height: '78px',
              width: 'auto',
              maxWidth: 'min(30vw, 263px)',
              objectFit: 'contain',
              display: 'block',
              flexShrink: 0,
              justifySelf: 'end',
            }}
          />
        </header>
      </div>

      {/* Render Start Course Attainment Row ONLY on Dashboard */}
      {isFaculty && (location.pathname === '/dashboard' || location.pathname === '/') && <AttainmentProgressTracker />}
    </div>
  );
}
