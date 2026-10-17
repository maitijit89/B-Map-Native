import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Search,
  Navigation,
  MapPin,
  Heart,
  Share2,
  Lock,
  Zap,
  Sparkles,
} from 'lucide-react-native';
import { BMapColors } from '../../constants/BMapTheme';
import { Spacing, Typography } from '../../constants/tokens';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { Header } from './Header';
import { Skeleton } from './Skeleton';
import { Avatar } from './Avatar';
import { Divider } from './Divider';
import { BottomSheet } from './BottomSheet';

export const DesignSystemShowcase: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="UI/UX Production Base"
        subtitle="Design System & Atomic Primitives"
        showBack={false}
      />

      {/* 1. BUTTONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Tactile Buttons</Text>
        <Text style={styles.sectionDescription}>
          Spring physics scale feedback, loading spinner states, variants & icon slots.
        </Text>
        <View style={styles.row}>
          <Button
            title="Primary"
            variant="primary"
            size="md"
            leftIcon={<Navigation size={18} color="#FFFFFF" />}
            onPress={() => Alert.alert('Button', 'Primary pressed')}
          />
          <Button
            title="Secondary"
            variant="secondary"
            size="md"
            onPress={() => Alert.alert('Button', 'Secondary pressed')}
          />
        </View>
        <View style={styles.row}>
          <Button
            title="Outlined"
            variant="outline"
            size="sm"
            onPress={() => Alert.alert('Button', 'Outline pressed')}
          />
          <Button
            title="Ghost"
            variant="ghost"
            size="sm"
            onPress={() => Alert.alert('Button', 'Ghost pressed')}
          />
          <Button
            title="Destructive"
            variant="danger"
            size="sm"
            onPress={() => Alert.alert('Button', 'Danger pressed')}
          />
        </View>
        <Button
          title={isLoading ? 'Loading...' : 'Toggle Loading State'}
          variant="primary"
          loading={isLoading}
          fullWidth
          onPress={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 2000);
          }}
        />
      </View>

      <Divider label="Inputs & Forms" />

      {/* 2. INPUTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Form & Search Inputs</Text>
        <Input
          label="Search Destination"
          placeholder="e.g. Bandra Kurla Complex..."
          value={inputText}
          onChangeText={setInputText}
          leftIcon={<Search size={18} color={BMapColors.primaryContainer} />}
          allowClear
        />

        <Input
          label="Secure Passcode"
          placeholder="Enter 6-digit PIN"
          secureTextEntry
          leftIcon={<Lock size={18} color={BMapColors.outline} />}
          helperText="Used for fleet & booking authentication"
        />

        <Input
          label="Validation Feedback"
          placeholder="Type 'error' to trigger error style"
          value={inputError}
          onChangeText={(val) => {
            setInputError(val);
          }}
          error={inputError === 'error' ? 'Invalid entry provided' : undefined}
          helperText={inputError !== 'error' ? "Type 'error' to test validation" : undefined}
        />
      </View>

      <Divider label="Cards & Surfaces" />

      {/* 3. CARDS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Surface Cards</Text>
        <Card variant="elevated" onPress={() => Alert.alert('Card', 'Elevated card pressed')}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Elevated Feature Card</Text>
              <Text style={styles.cardSubtitle}>Smooth soft shadows on iOS & Android</Text>
            </View>
            <Badge label="LIVE" variant="live" showDot size="sm" />
          </View>
          <Text style={styles.cardBody}>
            Interactive card container supporting multiple padding and variant presets.
          </Text>
        </Card>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Card variant="outlined">
              <Text style={styles.cardTitleSmall}>Outlined</Text>
              <Text style={styles.cardSubtitle}>Crisp 1px border</Text>
            </Card>
          </View>
          <View style={{ flex: 1 }}>
            <Card variant="flat">
              <Text style={styles.cardTitleSmall}>Flat Container</Text>
              <Text style={styles.cardSubtitle}>Subtle tint</Text>
            </Card>
          </View>
        </View>
      </View>

      <Divider label="Badges & Indicators" />

      {/* 4. BADGES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Status Badges & Traffic Pills</Text>
        <View style={styles.wrapRow}>
          <Badge label="Traffic Clear" variant="success" showDot />
          <Badge label="Moderate (8 min delay)" variant="warning" showDot />
          <Badge label="Road Blocked" variant="error" showDot />
          <Badge label="Live Telemetry" variant="live" showDot />
          <Badge label="Fast Charger" variant="primary" leftIcon={<Zap size={12} color={BMapColors.primary} />} />
          <Badge label="Standard" variant="neutral" />
        </View>
      </View>

      <Divider label="Avatars & Icon Buttons" />

      {/* 5. AVATARS & ICON BUTTONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Avatars & Action Buttons</Text>
        <View style={styles.row}>
          <Avatar name="Rahul Sharma" size="lg" status="online" />
          <Avatar name="Fleet Driver 04" size="md" status="busy" />
          <Avatar name="B Map" size="sm" status="offline" />
        </View>

        <View style={styles.row}>
          <IconButton
            icon={<Heart size={20} color={BMapColors.error} />}
            variant="default"
            onPress={() => Alert.alert('Action', 'Liked')}
          />
          <IconButton
            icon={<Share2 size={20} color={BMapColors.primaryContainer} />}
            variant="tinted"
            onPress={() => Alert.alert('Action', 'Shared')}
          />
          <IconButton
            icon={<MapPin size={20} color="#FFFFFF" />}
            variant="filled"
            onPress={() => Alert.alert('Action', 'Map Pin')}
          />
          <IconButton
            icon={<Sparkles size={20} color={BMapColors.primary} />}
            variant="glass"
            onPress={() => Alert.alert('Action', 'AI Assist')}
          />
        </View>
      </View>

      <Divider label="Skeleton Loaders" />

      {/* 6. SKELETON LOADERS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Shimmer Skeleton Placeholders</Text>
        <Card variant="outlined">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Skeleton shape="circle" width={44} height={44} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Skeleton shape="text" width="60%" height={14} style={{ marginBottom: 6 }} />
              <Skeleton shape="text" width="40%" height={10} />
            </View>
          </View>
          <Skeleton shape="rect" width="100%" height={70} />
        </Card>
      </View>

      <Divider label="Bottom Sheet Modal" />

      {/* 7. BOTTOM SHEET */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Production Bottom Sheet</Text>
        <Button
          title="Open Action Drawer Sheet"
          variant="secondary"
          onPress={() => setSheetVisible(true)}
          fullWidth
        />
      </View>

      {/* BOTTOM SHEET INSTANCE */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Quick Route Options"
        subtitle="Select preferred travel mode">
        <View style={{ gap: Spacing.md, paddingBottom: Spacing.xl }}>
          <Card variant="flat" onPress={() => setSheetVisible(false)}>
            <Text style={styles.cardTitle}>Fastest Route via Expressway</Text>
            <Text style={styles.cardSubtitle}>24 min • 18.2 km • No tolls</Text>
          </Card>
          <Card variant="outlined" onPress={() => setSheetVisible(false)}>
            <Text style={styles.cardTitle}>Scenic Coastal Highway</Text>
            <Text style={styles.cardSubtitle}>31 min • 21.4 km • ₹45 toll</Text>
          </Card>
          <Button
            title="Confirm Navigation"
            variant="primary"
            fullWidth
            onPress={() => setSheetVisible(false)}
          />
        </View>
      </BottomSheet>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BMapColors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['5xl'],
  },
  section: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: BMapColors.onBackground,
  },
  sectionDescription: {
    ...Typography.bodyMedium,
    color: BMapColors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: BMapColors.onBackground,
  },
  cardTitleSmall: {
    ...Typography.titleSmall,
    color: BMapColors.onBackground,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    color: BMapColors.onSurfaceVariant,
    marginTop: 2,
  },
  cardBody: {
    ...Typography.bodyMedium,
    color: BMapColors.onSurfaceVariant,
  },
});

export default DesignSystemShowcase;
