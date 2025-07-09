import { UserType } from '../types/interfaces';

export async function login(email: string, password: string, userType: UserType) {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('user_type', userType);

  const res = await fetch('http://localhost:8000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
  return res.json();
}

export async function registerTeam(name: string, email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('password', password);

  const res = await fetch('http://localhost:8000/api/teams/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed');
  return res.json();
} 