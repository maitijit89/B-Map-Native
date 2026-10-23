import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react-native';
import { BMapColors } from '../constants';

interface Props {
  children: ReactNode;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by B-Map ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <ShieldAlert size={48} color={BMapColors.primary} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              {this.props.fallbackText || 'B-Map encountered an unexpected issue. You can try reloading the view.'}
            </Text>

            <TouchableOpacity style={styles.retryButton} onPress={this.handleReset} activeOpacity={0.8}>
              <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.retryText}>Reload Application View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsToggle}
              onPress={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
            >
              <AlertCircle size={14} color="#64748B" style={{ marginRight: 4 }} />
              <Text style={styles.detailsToggleText}>
                {this.state.showDetails ? 'Hide technical logs' : 'View error diagnostics'}
              </Text>
            </TouchableOpacity>

            {this.state.showDetails && (
              <ScrollView style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.stackText}>{this.state.errorInfo.componentStack}</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BMapColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  detailsToggleText: {
    fontSize: 13,
    color: '#64748B',
  },
  errorBox: {
    width: '100%',
    maxHeight: 180,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  stackText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
