export interface SmartServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  badge?: string;
  category: 'transit' | 'mobility' | 'safety' | 'city' | 'enterprise';
}
