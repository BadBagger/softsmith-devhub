package com.softsmith.devhub;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.ViewParent;
import android.widget.Button;
import android.widget.HorizontalScrollView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.window.OnBackInvokedDispatcher;

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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {
    private static final int BG = Color.rgb(15, 16, 18);
    private static final int SURFACE = Color.rgb(26, 28, 31);
    private static final int SURFACE_2 = Color.rgb(35, 38, 42);
    private static final int INK = Color.rgb(245, 247, 250);
    private static final int MUTED = Color.rgb(177, 184, 193);
    private static final int LINE = Color.rgb(57, 61, 66);
    private static final int BLUE = Color.rgb(168, 199, 250);
    private static final int GREEN = Color.rgb(80, 210, 139);
    private static final int AMBER = Color.rgb(250, 188, 90);

    private LinearLayout updatesList;
    private LinearLayout appList;
    private TextView updatesStatus;
    private int pendingReleaseChecks = 0;
    private int updateCount = 0;
    private int releaseCheckRunId = 0;
    private boolean showingDetailPage = false;

    private final AppInfo[] apps = new AppInfo[] {
        new AppInfo("Smithware Studios", "softsmith-devhub", "BadBagger", "softsmith-devhub", "com.softsmith.devhub", "Private app updates", "Tools", "Update this hub and every Smithware app from one place.", R.drawable.devhub_logo, R.drawable.preview_devhub, Color.rgb(0, 180, 220)),
        new AppInfo("Workday Planner", "workday-planner", "BadBagger", "workday-planner", "com.example.workdayplanner", "Daily planning", "Productivity", "Plan the workday, track priorities, and keep momentum visible.", R.drawable.workday_logo, R.drawable.preview_workday, Color.rgb(130, 180, 255)),
        new AppInfo("Renewal Radar", "renewal-radar", "BadBagger", "renewal-radar", "com.renewalradar.app", "Renewal tracking", "Finance", "Track subscriptions, renewals, due dates, and local reminders.", R.drawable.renewal_logo, R.drawable.preview_renewal, Color.rgb(255, 194, 67)),
        new AppInfo("Fridge Finish", "fridge-finish", "BadBagger", "fridge-finish", "com.fridgefinish.app", "Food reminders", "Home", "Know what to finish first and cut down wasted groceries.", R.drawable.fridge_logo, R.drawable.preview_fridge, Color.rgb(81, 220, 140)),
        new AppInfo("Paycheck Pilot", "paycheck-pilot", "BadBagger", "paycheck-pilot", "com.paycheckpilot", "Bills before payday", "Finance", "See what is safe to spend after bills, payday, and buffer money are accounted for.", R.drawable.paycheck_logo, R.drawable.preview_paycheck, Color.rgb(34, 197, 94)),
        new AppInfo("ClearCart", "clearcart", "BadBagger", "clearcart", "com.clearcart.app", "Clear the cart clutter", "Shopping", "Keep grocery and shopping lists clean, focused, and ready to finish.", R.drawable.clearcart_logo, R.drawable.preview_clearcart, Color.rgb(16, 185, 129)),
        new AppInfo("PivotFit", "pivotfit", "BadBagger", "pivotfit", "com.pivotfit.app", "Train around real life", "Fitness", "Builds workouts around today's time, energy, equipment, soreness, location, and schedule.", R.drawable.pivotfit_logo, R.drawable.preview_pivotfit, Color.rgb(182, 255, 59)),
        new AppInfo("Order Radar", "order-radar", "BadBagger", "order-radar", "com.smithware.orderradar", "Forecast orders before you run out", "Work", "Count what is on hand, forecast movement to the next truck, build order drafts, and review delivery surprises.", R.drawable.order_radar_logo, R.drawable.preview_order_radar, Color.rgb(69, 160, 126), "v0.4.3-delivery-check", "OrderRadar.apk"),
        new AppInfo("Printout Scanner Pro", "printout-scanner-pro", "BadBagger", "printout-scanner-pro", "com.smithware.printoutscannerpro", "Scan printouts into trackers", "Work", "Turn training reports and workplace printouts into editable local trackers with OCR review and priority follow-up.", R.drawable.printout_scanner_logo, R.drawable.preview_printout_scanner, Color.rgb(152, 222, 16), "v0.1.0-mvp", "PrintoutScannerPro.apk"),
        new AppInfo("BuildSmith Studio", "buildsmith", "BadBagger", "buildsmith", "com.smithware.buildsmith", "Turn app ideas into build-ready prompts", "Tools", "Run the Smithware loop from idea to Codex build, logo, screenshots, update prompts, Play Store checklist, and the next app.", R.drawable.buildsmith_logo, R.drawable.preview_buildsmith, Color.rgb(231, 121, 43), "v0.2.1-prompt-tagline-layout", "BuildSmith.apk"),
        new AppInfo("ManagerMeet", "managermeet", "BadBagger", "managermeet", "com.smithware.managermeet", "Turn app ideas into build-ready plans", "Tools", "Plan manager-focused Android MVPs with launch checklists, progress tracking, saved items, and Codex-ready prompt export.", R.drawable.managermeet_logo, R.drawable.preview_managermeet, Color.rgb(255, 138, 61), "v0.1.0-mvp", "ManagerMeet.apk"),
        new AppInfo("Codex Buddy", "codex-buddy", "BadBagger", "codex-buddy", "com.softsmith.codexbuddy", "Codex status bridge", "Tools", "Show live Codex activity bubbles and phone notifications while existing Codex work runs.", R.drawable.codexbuddy_logo, R.drawable.preview_codexbuddy, Color.rgb(70, 214, 181), "v0.2.1-panel-history", "CodexBuddy.apk"),
        new AppInfo("Kid Chaos Calendar", "kid-chaos-calendar", "BadBagger", "kid-chaos-calendar", "com.softsmith.kidchaoscalendar", "Family rhythm", "Family", "Coordinate kid schedules, family tasks, and the daily chaos.", R.drawable.kidchaos_logo, R.drawable.preview_kidchaos, Color.rgb(130, 180, 255)),
        new AppInfo("IconSmith Studio Mobile", "iconsmith-studio-mobile", "BadBagger", "iconsmith-studio-mobile", "com.softsmith.iconsmithstudio", "Mobile icon tools", "Design", "Shape, preview, and manage mobile app icon ideas.", R.drawable.iconsmith_logo, R.drawable.preview_iconsmith, Color.rgb(0, 220, 230)),
        new AppInfo("FolderSmith Mobile", "foldersmith-mobile", "BadBagger", "foldersmith-mobile", "com.foldersmith.mobile", "Safe file organization", "Tools", "Scan, review, and organize files safely before anything changes.", R.drawable.foldersmith_logo, R.drawable.preview_foldersmith, Color.rgb(0, 220, 230))
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTitle("Smithware Studios");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    this::handleBackNavigation
            );
        }
        setContentView(buildHomeContent());
    }

    @Override
    public void onBackPressed() {
        handleBackNavigation();
    }

    private void handleBackNavigation() {
        if (showingDetailPage) {
            setContentView(buildHomeContent());
        }
        else {
            finish();
        }
    }

    private View buildHomeContent() {
        showingDetailPage = false;
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(BG);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(22), dp(20), dp(22), dp(34));
        scroll.addView(root);

        root.addView(toolbar(false, "Private Apps"));
        root.addView(statusPanel());
        root.addView(sectionHeader("Updates available", "Check updates"));
        updatesStatus = text("Checking releases...", 14, MUTED, Typeface.NORMAL);
        updatesStatus.setPadding(0, 0, 0, dp(8));
        root.addView(updatesStatus);

        updatesList = new LinearLayout(this);
        updatesList.setOrientation(LinearLayout.VERTICAL);
        root.addView(updatesList);

        root.addView(sectionHeader("All apps", "Check updates"));
        appList = new LinearLayout(this);
        appList.setOrientation(LinearLayout.VERTICAL);
        root.addView(appList);

        root.addView(helpPanel());
        refreshAppCards();
        return scroll;
    }

    private View toolbar(boolean detailPage, String titleText) {
        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(0, dp(4), 0, dp(24));

        TextView back = text("<", 32, INK, Typeface.NORMAL);
        back.setGravity(Gravity.CENTER);
        back.setOnClickListener(v -> {
            if (detailPage) {
                handleBackNavigation();
            }
            else {
                finish();
            }
        });
        bar.addView(back, new LinearLayout.LayoutParams(dp(42), dp(42)));

        LinearLayout title = new LinearLayout(this);
        title.setOrientation(LinearLayout.VERTICAL);
        title.setPadding(dp(8), 0, 0, 0);
        bar.addView(title, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        title.addView(text("Smithware Studios", 14, BLUE, Typeface.BOLD));
        title.addView(text(titleText, 32, INK, Typeface.NORMAL));

        ImageView mark = new ImageView(this);
        mark.setImageResource(R.drawable.devhub_logo);
        mark.setPadding(dp(4), dp(4), dp(4), dp(4));
        mark.setBackground(round(SURFACE_2, 18, LINE, 1));
        bar.addView(mark, new LinearLayout.LayoutParams(dp(54), dp(54)));
        return bar;
    }

    private View statusPanel() {
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.HORIZONTAL);
        panel.setGravity(Gravity.CENTER_VERTICAL);
        panel.setPadding(dp(16), dp(14), dp(16), dp(14));
        panel.setBackground(round(SURFACE, 22, LINE, 1));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, 0, dp(20));
        panel.setLayoutParams(params);

        panel.addView(summaryBlock("Apps", String.valueOf(apps.length)));
        panel.addView(summaryBlock("Track", "Internal"));
        panel.addView(summaryBlock("Updates", "Auto check"));
        return panel;
    }

    private View summaryBlock(String label, String value) {
        LinearLayout block = new LinearLayout(this);
        block.setOrientation(LinearLayout.VERTICAL);
        block.setGravity(Gravity.CENTER);
        TextView valueText = text(value, 15, INK, Typeface.BOLD);
        valueText.setGravity(Gravity.CENTER);
        TextView labelText = text(label, 12, MUTED, Typeface.NORMAL);
        labelText.setGravity(Gravity.CENTER);
        block.addView(valueText);
        block.addView(labelText);
        block.setLayoutParams(new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        return block;
    }

    private void refreshAppCards() {
        updateCount = 0;
        releaseCheckRunId++;
        pendingReleaseChecks = apps.length;
        updatesList.removeAllViews();
        updatesStatus.setText("Checking releases...");
        updatesStatus.setTextColor(MUTED);
        appList.removeAllViews();

        for (AppInfo app : apps) {
            AppCard card = appRow(app);
            appList.addView(card.view);
            checkReleaseAsync(app, card);
        }
    }

    private void openAppDetail(AppInfo app) {
        setContentView(buildDetailContent(app));
    }

    private View buildDetailContent(AppInfo app) {
        showingDetailPage = true;
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(BG);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(22), dp(20), dp(22), dp(34));
        scroll.addView(root);

        root.addView(toolbar(true, "App details"));

        AppCard hero = featuredCard(app);
        root.addView(hero.view);
        checkReleaseAsync(app, hero);

        root.addView(sectionHeader("Mockups", null));
        root.addView(mockupRail(app));

        root.addView(reviewPanel(app));
        root.addView(helpPanel());

        return scroll;
    }

    private View mockupRail(AppInfo app) {
        HorizontalScrollView scroll = new HorizontalScrollView(this);
        scroll.setHorizontalScrollBarEnabled(false);

        LinearLayout rail = new LinearLayout(this);
        rail.setOrientation(LinearLayout.HORIZONTAL);
        rail.setPadding(0, dp(6), 0, dp(24));
        scroll.addView(rail);

        rail.addView(mockupTile(app.previewRes, "Overview"));
        rail.addView(mockupTile(app.previewRes, "Update flow"));
        rail.addView(mockupTile(app.previewRes, "Review"));
        return scroll;
    }

    private View mockupTile(int imageRes, String label) {
        LinearLayout tile = new LinearLayout(this);
        tile.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(dp(180), LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, dp(14), 0);
        tile.setLayoutParams(params);

        ImageView image = new ImageView(this);
        image.setImageResource(imageRes);
        image.setScaleType(ImageView.ScaleType.CENTER_CROP);
        image.setBackground(round(SURFACE_2, 18));
        tile.addView(image, new LinearLayout.LayoutParams(dp(180), dp(240)));

        TextView text = text(label, 13, INK, Typeface.BOLD);
        text.setPadding(0, dp(8), 0, 0);
        tile.addView(text);
        return tile;
    }

    private View reviewPanel(AppInfo app) {
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setPadding(0, dp(8), 0, dp(18));

        panel.addView(text("Ratings and reviews", 24, INK, Typeface.BOLD));

        LinearLayout rating = new LinearLayout(this);
        rating.setOrientation(LinearLayout.HORIZONTAL);
        rating.setGravity(Gravity.CENTER_VERTICAL);
        rating.setPadding(0, dp(18), 0, dp(8));
        panel.addView(rating);

        TextView score = text("4.8", 52, INK, Typeface.NORMAL);
        rating.addView(score, new LinearLayout.LayoutParams(dp(104), LinearLayout.LayoutParams.WRAP_CONTENT));

        LinearLayout bars = new LinearLayout(this);
        bars.setOrientation(LinearLayout.VERTICAL);
        rating.addView(bars, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        bars.addView(ratingLine("5", 86));
        bars.addView(ratingLine("4", 62));
        bars.addView(ratingLine("3", 24));
        bars.addView(ratingLine("2", 12));
        bars.addView(ratingLine("1", 6));

        TextView summary = text("Users can leave notes, report bugs, and help shape what ships next. Reviews are stored as GitHub issues for now so nothing private is hidden inside the app.", 15, MUTED, Typeface.NORMAL);
        summary.setLineSpacing(dp(3), 1.0f);
        summary.setPadding(0, dp(14), 0, dp(16));
        panel.addView(summary);

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        panel.addView(actions);

        Button review = pillButton("Write review", SURFACE, BLUE, false);
        review.setOnClickListener(v -> openUrl(app.reviewUrl()));
        actions.addView(review, new LinearLayout.LayoutParams(0, dp(48), 1));

        Button bug = pillButton("Report bug", SURFACE, AMBER, false);
        bug.setOnClickListener(v -> openUrl(app.bugUrl()));
        LinearLayout.LayoutParams bugParams = new LinearLayout.LayoutParams(0, dp(48), 1);
        bugParams.setMargins(dp(12), 0, 0, 0);
        actions.addView(bug, bugParams);

        return panel;
    }

    private View ratingLine(String label, int percent) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(0, dp(3), 0, dp(3));

        TextView number = text(label, 12, MUTED, Typeface.BOLD);
        row.addView(number, new LinearLayout.LayoutParams(dp(18), LinearLayout.LayoutParams.WRAP_CONTENT));

        LinearLayout track = new LinearLayout(this);
        track.setBackground(round(SURFACE_2, 5));
        row.addView(track, new LinearLayout.LayoutParams(0, dp(8), 1));

        TextView fill = new TextView(this);
        fill.setBackground(round(BLUE, 5));
        track.addView(fill, new LinearLayout.LayoutParams(Math.max(dp(10), dp(percent * 2)), dp(8)));
        return row;
    }

    private AppCard featuredCard(AppInfo app) {
        InstalledInfo installed = getInstalledInfo(app.packageName);

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(0, 0, 0, dp(28));

        TextView maker = text("Smithware Studios", 15, BLUE, Typeface.BOLD);
        card.addView(maker);

        TextView title = text(app.name, 39, INK, Typeface.NORMAL);
        title.setPadding(0, dp(4), 0, dp(14));
        card.addView(title);

        LinearLayout stats = new LinearLayout(this);
        stats.setOrientation(LinearLayout.HORIZONTAL);
        stats.setGravity(Gravity.CENTER_VERTICAL);
        card.addView(stats);

        ImageView icon = new ImageView(this);
        icon.setImageResource(app.iconRes);
        stats.addView(icon, new LinearLayout.LayoutParams(dp(74), dp(74)));

        stats.addView(statBlock("Private", "Smithware"));
        stats.addView(statBlock(installed.installed ? "Installed" : "Ready", app.category));
        stats.addView(statBlock("Internal", "Track"));

        LinearLayout buttons = new LinearLayout(this);
        buttons.setOrientation(LinearLayout.HORIZONTAL);
        buttons.setPadding(0, dp(22), 0, dp(14));
        card.addView(buttons);

        Button primary = pillButton(installed.installed ? "Checking..." : "Install", BLUE, Color.rgb(20, 28, 38), true);
        primary.setEnabled(false);
        buttons.addView(primary, new LinearLayout.LayoutParams(0, dp(56), 1));

        Button open = pillButton("Open", SURFACE, BLUE, false);
        open.setVisibility(installed.installed && !app.packageName.equals(getPackageName()) ? View.VISIBLE : View.GONE);
        open.setOnClickListener(v -> openInstalledApp(app));
        LinearLayout.LayoutParams openParams = new LinearLayout.LayoutParams(0, dp(56), 1);
        openParams.setMargins(dp(14), 0, 0, 0);
        buttons.addView(open, openParams);

        ImageView preview = new ImageView(this);
        preview.setImageResource(app.previewRes);
        preview.setScaleType(ImageView.ScaleType.CENTER_CROP);
        preview.setAdjustViewBounds(false);
        preview.setClipToOutline(true);
        preview.setBackground(round(SURFACE_2, 22));
        preview.setOnClickListener(v -> openAppDetail(app));
        card.addView(preview, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(230)));

        TextView aboutTitle = text("About this app", 22, INK, Typeface.BOLD);
        aboutTitle.setPadding(0, dp(24), 0, dp(10));
        card.addView(aboutTitle);
        card.addView(text(app.description, 16, MUTED, Typeface.NORMAL));

        LinearLayout chips = new LinearLayout(this);
        chips.setOrientation(LinearLayout.HORIZONTAL);
        chips.setPadding(0, dp(16), 0, dp(8));
        card.addView(chips);
        chips.addView(chip(app.category));
        chips.addView(chip("Updates"));
        chips.addView(chip("APK"));

        TextView status = text(installed.installed ? "Installed " + installed.versionName : "Not installed", 14, installed.installed ? GREEN : AMBER, Typeface.BOLD);
        status.setPadding(0, dp(8), 0, 0);
        card.addView(status);

        return new AppCard(card, status, primary, installed, false, -1);
    }

    private AppCard appRow(AppInfo app) {
        InstalledInfo installed = getInstalledInfo(app.packageName);

        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.VERTICAL);
        row.setPadding(dp(14), dp(14), dp(14), dp(14));
        row.setBackground(round(SURFACE, 22, LINE, 1));
        row.setOnClickListener(v -> openAppDetail(app));
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        rowParams.setMargins(0, 0, 0, dp(12));
        row.setLayoutParams(rowParams);

        LinearLayout main = new LinearLayout(this);
        main.setOrientation(LinearLayout.HORIZONTAL);
        main.setGravity(Gravity.CENTER_VERTICAL);
        row.addView(main);

        ImageView icon = new ImageView(this);
        icon.setImageResource(app.iconRes);
        main.addView(icon, new LinearLayout.LayoutParams(dp(66), dp(66)));

        LinearLayout copy = new LinearLayout(this);
        copy.setOrientation(LinearLayout.VERTICAL);
        copy.setPadding(dp(14), 0, 0, 0);
        main.addView(copy, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        copy.addView(text(app.name, 17, INK, Typeface.BOLD));
        copy.addView(text(app.tagline + " - " + app.category, 13, MUTED, Typeface.NORMAL));

        TextView status = text(installed.installed ? "Installed " + installed.versionName : "Not installed", 13, installed.installed ? GREEN : AMBER, Typeface.BOLD);
        status.setPadding(0, dp(5), 0, 0);
        copy.addView(status);

        Button primary = pillButton(installed.installed ? "Checking..." : "Install", BLUE, Color.rgb(20, 28, 38), true);
        primary.setEnabled(false);
        primary.setVisibility(installed.installed ? View.GONE : View.VISIBLE);
        LinearLayout.LayoutParams primaryParams = new LinearLayout.LayoutParams(dp(104), dp(42));
        primaryParams.setMargins(dp(10), 0, 0, 0);
        main.addView(primary, primaryParams);

        LinearLayout extras = new LinearLayout(this);
        extras.setOrientation(LinearLayout.HORIZONTAL);
        extras.setGravity(Gravity.CENTER_VERTICAL);
        extras.setPadding(dp(80), dp(12), 0, 0);
        row.addView(extras);

        Button open = tinyButton("Open");
        open.setVisibility(installed.installed && !app.packageName.equals(getPackageName()) ? View.VISIBLE : View.GONE);
        open.setOnClickListener(v -> openInstalledApp(app));
        extras.addView(open);

        Button repair = tinyButton("Repair");
        repair.setVisibility(installed.installed ? View.VISIBLE : View.GONE);
        repair.setOnClickListener(v -> openUninstall(app, status));
        extras.addView(repair);

        return new AppCard(row, status, primary, installed, true, releaseCheckRunId);
    }

    private View previewRail() {
        HorizontalScrollView scroll = new HorizontalScrollView(this);
        scroll.setHorizontalScrollBarEnabled(false);

        LinearLayout rail = new LinearLayout(this);
        rail.setOrientation(LinearLayout.HORIZONTAL);
        rail.setPadding(0, dp(6), 0, dp(24));
        scroll.addView(rail);

        for (AppInfo app : apps) {
            LinearLayout item = new LinearLayout(this);
            item.setOrientation(LinearLayout.VERTICAL);
            item.setOnClickListener(v -> openAppDetail(app));
            LinearLayout.LayoutParams itemParams = new LinearLayout.LayoutParams(dp(142), LinearLayout.LayoutParams.WRAP_CONTENT);
            itemParams.setMargins(0, 0, dp(14), 0);
            rail.addView(item, itemParams);

            ImageView image = new ImageView(this);
            image.setImageResource(app.previewRes);
            image.setScaleType(ImageView.ScaleType.CENTER_CROP);
            image.setBackground(round(SURFACE_2, 18));
            item.addView(image, new LinearLayout.LayoutParams(dp(142), dp(190)));

            TextView name = text(app.shortName(), 13, INK, Typeface.BOLD);
            name.setPadding(0, dp(8), 0, 0);
            item.addView(name);
        }
        return scroll;
    }

    private View sectionHeader(String title, String action) {
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(0, dp(10), 0, dp(10));

        TextView titleView = text(title, 21, INK, Typeface.BOLD);
        header.addView(titleView, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));

        if (action != null) {
            TextView actionView = text(action, 14, BLUE, Typeface.BOLD);
            actionView.setGravity(Gravity.CENTER);
            actionView.setPadding(dp(12), dp(8), dp(12), dp(8));
            actionView.setBackground(round(SURFACE, 18, LINE, 1));
            header.addView(actionView);
            header.setOnClickListener(v -> refreshAppCards());
        }
        return header;
    }

    private TextView statBlock(String value, String label) {
        TextView stat = text(value + "\n" + label, 13, INK, Typeface.BOLD);
        stat.setGravity(Gravity.CENTER);
        stat.setPadding(dp(16), 0, 0, 0);
        return stat;
    }

    private View helpPanel() {
        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setPadding(dp(18), dp(18), dp(18), dp(18));
        panel.setBackground(round(SURFACE, 24));

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, dp(14), 0, 0);
        panel.setLayoutParams(params);

        panel.addView(text("Install help", 18, INK, Typeface.BOLD));
        TextView body = text("If Android says a package conflicts with an existing package, tap Repair, uninstall the old copy, then return here and install again.", 14, MUTED, Typeface.NORMAL);
        body.setPadding(0, dp(8), 0, 0);
        body.setLineSpacing(dp(3), 1.0f);
        panel.addView(body);
        return panel;
    }

    private TextView chip(String label) {
        TextView chip = text(label, 13, INK, Typeface.BOLD);
        chip.setGravity(Gravity.CENTER);
        chip.setPadding(dp(16), dp(9), dp(16), dp(9));
        chip.setBackground(round(BG, 12, LINE, 1));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, dp(10), 0);
        chip.setLayoutParams(params);
        return chip;
    }

    private Button tinyButton(String label) {
        Button button = pillButton(label, BG, BLUE, false);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(36));
        params.setMargins(0, 0, dp(8), 0);
        button.setLayoutParams(params);
        return button;
    }

    private Button pillButton(String label, int background, int textColor, boolean filled) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextColor(textColor);
        button.setTextSize(14);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setAllCaps(false);
        button.setMinHeight(0);
        button.setMinimumHeight(0);
        button.setPadding(dp(12), 0, dp(12), 0);
        button.setBackground(filled ? round(background, 28) : round(background, 28, LINE, 1));
        return button;
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
            finishReleaseCheck(card);
            return;
        }

        if (release.assetUrl.trim().isEmpty()) {
            card.statusText.setText("Latest " + release.tag + ", no APK attached");
            card.statusText.setTextColor(AMBER);
            card.primaryButton.setVisibility(View.GONE);
            finishReleaseCheck(card);
            return;
        }

        if (!card.installed.installed) {
            card.statusText.setText("Latest " + release.tag);
            card.statusText.setTextColor(BLUE);
            preparePrimaryButton(app, card, release, "Install");
            finishReleaseCheck(card);
            return;
        }

        int comparison = compareVersions(normalizeVersion(card.installed.versionName), normalizeVersion(release.tag));
        if (comparison < 0) {
            card.statusText.setText("Update available: " + release.tag);
            card.statusText.setTextColor(AMBER);
            preparePrimaryButton(app, card, release, "Update");
            promoteToUpdates(card);
        }
        else {
            card.statusText.setText("Up to date: " + card.installed.versionName);
            card.statusText.setTextColor(GREEN);
            card.primaryButton.setVisibility(View.GONE);
        }
        finishReleaseCheck(card);
    }

    private void promoteToUpdates(AppCard card) {
        if (!isCurrentHomeCard(card) || card.inUpdates || updatesList == null) {
            return;
        }

        ViewParent parent = card.view.getParent();
        if (parent instanceof LinearLayout) {
            ((LinearLayout) parent).removeView(card.view);
        }
        updatesList.addView(card.view);
        card.inUpdates = true;
        updateCount++;
        updatesStatus.setText(updateCount == 1 ? "1 update ready" : updateCount + " updates ready");
        updatesStatus.setTextColor(AMBER);
    }

    private void finishReleaseCheck(AppCard card) {
        if (!isCurrentHomeCard(card) || pendingReleaseChecks <= 0) {
            return;
        }

        pendingReleaseChecks--;
        if (pendingReleaseChecks == 0 && updateCount == 0 && updatesStatus != null) {
            updatesStatus.setText("No updates available.");
            updatesStatus.setTextColor(GREEN);
        }
    }

    private boolean isCurrentHomeCard(AppCard card) {
        return card.homeRow && card.runId == releaseCheckRunId;
    }

    private void preparePrimaryButton(AppInfo app, AppCard card, ReleaseInfo release, String label) {
        card.primaryButton.setText(label);
        card.primaryButton.setVisibility(View.VISIBLE);
        card.primaryButton.setEnabled(true);
        card.primaryButton.setOnClickListener(v -> downloadAndInstallAsync(app, card, release));
    }

    private void downloadAndInstallAsync(AppInfo app, AppCard card, ReleaseInfo release) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getPackageManager().canRequestPackageInstalls()) {
            card.statusText.setText("Allow Smithware Studios to install apps, then tap again.");
            card.statusText.setTextColor(AMBER);
            Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()));
            startActivity(settings);
            return;
        }

        card.primaryButton.setEnabled(false);
        card.primaryButton.setText("Downloading...");
        card.statusText.setText("Downloading " + release.assetName + "...");
        card.statusText.setTextColor(BLUE);

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
            connection.setRequestProperty("User-Agent", "Smithware-Studios");

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

    private void openUrl(String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        startActivity(intent);
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
            connection.setRequestProperty("User-Agent", "Smithware-Studios");

            int code = connection.getResponseCode();
            if (code == 404) {
                ReleaseInfo webRelease = fetchLatestReleaseFromWeb(app);
                if (webRelease.available) {
                    return webRelease;
                }
                if (app.hasPinnedRelease()) {
                    return app.pinnedRelease();
                }
                return fetchRepoExists(app);
            }
            if (code == 403) {
                ReleaseInfo webRelease = fetchLatestReleaseFromWeb(app);
                if (webRelease.available) {
                    return webRelease;
                }
                if (app.hasPinnedRelease()) {
                    return app.pinnedRelease();
                }
                return ReleaseInfo.unavailable("GitHub API limited. Tap releases.");
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

    private ReleaseInfo fetchLatestReleaseFromWeb(AppInfo app) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(app.latestReleaseWebUrl());
            connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(true);
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            connection.setRequestProperty("Accept", "text/html");
            connection.setRequestProperty("User-Agent", "Smithware-Studios");

            int code = connection.getResponseCode();
            if (code < 200 || code > 299) {
                return ReleaseInfo.unavailable("Release page returned " + code);
            }

            String finalPath = connection.getURL().getPath();
            String marker = "/releases/tag/";
            int markerIndex = finalPath.indexOf(marker);
            if (markerIndex < 0) {
                return ReleaseInfo.unavailable("No release published yet.");
            }
            String tag = Uri.decode(finalPath.substring(markerIndex + marker.length()));
            if (tag.trim().isEmpty()) {
                return ReleaseInfo.unavailable("Latest release has no tag.");
            }

            String assetUrl = fetchExpandedAssetsApkUrl(app, tag);
            String assetName = assetUrl.isEmpty() ? "" : assetUrl.substring(assetUrl.lastIndexOf('/') + 1);
            return ReleaseInfo.available(tag, assetUrl, assetName);
        }
        catch (Exception ex) {
            return ReleaseInfo.unavailable("Release page failed: " + ex.getClass().getSimpleName());
        }
        finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private String fetchExpandedAssetsApkUrl(AppInfo app, String tag) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(app.expandedAssetsWebUrl(tag));
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            connection.setRequestProperty("Accept", "text/html");
            connection.setRequestProperty("User-Agent", "Smithware-Studios");

            int code = connection.getResponseCode();
            if (code < 200 || code > 299) {
                return "";
            }

            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
            reader.close();
            return findFirstApkDownloadUrl(body.toString());
        }
        catch (Exception ex) {
            return "";
        }
        finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private String findFirstApkDownloadUrl(String html) {
        Matcher matcher = Pattern.compile("href=\"([^\"]*/releases/download/[^\"]+?\\.apk)\"").matcher(html);
        if (!matcher.find()) {
            return "";
        }

        String url = matcher.group(1).replace("&amp;", "&");
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        if (url.startsWith("/")) {
            return "https://github.com" + url;
        }
        return "";
    }

    private ReleaseInfo fetchRepoExists(AppInfo app) {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(app.repoApiUrl());
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(8000);
            connection.setRequestProperty("Accept", "application/vnd.github+json");
            connection.setRequestProperty("User-Agent", "Smithware-Studios");

            int code = connection.getResponseCode();
            if (code == 404) {
                if (app.hasPinnedRelease()) {
                    return app.pinnedRelease();
                }
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
        Matcher matcher = Pattern.compile("^(\\d+)").matcher(part);
        if (!matcher.find()) {
            return 0;
        }
        return Integer.parseInt(matcher.group(1));
    }

    private String normalizeVersion(String value) {
        String cleaned = value.toLowerCase(Locale.US).trim();
        if (cleaned.startsWith("v")) {
            cleaned = cleaned.substring(1);
        }
        return cleaned;
    }

    private GradientDrawable round(int color, int radiusDp) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(dp(radiusDp));
        return drawable;
    }

    private GradientDrawable round(int color, int radiusDp, int strokeColor, int strokeDp) {
        GradientDrawable drawable = round(color, radiusDp);
        drawable.setStroke(dp(strokeDp), strokeColor);
        return drawable;
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
        final String category;
        final String description;
        final int iconRes;
        final int previewRes;
        final int accent;
        final String pinnedReleaseTag;
        final String pinnedAssetName;

        AppInfo(String name, String id, String owner, String repo, String packageName, String tagline, String category, String description, int iconRes, int previewRes, int accent) {
            this(name, id, owner, repo, packageName, tagline, category, description, iconRes, previewRes, accent, "", "");
        }

        AppInfo(String name, String id, String owner, String repo, String packageName, String tagline, String category, String description, int iconRes, int previewRes, int accent, String pinnedReleaseTag, String pinnedAssetName) {
            this.name = name;
            this.id = id;
            this.owner = owner;
            this.repo = repo;
            this.packageName = packageName;
            this.tagline = tagline;
            this.category = category;
            this.description = description;
            this.iconRes = iconRes;
            this.previewRes = previewRes;
            this.accent = accent;
            this.pinnedReleaseTag = pinnedReleaseTag;
            this.pinnedAssetName = pinnedAssetName;
        }

        String latestReleaseApiUrl() {
            return "https://api.github.com/repos/" + owner + "/" + repo + "/releases/latest";
        }

        String latestReleaseWebUrl() {
            return "https://github.com/" + owner + "/" + repo + "/releases/latest";
        }

        String expandedAssetsWebUrl(String tag) {
            return "https://github.com/" + owner + "/" + repo + "/releases/expanded_assets/" + tag;
        }

        String repoApiUrl() {
            return "https://api.github.com/repos/" + owner + "/" + repo;
        }

        String reviewUrl() {
            String title = "Review: " + name;
            String body = "What I liked:\n\nWhat I want improved:\n\nRating:";
            return "https://github.com/" + owner + "/" + repo + "/issues/new?title=" + Uri.encode(title) + "&body=" + Uri.encode(body);
        }

        String bugUrl() {
            String title = "Bug: " + name;
            String body = "What happened:\n\nSteps to reproduce:\n1.\n2.\n3.\n\nExpected result:\n\nPhone model / Android version:";
            return "https://github.com/" + owner + "/" + repo + "/issues/new?title=" + Uri.encode(title) + "&body=" + Uri.encode(body);
        }

        boolean hasPinnedRelease() {
            return !pinnedReleaseTag.trim().isEmpty() && !pinnedAssetName.trim().isEmpty();
        }

        ReleaseInfo pinnedRelease() {
            String url = "https://github.com/" + owner + "/" + repo + "/releases/download/" + pinnedReleaseTag + "/" + pinnedAssetName;
            return ReleaseInfo.available(pinnedReleaseTag, url, pinnedAssetName);
        }

        String shortName() {
            return name.replace(" Mobile", "").replace("Smithware Studios ", "").replace("SoftSmith ", "");
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
        final boolean homeRow;
        final int runId;
        boolean inUpdates = false;

        AppCard(LinearLayout view, TextView statusText, Button primaryButton, InstalledInfo installed, boolean homeRow, int runId) {
            this.view = view;
            this.statusText = statusText;
            this.primaryButton = primaryButton;
            this.installed = installed;
            this.homeRow = homeRow;
            this.runId = runId;
        }
    }
}
