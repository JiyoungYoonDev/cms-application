'use client';

import { useState } from 'react';
import { Activity, ShieldCheck, FileText } from 'lucide-react';
import OverviewTab from './overview-tab';
import ValidationTab from './validation-tab';
import TemplatesTab from './templates-tab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'validation', label: 'Validation', icon: ShieldCheck },
  { id: 'templates', label: 'Prompt Templates', icon: FileText },
];

export default function GenerationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className='max-w-7xl mx-auto py-8 px-4 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>AI Generation</h1>
        <p className='text-sm text-muted-foreground mt-0.5'>
          Monitor generation quality, batch performance, and prompt versions
        </p>
      </div>

      {/* Tab bar */}
      <div className='flex items-center gap-1 border-b'>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }
              `}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'validation' && <ValidationTab />}
      {activeTab === 'templates' && <TemplatesTab />}
    </div>
  );
}
