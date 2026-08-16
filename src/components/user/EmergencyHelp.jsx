export default function EmergencyHelp({ className = '' }) {
  return <button className={`danger ${className}`} onClick={() => alert('Mental Health Helpline: 1800-599-0019')}>Emergency Help</button>;
}
