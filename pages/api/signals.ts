import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface SignalsResponse {
  success: boolean;
  error?: string;
  stats?: {
    total_signals: number;
    wins: number;
    losses: number;
    pending: number;
    win_rate: number;
    total_pnl: number;
    avg_win: number;
    avg_loss: number;
    best_trade: number;
    worst_trade: number;
  };
  recent_signals?: Array<{
    id: string;
    symbol: string;
    direction: string;
    entry_price: number;
    status: string;
    pnl: number;
    published_at: string;
  }>;
  monthly?: Record<string, {
    signals: number;
    wins: number;
    pnl: number;
  }>;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignalsResponse>
) {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data.json');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(500).json({ success: false, error: 'Data not available' });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const konanSignals = data.konan_signals || {};

    return res.status(200).json({
      success: true,
      stats: konanSignals.stats || {},
      recent_signals: konanSignals.recent_signals || [],
      monthly: konanSignals.monthly || {}
    });

  } catch (error) {
    console.error('Signals API error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
