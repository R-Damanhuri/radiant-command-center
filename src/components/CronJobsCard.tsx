'use client';

import { Clock, Calendar, Play, Trash2, Bot, Server } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface CronJob {
  id: string;
  name?: string;
  schedule: string;
  command: string;
  enabled?: boolean;
  type?: 'infrastructure' | 'agent';
  agent?: string;
  agentName?: string;
}

interface CronJobsCardProps {
  onRun?: (jobId: string, type: string) => void;
  onDelete?: (jobId: string, type: string) => void;
}

export function CronJobsCard({ onRun, onDelete }: CronJobsCardProps) {
  const [infraJobs, setInfraJobs] = useState<CronJob[]>([]);
  const [agentJobs, setAgentJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCronJobs() {
      try {
        // Fetch system crontab
        const sysRes = await fetch('/api/cron/system');
        const sysData = await sysRes.json();
        setInfraJobs(sysData.jobs || []);

        // Fetch OpenClaw cron
        const owlRes = await fetch('/api/cron/openclaw');
        const owlData = await owlRes.json();
        setAgentJobs(owlData.jobs || []);
      } catch (error) {
        console.error('Failed to fetch cron jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCronJobs();
  }, []);

  const getAgentName = (agent?: string) => {
    const names: Record<string, string> = {
      'quest': 'Quest',
      'radiant': 'Radiant',
      'forge': 'Forge',
    };
    return agent ? (names[agent] || agent) : '';
  };

  const enabledInfra = infraJobs.filter(j => j.enabled !== false);
  const enabledAgents = agentJobs.filter(j => j.enabled !== false);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-200">
          <Calendar className="w-4 h-4 text-amber-400" />
          Scheduled
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Agent Jobs Section */}
        {agentJobs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Agent Tasks
              </span>
            </div>
            <div className="space-y-2">
              {enabledAgents.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {job.name || 'Unnamed Job'}
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                        <p className="text-xs text-slate-500 font-mono">
                          {job.schedule}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {job.agent && (
                      <span className="text-xs px-1.5 py-0.5 rounded text-blue-400 bg-slate-800">
                        {getAgentName(job.agent)}
                      </span>
                    )}
                    <button
                      onClick={() => onRun?.(job.id, 'openclaw')}
                      className="p-1 rounded hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Run now"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete?.(job.id, 'openclaw')}
                      className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Infrastructure Jobs Section */}
        {infraJobs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-3 h-3 text-slate-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Infrastructure
              </span>
            </div>
            <div className="space-y-2">
              {enabledInfra.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {job.name || 'Infrastructure'}
                      </p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-slate-500" />
                        <p className="text-xs text-slate-500 font-mono">
                          {job.schedule}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onRun?.(job.id, 'system')}
                      className="p-1 rounded hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Run now"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete?.(job.id, 'system')}
                      className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {infraJobs.length === 0 && agentJobs.length === 0 && (
          <div className="text-center py-4 text-slate-500 text-xs">
            No scheduled jobs
          </div>
        )}

        {/* Summary */}
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            {enabledAgents.length} agent • {enabledInfra.length} infra
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
