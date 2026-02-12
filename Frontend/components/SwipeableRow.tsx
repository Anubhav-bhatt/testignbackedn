import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

interface SwipeableRowProps {
    children: React.ReactNode;
    onDelete?: () => void;
    onEdit?: () => void;
}

export default function SwipeableRow({ children, onDelete, onEdit }: SwipeableRowProps) {
    const swipeableRow = useRef<Swipeable>(null);

    const close = () => {
        swipeableRow.current?.close();
    };

    const renderRightAction = (
        text: string,
        color: string,
        x: number,
        progress: Animated.AnimatedInterpolation<number>,
        icon: keyof typeof Ionicons.glyphMap,
        onPress?: () => void
    ) => {
        const trans = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [x, 0],
        });

        const pressHandler = () => {
            close();
            onPress?.();
        };

        return (
            <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
                <RectButton
                    style={[styles.rightAction, { backgroundColor: color }]}
                    onPress={pressHandler}>
                    <Ionicons name={icon} size={24} color="#fff" />
                    <Text style={styles.actionText}>{text}</Text>
                </RectButton>
            </Animated.View>
        );
    };

    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        _dragAnimatedValue: Animated.AnimatedInterpolation<number>
    ) => (
        <View style={{ width: 140, flexDirection: 'row' }}>
            {renderRightAction('Edit', '#3b82f6', 140, progress, 'pencil', onEdit)}
            {renderRightAction('Delete', '#ef4444', 70, progress, 'trash', onDelete)}
        </View>
    );

    return (
        <Swipeable
            ref={swipeableRow}
            friction={2}
            enableTrackpadTwoFingerGesture
            rightThreshold={40}
            renderRightActions={renderRightActions}>
            {children}
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    rightAction: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        backgroundColor: 'transparent',
        padding: 4,
        fontWeight: '600'
    },
});
