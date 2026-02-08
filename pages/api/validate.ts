import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface LoginCode {
  telegram_id: string;
  code: string;
  expires: string;
  name: string;
  plan: string;
}

interface ValidateResponse {
  valid: boolean;
  error?: string;
  user?: {
    telegram_id: string;
    name: string;
    plan: string;
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidateResponse>
) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'Code required' });
  }

  const normalizedCode = code.toUpperCase().trim();

  try {
    // Read login codes from public data
    const dataPath = path.join(process.cwd(), 'public', 'data.json');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(500).json({ valid: false, error: 'Data not available' });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const loginCodes: LoginCode[] = data.login_codes || [];

    // Find matching code
    const match = loginCodes.find((lc) => {
      // Check both login_code and access_code
      return lc.code === normalizedCode;
    });

    if (!match) {
      return res.status(401).json({ valid: false, error: 'Invalid code' });
    }

    // Check expiration
    const expires = new Date(match.expires);
    if (expires < new Date()) {
      return res.status(401).json({ valid: false, error: 'Code expired' });
    }

    // Success!
    return res.status(200).json({
      valid: true,
      user: {
        telegram_id: match.telegram_id,
        name: match.name,
        plan: match.plan
      }
    });

  } catch (error) {
    console.error('Validate error:', error);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}
