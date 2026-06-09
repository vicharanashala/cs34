import React from 'react';
import type { QuestionTag } from '../types';

interface TagChipProps {
  tag: QuestionTag | string;
  active?: boolean;
  onClick?: () => void;
}

const TagChip: React.FC<TagChipProps> = ({ tag, active, onClick }) => (
  <span
    className={`tag${active ? ' active' : ''}`}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    {tag}
  </span>
);

export default TagChip;
