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
        versionCode = 19
        versionName = "1.0.18-github-403-fallback"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
