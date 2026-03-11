import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAIInsights } from '../api';

interface Insights {
    case_summary?: string;
    tactical_insights: any[];
    evidentiary_risks: any[];
    precedents_analysis: string | string[];
    probability_assessment: string;
    error?: string;
    raw?: string;
}

interface AIAssistantCardProps {
    caseId: string;
}

const AIAssistantCard: React.FC<AIAssistantCardProps> = ({ caseId }) => {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInsights();
    }, [caseId]);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAIInsights(caseId);
            setInsights(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load AI insights. Check your connection or API key.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                    <Text style={styles.title}>Legal AI Analysis</Text>
                </View>
                <ActivityIndicator size="small" color="#8B5CF6" style={{ marginVertical: 20 }} />
                <Text style={styles.loadingText}>Analyzing case documents and precedents...</Text>
            </View>
        );
    }

    if (error || insights?.error) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text style={styles.title}>AI Insight Error</Text>
                </View>
                <Text style={styles.errorText}>{error || insights?.error}</Text>
                <TouchableOpacity onPress={fetchInsights} style={styles.retryButton}>
                    <Text style={styles.retryText}>Retry Analysis</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                    <Text style={styles.title}>AI Legal Insights</Text>
                </View>
                <TouchableOpacity onPress={fetchInsights}>
                    <Ionicons name="refresh" size={18} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {insights?.case_summary && (
                <ScrollView style={styles.scrollContainer} nestedScrollEnabled={true}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Case Summary</Text>
                        <Text style={styles.summaryText}>{insights.case_summary}</Text>
                    </View>
                </ScrollView>
            )}

            <ScrollView style={styles.scrollContainer} nestedScrollEnabled={true}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Insights</Text>
                    {insights?.tactical_insights?.map((item: any, index: number) => {
                        const textContent = typeof item === 'string'
                            ? item
                            : `${item?.priority ? `[${item.priority}] ` : ''}${item?.action || item?.insight || JSON.stringify(item)}`;
                        return (
                            <View key={index} style={styles.bulletItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text style={styles.bulletText}>{textContent}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Potential Risks</Text>
                    {insights?.evidentiary_risks?.map((item: any, index: number) => {
                        const textContent = typeof item === 'string'
                            ? item
                            : `${item?.severity || item?.priority ? `[${item.severity || item.priority}] ` : ''}${item?.risk || item?.issue || JSON.stringify(item)}`;
                        return (
                            <View key={index} style={styles.bulletItem}>
                                <Ionicons name="warning" size={16} color="#F59E0B" />
                                <Text style={styles.bulletText}>{textContent}</Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.predictionBox}>
                    <Text style={styles.predictionTitle}>AI Prediction</Text>
                    <Text style={styles.predictionText}>{insights?.probability_assessment}</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginVertical: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
            }
        }),
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    scrollContainer: {
        maxHeight: 250,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginLeft: 8,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    bulletText: {
        fontSize: 15,
        color: '#374151',
        marginLeft: 8,
        flex: 1,
        lineHeight: 20,
    },
    predictionBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
    },
    predictionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8B5CF6',
        marginBottom: 4,
    },
    predictionText: {
        fontSize: 14,
        color: '#1F2937',
        fontStyle: 'italic',
    },
    loadingText: {
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
    },
    errorText: {
        color: '#EF4444',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    retryText: {
        color: '#4B5563',
        fontWeight: '600',
    }
});

export default AIAssistantCard;
