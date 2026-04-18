import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';
import ModalHeader from '../../../components/ModalHeader';
import { getLastPriceFinderResults } from '../../../hooks/usePriceFinder';
import type { StoreResult } from '../../../types/price-finder';

export default function CheapestStoreScreen() {
  const data = getLastPriceFinderResults();
  const [expandedChain, setExpandedChain] = useState<string | null>(null);

  if (!data) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ModalHeader title="חנות הכי זולה" />
        <View style={styles.emptyState}>
          <Ionicons name="storefront-outline" size={48} color={colors.text.disabled} />
          <Text style={styles.emptyText}>אין נתונים להצגה</Text>
        </View>
      </View>
    );
  }

  const { results, locationLabel, warning, searchedAt } = data;
  const winner = results[0];

  const toggleExpand = (chainId: string) => {
    setExpandedChain((prev) => (prev === chainId ? null : chainId));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ModalHeader title="חנות הכי זולה" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Location banner */}
        <View style={styles.locationBanner}>
          <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.locationText}>מחפש ב{locationLabel}</Text>
        </View>

        {/* Warning banner */}
        {warning && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={15} color={colors.warning.text} />
            <Text style={styles.warningText}>{warning}</Text>
          </View>
        )}

        {/* No results */}
        {results.length === 0 && !warning && (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyText}>לא נמצאו חנויות באזורך</Text>
          </View>
        )}

        {/* Winner card */}
        {winner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>המחיר הכי טוב</Text>
            <WinnerCard result={winner} onExpand={() => toggleExpand(winner.chainId)} expanded={expandedChain === winner.chainId} />
          </View>
        )}

        {/* Other stores */}
        {results.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>חנויות נוספות</Text>
            <View style={styles.storeList}>
              {results.slice(1).map((result, i) => (
                <StoreResultRow
                  key={result.chainId}
                  result={result}
                  rank={i + 2}
                  isLast={i === results.length - 2}
                  expanded={expandedChain === result.chainId}
                  onExpand={() => toggleExpand(result.chainId)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={colors.text.disabled} />
          <Text style={styles.disclaimerText}>
            המחירים מתעדכנים פעם ביום ועשויים לא לשקף מבצעים נוכחיים.
            {'\n'}עודכן: {new Date(searchedAt).toLocaleString('he-IL')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function WinnerCard({
  result,
  expanded,
  onExpand,
}: {
  result: StoreResult;
  expanded: boolean;
  onExpand: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.winnerCard}
      onPress={onExpand}
      activeOpacity={0.85}
    >
      <View style={styles.winnerTop}>
        <View style={styles.winnerBadge}>
          <Text style={styles.winnerBadgeText}>הכי זול!</Text>
        </View>
        <View style={styles.winnerInfo}>
          <Text style={styles.winnerChainName}>{result.chainName}</Text>
          <Text style={styles.winnerAddress} numberOfLines={1}>
            {result.nearestStoreAddress}
          </Text>
        </View>
        <View style={styles.winnerPriceBox}>
          <Text style={styles.winnerPrice}>₪{result.totalEstimatedCost.toFixed(2)}</Text>
          <Text style={styles.winnerItemsFound}>
            {result.itemsFound}/{result.itemsTotal} פריטים
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.primary.dark}
          style={styles.chevron}
        />
      </View>

      {expanded && <ItemBreakdown result={result} />}
    </TouchableOpacity>
  );
}

function StoreResultRow({
  result,
  rank,
  isLast,
  expanded,
  onExpand,
}: {
  result: StoreResult;
  rank: number;
  isLast: boolean;
  expanded: boolean;
  onExpand: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.storeRow, !isLast && styles.storeRowBorder]}
      onPress={onExpand}
      activeOpacity={0.7}
    >
      <View style={styles.storeRankBadge}>
        <Text style={styles.storeRankText}>#{rank}</Text>
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeChainName}>{result.chainName}</Text>
        <Text style={styles.storeAddress} numberOfLines={1}>
          {result.nearestStoreAddress}
        </Text>
      </View>
      <View style={styles.storePriceBox}>
        <Text style={styles.storePrice}>₪{result.totalEstimatedCost.toFixed(2)}</Text>
        <Text style={styles.storeItemsFound}>
          {result.itemsFound}/{result.itemsTotal}
        </Text>
      </View>
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={16}
        color={colors.text.secondary}
      />

      {expanded && <ItemBreakdown result={result} />}
    </TouchableOpacity>
  );
}

function ItemBreakdown({ result }: { result: StoreResult }) {
  return (
    <View style={styles.breakdown}>
      {result.itemPrices.map((ip, i) => (
        <View
          key={i}
          style={[styles.breakdownRow, i < result.itemPrices.length - 1 && styles.breakdownBorder]}
        >
          <View style={styles.breakdownLeft}>
            <Text style={styles.breakdownItemName}>{ip.itemName}</Text>
            {ip.matchedProductName && ip.matchedProductName !== ip.itemName && (
              <Text style={styles.breakdownMatched} numberOfLines={1}>
                {ip.matchedProductName}
              </Text>
            )}
          </View>
          <Text style={[styles.breakdownPrice, ip.price == null && styles.breakdownNotFound]}>
            {ip.price != null ? `₪${ip.price.toFixed(2)}${ip.unit ? ` / ${ip.unit}` : ''}` : 'לא נמצא'}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '600',
  },

  // Location / warning banners
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.info.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.info.border,
  },
  locationText: {
    fontSize: 13,
    color: colors.info.text,
    fontWeight: '500',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.warning.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning.border,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning.text,
    fontWeight: '500',
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.disabled,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Winner card
  winnerCard: {
    backgroundColor: colors.primary.dark,
    borderRadius: 18,
    padding: 16,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  winnerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  winnerBadge: {
    backgroundColor: '#FFDE7D',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  winnerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B6914',
  },
  winnerInfo: {
    flex: 1,
  },
  winnerChainName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary.contrast,
    marginBottom: 2,
  },
  winnerAddress: {
    fontSize: 12,
    color: colors.primary.light,
  },
  winnerPriceBox: {
    alignItems: 'flex-end',
  },
  winnerPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary.contrast,
  },
  winnerItemsFound: {
    fontSize: 11,
    color: colors.primary.light,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 2,
  },

  // Other stores list
  storeList: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.background.border,
    overflow: 'hidden',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    flexWrap: 'wrap',
  },
  storeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
  },
  storeRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  storeRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  storeInfo: {
    flex: 1,
  },
  storeChainName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  storeAddress: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  storePriceBox: {
    alignItems: 'flex-end',
  },
  storePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  storeItemsFound: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },

  // Item breakdown
  breakdown: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 8,
  },
  breakdownBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary.contrast,
  },
  breakdownMatched: {
    fontSize: 11,
    color: colors.primary.light,
    marginTop: 1,
  },
  breakdownPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.contrast,
  },
  breakdownNotFound: {
    color: colors.primary.light,
    fontStyle: 'italic',
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 24,
    marginTop: 28,
    padding: 12,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: colors.text.disabled,
    lineHeight: 16,
  },
});
