/**
 * Cardly icon set.
 *
 * Pure View-based icons — no external icon library. Every icon is assembled
 * from View/border primitives to keep the neobrutalist, geometric aesthetic
 * and add zero to the bundle size.
 *
 * Each icon renders at the given `size` (default 20) in the given `color`.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 20;

/* ── Arrow Left ─────────────────────────────────────────────────────── */

export function IconArrowLeft({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const stem = Math.round(size * 0.55);
  const stemH = Math.max(2, Math.round(size * 0.12));
  const chevronSide = Math.round(size * 0.38);
  const chevronW = Math.max(2, Math.round(size * 0.12));
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* stem */}
      <View style={{ position: 'absolute', left: Math.round(size * 0.22), top: Math.round((size - stemH) / 2), width: stem, height: stemH, backgroundColor: color }} />
      {/* chevron */}
      <View style={{
        position: 'absolute',
        left: Math.round(size * 0.15),
        top: Math.round((size - chevronSide) / 2),
        width: chevronSide,
        height: chevronSide,
        borderLeftWidth: chevronW,
        borderBottomWidth: chevronW,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
    </View>
  );
}

/* ── Shield ──────────────────────────────────────────────────────────── */

export function IconShield({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const w = Math.round(size * 0.6);
  const h = Math.round(size * 0.72);
  const bw = Math.max(2, Math.round(size * 0.1));
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{
        width: w,
        height: h,
        borderWidth: bw,
        borderColor: color,
        borderTopLeftRadius: Math.round(w * 0.15),
        borderTopRightRadius: Math.round(w * 0.15),
        borderBottomLeftRadius: Math.round(w * 0.5),
        borderBottomRightRadius: Math.round(w * 0.5),
      }}>
        {/* checkmark inside */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: Math.round(w * 0.35),
            height: Math.round(w * 0.55),
            borderBottomWidth: bw,
            borderRightWidth: bw,
            borderColor: color,
            transform: [{ rotate: '40deg' }],
            marginTop: -Math.round(w * 0.1),
          }} />
        </View>
      </View>
    </View>
  );
}

/* ── Plus ────────────────────────────────────────────────────────────── */

export function IconPlus({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const barLen = Math.round(size * 0.55);
  const barW = Math.max(2, Math.round(size * 0.14));
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{ position: 'absolute', width: barLen, height: barW, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ position: 'absolute', width: barW, height: barLen, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

/* ── Lock ────────────────────────────────────────────────────────────── */

export function IconLock({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const bodyW = Math.round(size * 0.58);
  const bodyH = Math.round(size * 0.4);
  const archW = Math.round(size * 0.38);
  const archH = Math.round(size * 0.3);
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* arch */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.1),
        width: archW,
        height: archH,
        borderWidth: bw,
        borderBottomWidth: 0,
        borderColor: color,
        borderTopLeftRadius: archW / 2,
        borderTopRightRadius: archW / 2,
      }} />
      {/* body */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.1) + archH - bw,
        width: bodyW,
        height: bodyH,
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.06),
      }} />
    </View>
  );
}

/* ── Gear ────────────────────────────────────────────────────────────── */

export function IconGear({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.09));
  const outer = Math.round(size * 0.6);
  const inner = Math.round(size * 0.24);
  const toothW = Math.max(2, Math.round(size * 0.12));
  const toothH = Math.max(2, Math.round(size * 0.14));
  const offset = Math.round(size * 0.34);

  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* 6 perimeter teeth */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <View
          key={deg}
          style={{
            position: 'absolute',
            width: toothW,
            height: toothH,
            backgroundColor: color,
            borderRadius: 1,
            transform: [{ rotate: `${deg}deg` }, { translateY: -offset }],
          }}
        />
      ))}
      {/* Outer circular rim */}
      <View
        style={{
          position: 'absolute',
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          borderWidth: bw,
          borderColor: color,
        }}
      />
      {/* Inner center axle/hub */}
      <View
        style={{
          position: 'absolute',
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          borderWidth: bw,
          borderColor: color,
        }}
      />
    </View>
  );
}

/* ── Copy ────────────────────────────────────────────────────────────── */

export function IconCopy({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const rectW = Math.round(size * 0.48);
  const rectH = Math.round(size * 0.55);
  const offset = Math.round(size * 0.18);
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* back rect */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.1),
        left: Math.round(size * 0.1) + offset,
        width: rectW,
        height: rectH,
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.06),
      }} />
      {/* front rect */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.1) + offset,
        left: Math.round(size * 0.1),
        width: rectW,
        height: rectH,
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.06),
        backgroundColor: 'transparent',
      }} />
    </View>
  );
}

/* ── Eye ─────────────────────────────────────────────────────────────── */

export function IconEye({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const eyeW = Math.round(size * 0.72);
  const eyeH = Math.round(size * 0.38);
  const pupil = Math.round(size * 0.2);
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{
        width: eyeW,
        height: eyeH,
        borderWidth: bw,
        borderColor: color,
        borderRadius: eyeH / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          width: pupil,
          height: pupil,
          borderRadius: pupil / 2,
          backgroundColor: color,
        }} />
      </View>
    </View>
  );
}

/* ── Eye Off ─────────────────────────────────────────────────────────── */

export function IconEyeOff({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const eyeW = Math.round(size * 0.72);
  const eyeH = Math.round(size * 0.38);
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{
        width: eyeW,
        height: eyeH,
        borderWidth: bw,
        borderColor: color,
        borderRadius: eyeH / 2,
        opacity: 0.4,
      }} />
      {/* diagonal strike */}
      <View style={{
        position: 'absolute',
        width: Math.round(size * 0.8),
        height: bw,
        backgroundColor: color,
        transform: [{ rotate: '-30deg' }],
      }} />
    </View>
  );
}

/* ── Card ────────────────────────────────────────────────────────────── */

export function IconCard({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const w = Math.round(size * 0.78);
  const h = Math.round(size * 0.52);
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{
        width: w,
        height: h,
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.06),
      }}>
        {/* magnetic stripe */}
        <View style={{
          position: 'absolute',
          top: Math.round(h * 0.28),
          left: 0,
          right: 0,
          height: Math.round(h * 0.2),
          backgroundColor: color,
          opacity: 0.3,
        }} />
      </View>
    </View>
  );
}

/* ── Trash ───────────────────────────────────────────────────────────── */

export function IconTrash({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const bodyW = Math.round(size * 0.5);
  const bodyH = Math.round(size * 0.5);
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* lid */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.15),
        width: Math.round(size * 0.65),
        height: bw,
        backgroundColor: color,
      }} />
      {/* handle */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.08),
        width: Math.round(size * 0.26),
        height: Math.round(size * 0.12),
        borderWidth: bw,
        borderBottomWidth: 0,
        borderColor: color,
        borderTopLeftRadius: Math.round(size * 0.06),
        borderTopRightRadius: Math.round(size * 0.06),
      }} />
      {/* body */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.15) + bw + 1,
        width: bodyW,
        height: bodyH,
        borderWidth: bw,
        borderTopWidth: 0,
        borderColor: color,
        borderBottomLeftRadius: Math.round(size * 0.06),
        borderBottomRightRadius: Math.round(size * 0.06),
      }} />
    </View>
  );
}

/* ── Cloud ───────────────────────────────────────────────────────────── */

export function IconCloud({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* base ellipse */}
      <View style={{
        position: 'absolute',
        bottom: Math.round(size * 0.22),
        width: Math.round(size * 0.72),
        height: Math.round(size * 0.32),
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.16),
      }} />
      {/* top bump */}
      <View style={{
        position: 'absolute',
        bottom: Math.round(size * 0.35),
        left: Math.round(size * 0.2),
        width: Math.round(size * 0.32),
        height: Math.round(size * 0.32),
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.16),
      }} />
    </View>
  );
}

/* ── Check ───────────────────────────────────────────────────────────── */

export function IconCheck({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.14));
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{
        width: Math.round(size * 0.3),
        height: Math.round(size * 0.52),
        borderBottomWidth: bw,
        borderRightWidth: bw,
        borderColor: color,
        transform: [{ rotate: '40deg' }],
        marginTop: -Math.round(size * 0.08),
      }} />
    </View>
  );
}

/* ── Camera ──────────────────────────────────────────────────────────── */

export function IconCamera({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const bodyW = Math.round(size * 0.72);
  const bodyH = Math.round(size * 0.48);
  const lens = Math.round(size * 0.22);
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* viewfinder bump */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.14),
        width: Math.round(size * 0.24),
        height: Math.round(size * 0.12),
        borderWidth: bw,
        borderBottomWidth: 0,
        borderColor: color,
        borderTopLeftRadius: Math.round(size * 0.04),
        borderTopRightRadius: Math.round(size * 0.04),
      }} />
      {/* body */}
      <View style={{
        position: 'absolute',
        top: Math.round(size * 0.24),
        width: bodyW,
        height: bodyH,
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.06),
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          width: lens,
          height: lens,
          borderRadius: lens / 2,
          borderWidth: bw,
          borderColor: color,
        }} />
      </View>
    </View>
  );
}

/* ── Keyboard ────────────────────────────────────────────────────────── */

export function IconKeyboard({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const w = Math.round(size * 0.78);
  const h = Math.round(size * 0.52);
  const dotS = Math.max(2, Math.round(size * 0.08));
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{
        width: w,
        height: h,
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.06),
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Math.round(size * 0.06),
        padding: Math.round(size * 0.06),
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={{ width: dotS, height: dotS, backgroundColor: color, borderRadius: 1 }} />
        ))}
        {/* space bar */}
        <View style={{ width: Math.round(w * 0.5), height: dotS, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  );
}

/* ── Chevron Right ───────────────────────────────────────────────────── */

export function IconChevronRight({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const chevronSide = Math.round(size * 0.32);
  const chevronW = Math.max(2, Math.round(size * 0.12));
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{
        width: chevronSide,
        height: chevronSide,
        borderRightWidth: chevronW,
        borderTopWidth: chevronW,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginLeft: -Math.round(size * 0.06),
      }} />
    </View>
  );
}

/* ── Key ─────────────────────────────────────────────────────────────── */

export function IconKey({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const headD = Math.round(size * 0.36);
  const shaftW = Math.round(size * 0.4);
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* head */}
      <View style={{
        position: 'absolute',
        left: Math.round(size * 0.1),
        width: headD,
        height: headD,
        borderRadius: headD / 2,
        borderWidth: bw,
        borderColor: color,
      }} />
      {/* shaft */}
      <View style={{
        position: 'absolute',
        top: Math.round((size - bw) / 2),
        left: Math.round(size * 0.1) + headD - bw,
        width: shaftW,
        height: bw,
        backgroundColor: color,
      }} />
      {/* tooth */}
      <View style={{
        position: 'absolute',
        top: Math.round(size / 2),
        right: Math.round(size * 0.16),
        width: bw,
        height: Math.round(size * 0.15),
        backgroundColor: color,
      }} />
    </View>
  );
}

/* ── Document ────────────────────────────────────────────────────────── */

export function IconDocument({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const w = Math.round(size * 0.52);
  const h = Math.round(size * 0.68);
  const lineW = Math.round(w * 0.55);
  const lineH = Math.max(1, Math.round(size * 0.06));
  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View style={{
        width: w,
        height: h,
        borderWidth: bw,
        borderColor: color,
        borderRadius: Math.round(size * 0.04),
        justifyContent: 'center',
        alignItems: 'center',
        gap: Math.round(size * 0.08),
      }}>
        <View style={{ width: lineW, height: lineH, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: lineW, height: lineH, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: lineW * 0.65, height: lineH, backgroundColor: color, borderRadius: 1 }} />
      </View>
    </View>
  );
}

/* ── Search ──────────────────────────────────────────────────────────── */

export function IconSearch({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const bw = Math.max(2, Math.round(size * 0.1));
  const lens = Math.round(size * 0.52);
  const stemW = Math.max(2, Math.round(size * 0.11));
  const stemH = Math.round(size * 0.32);

  return (
    <View style={[iconBase, { width: size, height: size }]}>
      {/* Circular lens */}
      <View
        style={{
          position: 'absolute',
          top: Math.round(size * 0.12),
          left: Math.round(size * 0.12),
          width: lens,
          height: lens,
          borderRadius: lens / 2,
          borderWidth: bw,
          borderColor: color,
        }}
      />
      {/* Stem angled at 45 deg */}
      <View
        style={{
          position: 'absolute',
          bottom: Math.round(size * 0.14),
          right: Math.round(size * 0.16),
          width: stemW,
          height: stemH,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/* ── Close / X ───────────────────────────────────────────────────────── */

export function IconClose({ size = DEFAULT_SIZE, color = '#1B1612' }: IconProps) {
  const barLen = Math.round(size * 0.58);
  const barW = Math.max(2, Math.round(size * 0.11));

  return (
    <View style={[iconBase, { width: size, height: size }]}>
      <View
        style={{
          position: 'absolute',
          width: barLen,
          height: barW,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: barLen,
          height: barW,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/* ── Shared base ─────────────────────────────────────────────────────── */

const iconBase = StyleSheet.flatten({
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});

