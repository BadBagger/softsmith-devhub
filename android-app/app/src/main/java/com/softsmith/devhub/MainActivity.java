package com.softsmith.devhub;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int BG = Color.rgb(248, 246, 241);
    private static final int INK = Color.rgb(31, 35, 40);
    private static final int MUTED = Color.rgb(96, 104, 112);
    private static final int TEAL = Color.rgb(23, 112, 116);
    private static final int GREEN = Color.rgb(34, 128, 77);
    private static final int AMBER = Color.rgb(170, 105, 18);
    private static final int PANEL = Color.WHITE;

    private LinearLayout appList;

    private final AppInfo[] apps = new AppInfo[] {
        new AppInfo("SoftSmith Store", "softsmith-devhub", "BadBagger", "softsmith-devhub", "com.softsmith.devhub", "App updater", R.drawable.devhub_logo),
        new AppInfo("Workday Planner", "workday-planner", "BadBagger", "workday-planner", "com.example.workdayplanner", "Daily planning", R.drawable.workday_logo),
        new AppInfo("Renewal Radar", "renewal-radar", "BadBagger", "renewal-radar", "com.renewalradar.app", "Renewal tracking", R.drawable.renewal_logo),
        new AppInfo("Fridge Finish", "fridge-finish", "BadBagger", "fridge-finish", "com.fridgefinish.app", "Food reminders", R.drawable.fridge_logo),
        new AppInfo("Kid Chaos Calendar", "kid-chaos-calendar", "BadBagger", "kid-chaos-calendar", "com.softsmith.kidchaoscalendar", "Family calendar", R.drawable.kidchaos_logo),
        new AppInfo("IconSmith Studio Mobile", "iconsmith-studio-mobile", "BadBagger", "iconsmith-studio-mobile", "com.softsmith.iconsmithstudio", "Icon tools", R.drawable.iconsmith_logo),
        new AppInfo("FolderSmith Mobile", "foldersmith-mobile", "BadBagger", "foldersmith-mobile", "com.foldersmith.mobile", "File workflow helper", R.drawable.foldersmith_logo)
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTitle("SoftSmith Store");
        setContentView(buildContent());
    }

    private View buildContent() {
        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(BG);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18), dp(18), dp(18), dp(28));
        scroll.addView(root);

        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(0, 0, 0, dp(18));
        root.addView(top);

        ImageView hubIcon = new ImageView(this);
        hubIcon.setImageResource(R.drawable.devhub_logo);
        top.addView(hubIcon, new LinearLayout.LayoutParams(dp(58), dp(58)));

        LinearLayout titleBlock = new LinearLayout(this);
        titleBlock.setOrientation(LinearLayout.VERTICAL);
        titleBlock.setPadding(dp(12), 0, 0, 0);
        top.addView(titleBlock, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));

        titleBlock.addView(text("SoftSmith Store", 30, INK, Typeface.BOLD));
        titleBlock.addView(text("Updates for your apps", 15, MUTED, Typeface.NORMAL));

        LinearLayout controls = new LinearLayout(this);
        controls.setOrientation(LinearLayout.HORIZONTAL);
        controls.setPadding(0, 0, 0, dp(12));
        root.addView(controls);

        Button refresh = button("Check updates", TEAL);
        refresh.setOnClickListener(v -> refreshAppCards());
        controls.addView(refresh);

        TextView label = text("Apps", 21, INK, Typeface.BOLD);
        label.setPadding(0, dp(8), 0, dp(8));
        root.addView(label);

        appList = new LinearLayout(this);
        appList.setOrientation(LinearLayout.VERTICAL);
        root.addView(appList);

        root.addView(panel("Install help",
            "If Android says a package conflicts with an existing package, tap Repair on that app, uninstall the old copy, then return here and tap Install again."));

        refreshAppCards();
        return scroll;
    }

    private void refreshAppCards() {
        appList.removeAllViews();
        for (AppInfo app : apps) {
            AppCard card = appCard(app);
            appList.addView(card.view);
            checkReleaseAsync(app, card);
        }
    }

    private AppCard appCard(AppInfo app) {
        LinearLayout card = basePanel();

        LinearLayout mainRow = new LinearLayout(this);
        mainRow.setOrientation(LinearLayout.HORIZONTAL);
        mainRow.setGravity(Gravity.CENTER_VERTICAL);
        card.addView(mainRow);

        ImageView icon = new ImageView(this);
        icon.setImageResource(app.iconRes);
        LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(dp(72), dp(72));
        iconParams.setMargins(0, 0, dp(14), 0);
        mainRow.addView(icon, iconParams);

        LinearLayout info = new LinearLayout(this);
        info.setOrientation(LinearLayout.VERTICAL);
        mainRow.addView(info, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));

        info.addView(text(app.name, 18, INK, Typeface.BOLD));
        TextView type = text(app.tagline, 13, MUTED, Typeface.NORMAL);
        type.setPadding(0, dp(2), 0, dp(4));
        info.addView(type);

        InstalledInfo installed = getInstalledInfo(app.packageName);
        TextView installedText = text(
            installed.installed ? "Installed " + installed.versionName : "Not installed",
            14,
            installed.installed ? GREEN : AMBER,
            Typeface.BOLD
        );
        info.addView(installedText);

        TextView status = text("Checking latest release...", 13, MUTED, Typeface.NORMAL);
        status.setPadding(0, dp(4), 0, 0);
        card.addView(status);

        LinearLayout buttons = new LinearLayout(this);
        buttons.setOrientation(LinearLayout.HORIZONTAL);
        buttons.setPadding(0, dp(12), 0, 0);
        card.addView(buttons);

        Button primary = button(installed.installed ? "Checking..." : "Install", TEAL);
        primary.setEnabled(false);
        buttons.addView(primary);

        Button open = button("Open", Color.rgb(70, 78, 86));
        open.setVisibility(installed.installed ? View.VISIBLE : View.GONE);
        open.setOnClickListener(v -> openInstalledApp(app));
        buttons.addView(open);

        Button repair = button("Repair", AMBER);
        repair.setVisibility(installed.installed ? View.VISIBLE : View.GONE);
        repair.setOnClickListener(v -> openUninstall(app, status));
        buttons.addView(repair);

        return new AppCard(card, status, primary, installed);
    }

    private void checkReleaseAsync(AppInfo app, AppCard card) {
        new Thread(() -> {
            ReleaseInfo release = fetchLatestRelease(app);
            runOnUiThread(() -> updateReleaseStatus(app, card, release));
        }).start();
    }

    private void updateReleaseStatus(AppInfo app, AppCard card, ReleaseInfo release) {
        if (!release.available) {
            card.statusText.setText(release.message);
            card.statusText.setTextColor(AMBER);
            card.primaryButton.setVisibility(View.GONE);
            return;
        }

        if (release.assetUrl.trim().isEmpty()) {
            card.statusText.setText("Latest " + release.tag + ", but no APK is attached.");
            card.statusText.setTextColor(AMBER);
            card.primaryButton.setVisibility(View.GONE);
            return;
        }

        if (!card.installed.installed) {
            card.statusText.setText("Latest " + release.tag);
            card.statusText.setTextColor(TEAL);
            preparePrimaryButton(app, card, release, "Install");
            return;
        }

        int comparison = compareVersions(normalizeVersion(card.installed.versionName), normalizeVersion(release.tag));
        if (comparison < 0) {
            card.statusText.setText("Update available: " + card.installed.versionName + " -> " + release.tag);
            card.statusText.setTextColor(AMBER);
            preparePrimaryButton(app, card, release, "Update");
        }
        else {
            card.statusText.setText("Up to date: " + card.installed.versionName);
            card.statusText.setTextColor(GREEN);
            card.primaryButton.setVisibility(View.GONE);
        }
    }

    private void preparePrimaryButton(AppInfo app, AppCard card, ReleaseInfo release, String label) {
        card.primaryButton.setText(label);
        card.primaryButton.setVisibility(View.VISIBLE);
        card.primaryButton.setEnabled(true);
        card.primaryButton.setOnClickListener(v -> downloadAndInstallAsync(app, card, release));
    }

    private void downloadAndInstallAsync(AppInfo app, AppCard card, ReleaseInfo release) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getPackageManager().canRequestPackageInstalls()) {
            card.statusText.setText("Allow SoftSmith Store to install apps, then tap again.");
            card.statusText.setTextColor(AMBER);
            Intent settings = new Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getPackageName())
            );
            startActivity(settings);
            return;
        }

        card.primaryButton.setEnabled(false);
        card.primaryButton.setText("Downloading...");
        card.statusText.setText("Downloading " + release.assetName + "...");
        card.statusText.setTextColor(TEAL);

        new Thread(() -> {
            try {
                File apk = downloadApk(app, release);
                runOnUiThread(() -> {
                    card.primaryButton.setEnabled(true);
                    card.primaryButton.setText("Install");
                    card.statusText.setText("Downloaded. Confirm install in Android.");
                    card.statusText.setTextColor(GREEN);
                    installApk(apk);
                });
            }
            catch (Exception ex) {
                runOnUiThread(() -> {
                    card.primaryButton.setEnabled(true);
                    card.primaryButton.setText("Try again");
                    card.statusText.setText("Download failed: " + ex.getClass().getSimpleName());
                    card.statusText.setTextColor(AMBER);
                });
            }
        }).start();
    }

    private File downloadApk(AppInfo app, ReleaseInfo release) throws Exception {
        File downloads = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (downloads == null) {
            downloads = getCacheDir();
        }
        if (!downloads.exists() && !downloads.mkdirs()) {
            throw new IllegalStateException("Could not create download folder.");
        }

        String fileName = app.id + "-" + release.tag.replaceAll("[^A-Za-z0-9._-]", "-") + ".apk";
        File output = new File(downloads, fileName);

        HttpURLConnection connection = null;
        try {
            URL url = new URL(release.assetUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(30000);
            connection.setRequestProperty("Accept", "application/octet-stream");
            connection.setRequestProperty("User-Agent", "SoftSmith-Store");

            int code = connection.getResponseCode();
            if (code < 200 || code > 299) {
                throw new IllegalStateException("Download returned " + code);
            }

            try (InputStream input = connection.getInputStream();
                 FileOutputStream outputStream = new FileOutputStream(output)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = input.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, read);
                }
            }
        }
        finally {
            if (connection != null) {
                connection.disconnect();
            }
        }

        return output;
    }

    private void installApk(File apk) {
        Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", apk);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    private void openInstalledApp(AppInfo app) {
        Intent launch = getPackageManager().getLaunchIntentForPackage(app.packageName);
        if (launch != null) {
            startActivity(launch);
        }
    }

    private void openUninstall(AppInfo app, TextView status) {
        status.setText("Uninstall the old copy, then return here and tap Install.");
        status.setTextColor(AMBER);
        Intent intent = new Intent(Intent.ACTION_DELETE, Uri.parse("package:" + app.packageName));
        startActivity(intent);
    }

    private ReleaseInfo fetchLatestRelease(AppInfo app) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(app.latestReleaseApiUrl());
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            connection.setRequestProperty("Accept", "application/vnd.github+json");
            connection.setRequestProperty("User-Agent", "SoftSmith-Store");

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
                return ReleaseInfo.unavailable("Latest release has no tag.");
            }

            JSONArray assets = json.optJSONArray("assets");
            String assetUrl = "";
            String assetName = "";
            if (assets != null) {
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject asset = assets.optJSONObject(i);
                    if (asset == null) {
                        continue;
                    }
                    String name = asset.optString("name", "");
                    if (name.toLowerCase(Locale.US).endsWith(".apk")) {
                        assetName = name;
                        assetUrl = asset.optString("browser_download_url", "");
                        break;
                    }
                }
            }

            return ReleaseInfo.available(tag, assetUrl, assetName);
        }
        catch (Exception ex) {
            return ReleaseInfo.unavailable("Check failed: " + ex.getClass().getSimpleName());
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
            connection.setRequestProperty("User-Agent", "SoftSmith-Store");

            int code = connection.getResponseCode();
            if (code == 404) {
                return ReleaseInfo.unavailable("Repo not created yet.");
            }
            if (code >= 200 && code <= 299) {
                return ReleaseInfo.unavailable("Repo exists, no release yet.");
            }
            return ReleaseInfo.unavailable("Repo check returned " + code);
        }
        catch (Exception ex) {
            return ReleaseInfo.unavailable("Repo check failed: " + ex.getClass().getSimpleName());
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
            long code = Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode;
            return new InstalledInfo(true, info.versionName == null ? "0.0.0" : info.versionName, code);
        }
        catch (PackageManager.NameNotFoundException ex) {
            return new InstalledInfo(false, "", 0);
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
        panel.addView(text(heading, 17, INK, Typeface.BOLD));
        TextView content = text(body, 14, MUTED, Typeface.NORMAL);
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
        params.setMargins(0, 0, 0, dp(10));
        panel.setLayoutParams(params);
        return panel;
    }

    private Button button(String label, int color) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextColor(Color.WHITE);
        button.setTextSize(13);
        button.setAllCaps(false);
        button.setMinHeight(dp(42));
        button.setMinimumHeight(dp(42));
        button.setBackgroundColor(color);

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
        final String tagline;
        final int iconRes;

        AppInfo(String name, String id, String owner, String repo, String packageName, String tagline, int iconRes) {
            this.name = name;
            this.id = id;
            this.owner = owner;
            this.repo = repo;
            this.packageName = packageName;
            this.tagline = tagline;
            this.iconRes = iconRes;
        }

        String latestReleaseApiUrl() {
            return "https://api.github.com/repos/" + owner + "/" + repo + "/releases/latest";
        }

        String repoApiUrl() {
            return "https://api.github.com/repos/" + owner + "/" + repo;
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
        final String assetUrl;
        final String assetName;
        final String message;

        ReleaseInfo(boolean available, String tag, String assetUrl, String assetName, String message) {
            this.available = available;
            this.tag = tag;
            this.assetUrl = assetUrl;
            this.assetName = assetName;
            this.message = message;
        }

        static ReleaseInfo available(String tag, String assetUrl, String assetName) {
            return new ReleaseInfo(true, tag, assetUrl, assetName, "");
        }

        static ReleaseInfo unavailable(String message) {
            return new ReleaseInfo(false, "", "", "", message);
        }
    }

    private static class AppCard {
        final LinearLayout view;
        final TextView statusText;
        final Button primaryButton;
        final InstalledInfo installed;

        AppCard(LinearLayout view, TextView statusText, Button primaryButton, InstalledInfo installed) {
            this.view = view;
            this.statusText = statusText;
            this.primaryButton = primaryButton;
            this.installed = installed;
        }
    }
}
