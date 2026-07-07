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
        versionCode = 24
        versionName = "2.1.1-order-radar-status"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
