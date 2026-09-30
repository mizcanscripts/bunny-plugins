import { ReactNative as RN, React } from "@metro/common";
import { Forms } from "@components/Forms";
import { storage } from "@lib/storage";

const settings = storage.createProxy("BotHost", {
    enabled: false,
    status: "online",
    activityType: "Playing",
    activityText: ""
});

const statuses = [
    "online",
    "idle",
    "dnd",
    "invisible"
];

const activityTypes = [
    "Playing",
    "Streaming",
    "Listening",
    "Watching",
    "Competing"
];

function Settings() {
    const [, refresh] = React.useReducer(value => value + 1, 0);

    const update = (callback: () => void) => {
        callback();
        refresh();
    };

    return (
        <RN.ScrollView>
            <Forms.FormSection title="Bot Host">
                <Forms.FormSwitch
                    label="Enabled"
                    subLabel={
                        settings.enabled
                            ? "Running"
                            : "Stopped"
                    }
                    value={settings.enabled}
                    onValueChange={(value: boolean) =>
                        update(() => {
                            settings.enabled = value;
                        })
                    }
                />

                <Forms.FormInput
                    label="Activity"
                    value={settings.activityText}
                    placeholder="Watching the multiverse"
                    onChange={(value: string) =>
                        update(() => {
                            settings.activityText = value;
                        })
                    }
                />

                <Forms.FormRow
                    label="Status"
                    subLabel={settings.status}
                    trailing={Forms.FormRow.Arrow}
                    onPress={() =>
                        update(() => {
                            const current =
                                statuses.indexOf(settings.status);

                            settings.status =
                                statuses[
                                    (current + 1) %
                                    statuses.length
                                ];
                        })
                    }
                />

                <Forms.FormRow
                    label="Activity Type"
                    subLabel={settings.activityType}
                    trailing={Forms.FormRow.Arrow}
                    onPress={() =>
                        update(() => {
                            const current =
                                activityTypes.indexOf(
                                    settings.activityType
                                );

                            settings.activityType =
                                activityTypes[
                                    (current + 1) %
                                    activityTypes.length
                                ];
                        })
                    }
                />
            </Forms.FormSection>

            <Forms.FormSection title="Preview">
                <Forms.FormRow
                    label={
                        settings.enabled
                            ? "Bot Host Enabled"
                            : "Bot Host Disabled"
                    }
                    subLabel={
                        settings.activityText ||
                        "No activity configured"
                    }
                />
            </Forms.FormSection>
        </RN.ScrollView>
    );
}

export default definePlugin({
    name: "Bot Host",
    description:
        "Discord bot status and activity controller.",
    authors: [
        {
            id: "Mizumaruu",
            name: "Mizumaruu"
        }
    ],

    onLoad() {},

    onUnload() {},

    settings: Settings
});
