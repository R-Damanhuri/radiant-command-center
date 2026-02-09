'use client';

import { useState } from 'react';
import { analyzeIntent, sendTaskToAgent, createTaskFromIntent, type IntentAnalysis, AGENT_ROLES } from '@/lib/api';
import { AgentDefinition } from '@/lib/agent-registry';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Command, 
  Sparkles, 
  ArrowRight, 
  Plus,
  BarChart,
  Code,
  Pen,
  Globe,
  MessageCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_ICONS: Record<string, any> = {
  'analyst': BarChart,
  'coder': Code,
  'writer': Pen,
  'scraper': Globe,
  'outreach': MessageCircle,
};

interface CommanderPanelProps {
  onCreateTask?: (task: Task) => void;
}

export function CommanderPanel({ onCreateTask }: CommanderPanelProps) {
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<IntentAnalysis | null>(null);
  const [sending, setSending] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setAnalyzing(true);
    // Simulate analysis delay for effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = analyzeIntent(input);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleExecute = async () => {
    if (!analysis) return;
    
    setSending(true);
    
    // Create task
    const task = createTaskFromIntent(analysis, input);
    onCreateTask?.(task);
    
    // Send to agent
    await sendTaskToAgent(analysis.primaryRole, input);
    
    setSending(false);
    setInput('');
    setAnalysis(null);
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Command className="w-5 h-5 text-emerald-400" />
          Commander Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Describe what you need..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Button 
            onClick={handleAnalyze}
            disabled={!input.trim() || analyzing}
            variant="outline"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </Button>
        </div>

        {/* Analysis Result */}
        {analysis && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            {/* Primary Role */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Primary Role:</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                {(() => {
                  const Icon = ROLE_ICONS[analysis.primaryRole] || Command;
                  return <Icon className="w-3 h-3" />;
                })()}
                {AGENT_ROLES[analysis.primaryRole]?.name || analysis.primaryRole}
              </Badge>
            </div>

            {/* Sub-tasks */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500">Task Breakdown:</span>
              <div className="space-y-1">
                {analysis.subTasks.map((sub, idx) => {
                  const Icon = ROLE_ICONS[sub.role] || Command;
                  return (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 text-sm bg-slate-800/50 rounded px-3 py-2"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 flex-1">{sub.description}</span>
                      <Badge 
                        variant={sub.priority === 'high' ? 'error' : sub.priority === 'medium' ? 'warning' : 'secondary'}
                        className="text-xs"
                      >
                        {sub.priority}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complexity */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Complexity:</span>
              <Badge 
                variant={analysis.estimatedComplexity === 'complex' ? 'error' : analysis.estimatedComplexity === 'moderate' ? 'warning' : 'success'}
              >
                {analysis.estimatedComplexity}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleExecute}
                disabled={sending}
                className="flex-1"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Executing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Execute Workflow
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setAnalysis(null);
                  setInput('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!analysis && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(AGENT_ROLES).map(([key, role]) => {
              const Icon = ROLE_ICONS[key] || Command;
              return (
                <button
                  key={key}
                  onClick={() => setInput(`Please help me with a ${role.role} task...`)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Icon className="w-3 h-3" />
                  {role.role}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
