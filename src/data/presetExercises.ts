import type { Exercise } from '../types';

export const PRESET_EXERCISES: Exercise[] = [
  { id: 'p_bench', name: 'ベンチプレス', muscleGroup: '胸', isCustom: false },
  { id: 'p_inc_db', name: 'インクラインダンベルプレス', muscleGroup: '胸', isCustom: false },
  { id: 'p_fly', name: 'ダンベルフライ', muscleGroup: '胸', isCustom: false },
  { id: 'p_pushup', name: 'プッシュアップ', muscleGroup: '胸', isCustom: false },

  { id: 'p_dl', name: 'デッドリフト', muscleGroup: '背中', isCustom: false },
  { id: 'p_lat', name: 'ラットプルダウン', muscleGroup: '背中', isCustom: false },
  { id: 'p_row', name: 'ベントオーバーロー', muscleGroup: '背中', isCustom: false },
  { id: 'p_chin', name: 'チンアップ', muscleGroup: '背中', isCustom: false },

  { id: 'p_squat', name: 'バーベルスクワット', muscleGroup: '脚', isCustom: false },
  { id: 'p_legpress', name: 'レッグプレス', muscleGroup: '脚', isCustom: false },
  { id: 'p_lunge', name: 'ランジ', muscleGroup: '脚', isCustom: false },
  { id: 'p_legcurl', name: 'レッグカール', muscleGroup: '脚', isCustom: false },

  { id: 'p_ohp', name: 'ショルダープレス', muscleGroup: '肩', isCustom: false },
  { id: 'p_side', name: 'サイドレイズ', muscleGroup: '肩', isCustom: false },
  { id: 'p_front', name: 'フロントレイズ', muscleGroup: '肩', isCustom: false },

  { id: 'p_curl', name: 'バーベルカール', muscleGroup: '腕', isCustom: false },
  { id: 'p_hammer', name: 'ハンマーカール', muscleGroup: '腕', isCustom: false },
  { id: 'p_tricep', name: 'トライセプスプレスダウン', muscleGroup: '腕', isCustom: false },

  { id: 'p_plank', name: 'プランク', muscleGroup: '体幹', isCustom: false },
  { id: 'p_crunch', name: 'クランチ', muscleGroup: '体幹', isCustom: false },
  { id: 'p_legraise', name: 'レッグレイズ', muscleGroup: '体幹', isCustom: false },
];
