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
        versionCode = 21
        versionName = "1.0.20-smithware-icons"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
