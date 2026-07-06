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
        versionCode = 15
        versionName = "1.0.14-codex-buddy"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
