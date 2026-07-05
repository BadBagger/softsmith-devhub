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
        versionCode = 6
        versionName = "1.0.5-app-pages"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
