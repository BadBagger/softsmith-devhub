package com.softsmith.devhub;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int BG = Color.rgb(247, 244, 237);
    private static final int INK = Color.rgb(32, 37, 42);
    private static final int MUTED = Color.rgb(93, 101, 107);
    private static final int TEAL = Color.rgb(34, 108, 111);
    private static final int GREEN = Color.rgb(45, 125, 82);
    private static final int AMBER = Color.rgb(165, 103, 20);
    private static final int PANEL = Color.WHITE;

    private LinearLayout root;

    private final AppInfo[] apps = new AppInfo[] {
        new AppInfo("Workday Planner", "workday-planner", "BadBagger", "workday-planner", "com.example.workdayplanner", "internal", "Daily planning and work rhythm."),
        new AppInfo("Renewal Radar", "renewal-radar", "BadBagger", "renewal-radar", "com.renewalradar.app", "internal", "Local-first renewal tracking."),
        new AppInfo("Fridge Finish", "fridge-finish", "BadBagger", "fridge-finish", "com.fridgefinish.app", "internal", "Food tracking and finish-by reminders."),
        new AppInfo("Kid Chaos Calendar", "kid-chaos-calendar", "BadBagger", "kid-chaos-calendar", "com.softsmith.kidchaoscalendar", "internal", "Family calendar coordination."),
        new AppInfo("IconSmith Studio Mobile", "iconsmith-studio-mobile", "BadBagger", "iconsmith-studio-mobile", "com.softsmith.iconsmithstudio", "internal", "Mobile icon studio tools."),
        new AppInfo("FolderSmith Mobile", "foldersmith-mobile", "BadBagger", "foldersmith-mobile", "com.foldersmith.mobile", "internal", "GitHub repo exists; first mobile source/release still needs to be added.")
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTitle("SoftSmith DevHub");
        setContentView(buildContent());
    }

    private View buildContent() {
        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(BG);

        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18), dp(18), dp(18), dp(28));
        scroll.addView(root);

        TextView title = text("SoftSmith DevHub", 30, INK, Typeface.BOLD);
        root.addView(title);

        TextView subtitle = text("Android app updater and repo dashboard", 15, MUTED, Typeface.NORMAL);
        subtitle.setPadding(0, dp(4), 0, dp(16));
        root.addView(subtitle);

        root.addView(panel("Updater behavior",
            "This app checks whether each SoftSmith Android app is installed, compares the installed version to the latest GitHub release tag, and opens the release page when an update is available.\n\n" +
            "Android blocks silent app updates for normal apps, so updates still need your tap and install confirmation."));

        Button checkAll = button("Check all app updates");
        checkAll.setOnClickListener(v -> refreshAppCards());
        root.addView(checkAll);

        TextView appsLabel = text("Registered apps", 20, INK, Typeface.BOLD);
        appsLabel.setPadding(0, dp(16), 0, dp(8));
        root.addView(appsLabel);

        refreshAppCards();

        root.addView(panel("Private repo note",
            "GitHub release checks work when the release endpoint is reachable from this phone. Private repos may need public release assets, Play Store internal testing, or a future token-based setup. Do not hard-code GitHub tokens into this app."));

        return scroll;
    }

    private void refreshAppCards() {
        while (root.getChildCount() > 4) {
            root.removeViewAt(4);
        }

        TextView appsLabel = text("Registered apps", 20, INK, Typeface.BOLD);
        appsLabel.setPadding(0, dp(16), 0, dp(8));
        root.addView(appsLabel);

        for (AppInfo app : apps) {
            AppCard card = appCard(app);
            root.addView(card.view);
            checkReleaseAsync(app, card);
        }

        root.addView(panel("Private repo note",
            "GitHub release checks work when the release endpoint is reachable from this phone. Private repos may need public release assets, Play Store internal testing, or a future token-based setup. Do not hard-code GitHub tokens into this app."));
    }

    private AppCard appCard(AppInfo app) {
        LinearLayout card = basePanel();

        TextView name = text(app.name, 18, INK, Typeface.BOLD);
        card.addView(name);

        TextView id = text(app.id, 13, TEAL, Typeface.BOLD);
        id.setPadding(0, dp(2), 0, dp(8));
        card.addView(id);

        InstalledInfo installed = getInstalledInfo(app.packageName);
        String installedLine = installed.installed
            ? "Installed: " + installed.versionName + " (" + installed.versionCode + ")"
            : "Installed: no";

        TextView installedText = text(installedLine, 14, installed.installed ? GREEN : AMBER, Typeface.BOLD);
        card.addView(installedText);

        TextView releaseText = text("GitHub: checking latest release...", 14, MUTED, Typeface.NORMAL);
        releaseText.setPadding(0, dp(4), 0, dp(8));
        card.addView(releaseText);

        card.addView(text("Package: " + app.packageName, 14, MUTED, Typeface.NORMAL));
        card.addView(text("Default track: " + app.track, 14, MUTED, Typeface.NORMAL));

        LinearLayout buttons = new LinearLayout(this);
        buttons.setOrientation(LinearLayout.HORIZONTAL);
        buttons.setPadding(0, dp(10), 0, 0);

        Button releases = button("Open releases");
        releases.setOnClickListener(v -> openUrl(app.releasePageUrl()));
        buttons.addView(releases);

        Button store = button("Play Store");
        store.setOnClickListener(v -> openUrl("market://details?id=" + app.packageName));
        buttons.addView(store);

        card.addView(buttons);

        TextView note = text(app.note, 14, INK, Typeface.NORMAL);
        note.setPadding(0, dp(8), 0, 0);
        card.addView(note);

        return new AppCard(card, releaseText, installed);
    }

    private void checkReleaseAsync(AppInfo app, AppCard card) {
        new Thread(() -> {
            ReleaseInfo release = fetchLatestRelease(app);
            runOnUiThread(() -> updateReleaseStatus(app, card, release));
        }).start();
    }

    private void updateReleaseStatus(AppInfo app, AppCard card, ReleaseInfo release) {
        if (!release.available) {
            card.releaseText.setText("GitHub: " + release.message);
            card.releaseText.setTextColor(AMBER);
            return;
        }

        if (!card.installed.installed) {
            card.releaseText.setText("Latest release: " + release.tag + ". Tap Open releases to install.");
            card.releaseText.setTextColor(TEAL);
            return;
        }

        int comparison = compareVersions(normalizeVersion(card.installed.versionName), normalizeVersion(release.tag));
        if (comparison < 0) {
            card.releaseText.setText("Update available: " + card.installed.versionName + " -> " + release.tag);
            card.releaseText.setTextColor(AMBER);
        }
        else {
            card.releaseText.setText("Up to date: " + card.installed.versionName + " matches latest release " + release.tag);
            card.releaseText.setTextColor(GREEN);
        }
    }

    private ReleaseInfo fetchLatestRelease(AppInfo app) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(app.latestReleaseApiUrl());
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            connection.setRequestProperty("Accept", "application/vnd.github+json");
            connection.setRequestProperty("User-Agent", "SoftSmith-DevHub-Mobile");

            int code = connection.getResponseCode();
            if (code == 404) {
                return fetchRepoExists(app);
            }
            if (code < 200 || code > 299) {
                return ReleaseInfo.unavailable("GitHub returned " + code);
            }

            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
            reader.close();

            JSONObject json = new JSONObject(body.toString());
            String tag = json.optString("tag_name", "");
            if (tag.trim().isEmpty()) {
                return ReleaseInfo.unavailable("latest release has no tag");
            }

            return ReleaseInfo.available(tag);
        }
        catch (Exception ex) {
            return ReleaseInfo.unavailable("check failed: " + ex.getClass().getSimpleName());
        }
        finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private ReleaseInfo fetchRepoExists(AppInfo app) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(app.repoApiUrl());
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            connection.setRequestProperty("Accept", "application/vnd.github+json");
            connection.setRequestProperty("User-Agent", "SoftSmith-DevHub-Mobile");

            int code = connection.getResponseCode();
            if (code == 404) {
                return ReleaseInfo.unavailable("repo not created yet");
            }
            if (code >= 200 && code <= 299) {
                return ReleaseInfo.unavailable("repo exists, no release published yet");
            }
            return ReleaseInfo.unavailable("repo check returned " + code);
        }
        catch (Exception ex) {
            return ReleaseInfo.unavailable("repo check failed: " + ex.getClass().getSimpleName());
        }
        finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private InstalledInfo getInstalledInfo(String packageName) {
        try {
            PackageInfo info = getPackageManager().getPackageInfo(packageName, 0);
            long code;
            if (android.os.Build.VERSION.SDK_INT >= 28) {
                code = info.getLongVersionCode();
            }
            else {
                code = info.versionCode;
            }
            return new InstalledInfo(true, info.versionName == null ? "0.0.0" : info.versionName, code);
        }
        catch (PackageManager.NameNotFoundException ex) {
            return new InstalledInfo(false, "", 0);
        }
    }

    private void openUrl(String url) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
        }
        catch (Exception ignored) {
            Intent fallback = new Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/SoftSmith"));
            startActivity(fallback);
        }
    }

    private int compareVersions(String current, String latest) {
        String[] currentParts = current.split("\\.");
        String[] latestParts = latest.split("\\.");
        int count = Math.max(currentParts.length, latestParts.length);

        for (int i = 0; i < count; i++) {
            int c = i < currentParts.length ? parseVersionPart(currentParts[i]) : 0;
            int l = i < latestParts.length ? parseVersionPart(latestParts[i]) : 0;
            if (c != l) {
                return Integer.compare(c, l);
            }
        }

        return 0;
    }

    private int parseVersionPart(String part) {
        String cleaned = part.replaceAll("[^0-9]", "");
        if (cleaned.isEmpty()) {
            return 0;
        }
        return Integer.parseInt(cleaned);
    }

    private String normalizeVersion(String value) {
        String cleaned = value.toLowerCase(Locale.US).trim();
        if (cleaned.startsWith("v")) {
            cleaned = cleaned.substring(1);
        }
        return cleaned;
    }

    private View panel(String heading, String body) {
        LinearLayout panel = basePanel();
        TextView head = text(heading, 18, INK, Typeface.BOLD);
        panel.addView(head);

        TextView content = text(body, 14, INK, Typeface.NORMAL);
        content.setLineSpacing(dp(2), 1.0f);
        content.setPadding(0, dp(8), 0, 0);
        panel.addView(content);
        return panel;
    }

    private LinearLayout basePanel() {
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setBackgroundColor(PANEL);
        panel.setPadding(dp(16), dp(14), dp(16), dp(14));

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, dp(12));
        panel.setLayoutParams(params);
        panel.setGravity(Gravity.CENTER_VERTICAL);
        return panel;
    }

    private Button button(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextColor(Color.WHITE);
        button.setTextSize(13);
        button.setAllCaps(false);
        button.setBackgroundColor(TEAL);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, dp(8), dp(4));
        button.setLayoutParams(params);
        return button;
    }

    private TextView text(String value, int sp, int color, int style) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(sp);
        view.setTextColor(color);
        view.setTypeface(Typeface.DEFAULT, style);
        return view;
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }

    private static class AppInfo {
        final String name;
        final String id;
        final String owner;
        final String repo;
        final String packageName;
        final String track;
        final String note;

        AppInfo(String name, String id, String owner, String repo, String packageName, String track, String note) {
            this.name = name;
            this.id = id;
            this.owner = owner;
            this.repo = repo;
            this.packageName = packageName;
            this.track = track;
            this.note = note;
        }

        String latestReleaseApiUrl() {
            return "https://api.github.com/repos/" + owner + "/" + repo + "/releases/latest";
        }

        String repoApiUrl() {
            return "https://api.github.com/repos/" + owner + "/" + repo;
        }

        String releasePageUrl() {
            return "https://github.com/" + owner + "/" + repo + "/releases";
        }
    }

    private static class InstalledInfo {
        final boolean installed;
        final String versionName;
        final long versionCode;

        InstalledInfo(boolean installed, String versionName, long versionCode) {
            this.installed = installed;
            this.versionName = versionName;
            this.versionCode = versionCode;
        }
    }

    private static class ReleaseInfo {
        final boolean available;
        final String tag;
        final String message;

        ReleaseInfo(boolean available, String tag, String message) {
            this.available = available;
            this.tag = tag;
            this.message = message;
        }

        static ReleaseInfo available(String tag) {
            return new ReleaseInfo(true, tag, "");
        }

        static ReleaseInfo unavailable(String message) {
            return new ReleaseInfo(false, "", message);
        }
    }

    private static class AppCard {
        final LinearLayout view;
        final TextView releaseText;
        final InstalledInfo installed;

        AppCard(LinearLayout view, TextView releaseText, InstalledInfo installed) {
            this.view = view;
            this.releaseText = releaseText;
            this.installed = installed;
        }
    }
}
