import { useEffect, useRef, useState } from 'react';
import { settingsStore } from '@/lib/store/settings-store';
import { fetchSourcesFromUrl, mergeSources } from '@/lib/utils/source-import-utils';
import type { SourceSubscription } from '@/lib/types';

// Minimum time between syncs for the same subscription (5 minutes)
const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
// Delay before initial sync to ensure settings are fully loaded
const INITIAL_SYNC_DELAY_MS = 1000;

export function useSubscriptionSync() {
    const [subscriptions, setSubscriptions] = useState<SourceSubscription[]>([]);
    const isSyncingRef = useRef(false);
    // Track synced urls in this lifecycle to prevent infinite loop re-renders
    const syncedUrlsRef = useRef<Set<string>>(new Set());

    // 1. Subscribe to settingsStore changes to keep local state in sync
    useEffect(() => {
        setSubscriptions(settingsStore.getSettings().subscriptions);
        
        const unsubscribe = settingsStore.subscribe(() => {
            setSubscriptions(settingsStore.getSettings().subscriptions);
        });
        
        return unsubscribe;
    }, []);

    // 2. Perform sync when subscriptions change
    useEffect(() => {
        const activeSubscriptions = subscriptions.filter((s: SourceSubscription) => s.autoRefresh !== false);

        if (activeSubscriptions.length === 0) {
            return;
        }

        // Prevent concurrent syncs
        if (isSyncingRef.current) return;

        const sync = async () => {
            if (isSyncingRef.current) return;
            isSyncingRef.current = true;

            try {
                // Read fresh settings copy
                const settings = settingsStore.getSettings();
                let anyChanged = false;
                let currentSources = [...settings.sources];
                let currentPremiumSources = [...settings.premiumSources];
                let updatedSubscriptions = [...settings.subscriptions];
                const now = Date.now();

                // Filter out subscriptions that were synced recently OR already synced in this session
                const subsToSync = activeSubscriptions.filter(
                    (sub: SourceSubscription) => {
                        if (syncedUrlsRef.current.has(sub.url)) return false; // Skip if already synced this session
                        
                        if (sub.url.startsWith('/')) return true; // Local path bypasses cooldown
                        return !(sub.lastUpdated && now - sub.lastUpdated < SYNC_COOLDOWN_MS);
                    }
                );

                if (subsToSync.length === 0) {
                    return;
                }

                // Mark them as synced immediately to prevent race conditions
                subsToSync.forEach(sub => syncedUrlsRef.current.add(sub.url));

                // Fetch all subscriptions in parallel
                const results = await Promise.allSettled(
                    subsToSync.map((sub: SourceSubscription) => fetchSourcesFromUrl(sub.url))
                );

                // Process results
                results.forEach((result, index) => {
                    const sub = subsToSync[index];
                    if (result.status === 'fulfilled') {
                        const fetchResult = result.value;

                        if (fetchResult.normalSources.length > 0) {
                            currentSources = mergeSources(currentSources, fetchResult.normalSources);
                            anyChanged = true;
                        }

                        if (fetchResult.premiumSources.length > 0) {
                            currentPremiumSources = mergeSources(currentPremiumSources, fetchResult.premiumSources);
                            anyChanged = true;
                        }

                        // Update timestamp
                        const subIdx = updatedSubscriptions.findIndex(s => s.id === sub.id);
                        if (subIdx !== -1) {
                            updatedSubscriptions[subIdx] = {
                                ...updatedSubscriptions[subIdx],
                                lastUpdated: now
                            };
                            anyChanged = true;
                        }
                    } else {
                        console.error(`Failed to sync subscription: ${sub.name}`, result.reason);
                        // If failed, remove from syncedUrls so it might retry later
                        syncedUrlsRef.current.delete(sub.url);
                    }
                });

                if (anyChanged) {
                    settingsStore.saveSettings({
                        ...settings,
                        sources: currentSources,
                        premiumSources: currentPremiumSources,
                        subscriptions: updatedSubscriptions
                    });
                }
            } finally {
                isSyncingRef.current = false;
            }
        };

        // Small delay to ensure state stability
        const timeoutId = setTimeout(sync, INITIAL_SYNC_DELAY_MS);
        return () => clearTimeout(timeoutId);
    }, [subscriptions]);
}
