import { useState } from 'react'; 
import { XCircle } from 'lucide-react'; 
  
interface AdminDashboardProps { 
  isOpen: boolean; 
  onClose: () => void; 
} 
 
export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) { 
  if (!isOpen) return null; 
  return <div>Admin Dashboard</div>; 
} 
