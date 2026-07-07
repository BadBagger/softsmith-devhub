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
        versionCode = 31
        versionName = "2.1.8-ui-refresh"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
