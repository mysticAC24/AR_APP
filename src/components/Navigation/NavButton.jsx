import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  Calendar as CalendarIcon, Users, LayoutList, Search, Clock, Award, 
  PartyPopper, Hand, X, ChevronRight, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, CheckSquare, MessageSquare, FileText, Send, 
  Plus, ExternalLink, Trophy, Medal, Phone, Video, Link as LinkIcon, 
  Receipt, Landmark, Download, ImageIcon, Check, XCircle
} from 'lucide-react';
import { MOCK_USERS, MOCK_EVENTS } from '../../data/mockData';

export function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
        ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
