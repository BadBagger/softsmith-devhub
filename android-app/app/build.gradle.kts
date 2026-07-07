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
        versionCode = 22
        versionName = "2.0.0-version-compare"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
