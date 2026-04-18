import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import type { PriceFinderResponse } from '../types/price-finder';

export type PriceFinderStatus =
  | 'idle'
  | 'requesting_location'
  | 'searching'
  | 'success'
  | 'error';

// Module-level store so the results screen can read them without URL params
let _lastResults: PriceFinderResponse | null = null;

export function getLastPriceFinderResults(): PriceFinderResponse | null {
  return _lastResults;
}

export function usePriceFinder() {
  const [status, setStatus] = useState<PriceFinderStatus>('idle');

  const search = async (items: string[], bundleId: string) => {
    if (items.length === 0) return;

    // ── 1. Request location permission ──────────────────────────────────────
    setStatus('requesting_location');

    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== 'granted') {
      setStatus('idle');
      Alert.alert(
        'נדרש מיקום',
        'כדי למצוא את החנות הזולה ביותר, אנא אפשר גישה למיקום בהגדרות.',
        [
          { text: 'ביטול', style: 'cancel' },
          {
            text: 'פתח הגדרות',
            onPress: () => {
              if (Platform.OS === 'ios') {
                // expo-linking can open settings but we keep the dep minimal
                Alert.alert('פתח את \'הגדרות\' > \'Bundly\' > \'מיקום\'.');
              }
            },
          },
        ]
      );
      return;
    }

    // ── 2. Get GPS coordinates ───────────────────────────────────────────────
    setStatus('searching');

    let lat: number;
    let lon: number;
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      lat = location.coords.latitude;
      lon = location.coords.longitude;
    } catch {
      setStatus('error');
      Alert.alert('שגיאת מיקום', 'לא הצלחנו לקבל את מיקומך. נסה שוב.');
      return;
    }

    // ── 3. Invoke the Edge Function ──────────────────────────────────────────
    try {
      const { data, error } = await supabase.functions.invoke<PriceFinderResponse>(
        'find-cheapest-store',
        { body: { items, lat, lon } }
      );

      if (error) throw error;
      if (!data) throw new Error('Empty response from server');

      _lastResults = data;
      setStatus('success');
      router.push(`/bundle/${bundleId}/cheapest-store`);
    } catch (err: unknown) {
      setStatus('error');
      const message = err instanceof Error ? err.message : 'שגיאה לא ידועה';
      Alert.alert('שגיאה', `לא הצלחנו למצוא מחירים: ${message}`);
    }
  };

  const reset = () => {
    setStatus('idle');
    _lastResults = null;
  };

  return { status, search, reset };
}
