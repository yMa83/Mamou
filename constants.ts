
import { Stage } from './types';

export const STAGES: Stage[] = [
  { name: 'פתיחה', offsetMinutes: -45 },
  { name: 'הודו', offsetMinutes: -25 },
  { name: 'ישתבח', offsetMinutes: -10 },
  { name: 'שמע', offsetMinutes: -4, offsetSeconds: -30 },
  { name: 'אמת', offsetMinutes: -2 },
  { name: 'נץ', offsetMinutes: 0 },
];

// A simple, short notification beep sound encoded in base64
export const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUReb18AAAAAAAAAAAAAAAADlS0+AT8/AT4tMpz+1o3/0m3/woj/xmT/xGv/wlH/wmX/wm3/wkT/wVn/wV3/wFr/wU//wEr/wEj/wEf/wET/wEM+wT8/AT4tMpz+1o3/0m3/woj/xmT/xGv/wlH/wmX/wm3/wkT/wVn/wV3/wFr/wU//wEr/wEj/wEf/wET/wEMA';
