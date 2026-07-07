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
        versionCode = 29
        versionName = "2.1.6-order-radar-forecast-add"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
}
