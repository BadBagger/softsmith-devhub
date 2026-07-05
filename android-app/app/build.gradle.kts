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
        versionCode = 3
        versionName = "1.0.2-in-app-updates"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
