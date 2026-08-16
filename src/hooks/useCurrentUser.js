export default function useCurrentUser() { return { name: localStorage.getItem('userName') || '', email: localStorage.getItem('userEmail') || '' }; }
