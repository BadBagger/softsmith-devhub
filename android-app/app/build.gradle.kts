plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.softsmith.devhub"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.softsmith.devhub"
        minSdk = 26
        targetSdk = 36
        versionCode = 18
        versionName = "1.0.17-codex-buddy-status-bridge"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
