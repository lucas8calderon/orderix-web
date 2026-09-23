import React from 'react';

export function AvatarWithInitials({ name, size = 56 }) {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-primary-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary)',
        fontWeight: 600,
        fontSize: size > 50 ? 18 : 13,
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
  );
}
