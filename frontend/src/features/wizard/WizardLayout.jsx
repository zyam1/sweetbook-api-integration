import { NavLink, Outlet } from 'react-router-dom';
import { WizardProvider } from './WizardContext';

const STEPS = [
  { path: '/wizard/spec', label: '1. 판형' },
  { path: '/wizard/upload', label: '2. 업로드' },
  { path: '/wizard/edit', label: '3. 편집' },
  { path: '/wizard/order', label: '4. 주문' },
];

export default function WizardLayout() {
  return (
    <WizardProvider>
      <div className="wizard">
        <ol className="wizard-steps">
          {STEPS.map((s) => (
            <li key={s.path}>
              <NavLink to={s.path}>{s.label}</NavLink>
            </li>
          ))}
        </ol>
        <div className="wizard-body">
          <Outlet />
        </div>
      </div>
    </WizardProvider>
  );
}
