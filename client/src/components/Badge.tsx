import React from 'react';
import type { BadgeLevel } from '../types';
import { getBadge } from '../types';

interface BadgeProps {
  spPoints: number;
  showPoints?: boolean;
}

const BADGE_ICONS: Record<BadgeLevel, string> = {
  Beginner: '🌱',
  Helper: '💡',
  Expert: '🔥',
  Mentor: '⭐',
};

const BadgeComponent: React.FC<BadgeProps> = ({ spPoints, showPoints = false }) => {
  const level = getBadge(spPoints);
  const icon = BADGE_ICONS[level];

  return (
    <span className={`badge badge-${level.toLowerCase()}`}>
      {icon} {level}
      {showPoints && <span style={{ marginLeft: '0.25rem', opacity: 0.8 }}>• {spPoints} SP</span>}
    </span>
  );
};

export default BadgeComponent;
